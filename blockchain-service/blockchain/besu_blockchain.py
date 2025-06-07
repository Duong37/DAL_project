"""
Besu Blockchain Implementation

This module provides a Besu blockchain adapter that interfaces with:
1. Hyperledger Besu IBFT network
2. DALStorage smart contract
3. Real blockchain transaction management
4. Network consensus mechanisms
"""

from typing import Dict, Any, List, Optional
import json
import time
import hashlib
from datetime import datetime
import logging
import asyncio
from web3 import Web3
from web3.exceptions import TransactionNotFound, BlockNotFound, ContractLogicError
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class BesuBlockchain:
    """
    Besu blockchain adapter for the DAL system.
    
    This adapter interfaces with the Hyperledger Besu IBFT network:
    - Smart contract interactions with DALStorage
    - Transaction management and validation
    - Network consensus validation
    - Multi-node failover support
    """
    
    def __init__(self, node_urls: List[str] = None, contract_address: str = None):
        """
        Initialize the Besu blockchain adapter.
        
        Args:
            node_urls: List of Besu node RPC endpoints
            contract_address: Address of deployed DALStorage contract
        """
        self.node_urls = node_urls or [
            "http://localhost:8545",  # Node-1
            "http://localhost:8546",  # Node-2  
            "http://localhost:8547",  # Node-3
            "http://localhost:8548"   # Node-4
        ]
        
        self.web3_instances = []
        self.current_node_index = 0
        
        # Smart contract configuration
        self.contract_address = contract_address
        self.contract = None
        self.contract_abi = None
        
        # Pre-funded account for transactions (from genesis)
        self.account_address = Web3.to_checksum_address("0xfe3b557e8fb62b89f4916b721be55ceb828dbd73")
        self.private_key = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
        
        logger.info(f"Besu blockchain adapter initialized with {len(self.node_urls)} nodes")
    
    async def initialize(self):
        """Initialize connections to all Besu nodes and load smart contract."""
        # Connect to nodes
        for url in self.node_urls:
            try:
                web3 = Web3(Web3.HTTPProvider(url))
                if await self._test_connection(web3):
                    self.web3_instances.append(web3)
                    logger.info(f"Connected to Besu node: {url}")
                else:
                    logger.warning(f"Failed to connect to Besu node: {url}")
            except Exception as e:
                logger.error(f"Error connecting to {url}: {str(e)}")
        
        if not self.web3_instances:
            raise Exception("Failed to connect to any Besu nodes")
        
        # Verify network is IBFT
        await self._verify_network()
        
        # Load and initialize smart contract
        await self._load_smart_contract()
    
    async def _load_smart_contract(self):
        """Load the DALStorage smart contract."""
        try:
            # Load contract address from deployment file if not provided
            if not self.contract_address:
                deployment_file = Path(__file__).parent.parent.parent / "dal-contracts" / "deployment.json"
                if deployment_file.exists():
                    with open(deployment_file, 'r') as f:
                        deployment_info = json.load(f)
                        self.contract_address = deployment_info.get('contractAddress')
                        logger.info(f"Loaded contract address from deployment: {self.contract_address}")
            
            if not self.contract_address:
                logger.warning("No contract address provided. Smart contract features will be limited.")
                return
            
            # Load contract ABI from compiled artifacts
            artifacts_path = Path(__file__).parent.parent.parent / "dal-contracts" / "artifacts" / "contracts" / "DALStorage.sol" / "DALStorage.json"
            if artifacts_path.exists():
                with open(artifacts_path, 'r') as f:
                    artifact = json.load(f)
                    self.contract_abi = artifact['abi']
                    logger.info("Loaded contract ABI from artifacts")
            else:
                # Fallback: minimal ABI for basic functions
                self.contract_abi = self._get_minimal_abi()
                logger.warning("Using minimal ABI - compile contracts for full functionality")
            
            # Initialize contract instance
            web3 = self._get_web3()
            self.contract = web3.eth.contract(
                address=self.contract_address,
                abi=self.contract_abi
            )
            
            # Verify contract is working
            await self._verify_contract()
            logger.info("Smart contract initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to load smart contract: {str(e)}")
            logger.warning("Continuing without smart contract - using basic blockchain functionality")
    
    def _get_minimal_abi(self):
        """Get minimal ABI for DALStorage contract."""
        return [
            {
                "inputs": [{"type": "string", "name": "dataType"}, {"type": "string", "name": "jsonData"}],
                "name": "storeData",
                "outputs": [{"type": "bytes32", "name": "dataId"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"type": "bytes32", "name": "dataId"}],
                "name": "getData",
                "outputs": [
                    {"type": "string", "name": "dataType"},
                    {"type": "string", "name": "jsonData"},
                    {"type": "address", "name": "sender"},
                    {"type": "uint256", "name": "timestamp"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getStats",
                "outputs": [
                    {"type": "uint256", "name": "dataEntries"},
                    {"type": "uint256", "name": "votingResults"},
                    {"type": "uint256", "name": "modelUpdates"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    async def _verify_contract(self):
        """Verify the smart contract is working."""
        if not self.contract:
            return
        
        try:
            # Call a view function to test
            stats = self.contract.functions.getStats().call()
            logger.info(f"Contract stats: {stats[0]} data entries, {stats[1]} voting results, {stats[2]} model updates")
        except Exception as e:
            logger.error(f"Contract verification failed: {str(e)}")
            raise
    
    async def _test_connection(self, web3: Web3) -> bool:
        """Test connection to a Besu node."""
        try:
            # Check if node is responsive
            block_number = web3.eth.block_number
            chain_id = web3.eth.chain_id
            
            logger.info(f"Node responsive - Block: {block_number}, Chain ID: {chain_id}")
            return True
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False
    
    async def _verify_network(self):
        """Verify we're connected to the correct IBFT network."""
        web3 = self._get_web3()
        
        try:
            # Verify chain ID matches our IBFT network
            chain_id = web3.eth.chain_id
            if chain_id != 1337:
                logger.warning(f"Unexpected chain ID: {chain_id}, expected 1337")
            
            # Get IBFT validators
            validators = await self._get_validators()
            logger.info(f"IBFT network verified with {len(validators)} validators")
            
        except Exception as e:
            logger.error(f"Network verification failed: {str(e)}")
            raise
    
    def _get_web3(self) -> Web3:
        """Get the current Web3 instance with failover."""
        if not self.web3_instances:
            raise Exception("No available Besu nodes")
        
        # Try current node first
        web3 = self.web3_instances[self.current_node_index]
        try:
            # Quick connectivity test
            web3.eth.block_number
            return web3
        except Exception:
            # Try next node
            self.current_node_index = (self.current_node_index + 1) % len(self.web3_instances)
            return self.web3_instances[self.current_node_index]
    
    async def _get_validators(self) -> List[str]:
        """Get current IBFT validators."""
        web3 = self._get_web3()
        
        try:
            # Call IBFT RPC method to get validators
            response = web3.manager.request_blocking(
                "ibft_getValidatorsByBlockNumber", 
                ["latest"]
            )
            return response
        except Exception as e:
            logger.error(f"Failed to get validators: {str(e)}")
            return []
    
    async def store_transaction(self, tx_data: Dict[str, Any]) -> str:
        """
        Store a transaction using the DALStorage smart contract.
        
        Args:
            tx_data: Dictionary containing transaction data
            
        Returns:
            str: Transaction hash for future reference
        """
        web3 = self._get_web3()
        
        try:
            if self.contract:
                # Use smart contract to store data
                return await self._store_via_contract(tx_data)
            else:
                # Fallback: store as basic transaction
                return await self._store_basic_transaction(tx_data)
                
        except Exception as e:
            logger.error(f"Failed to store transaction: {str(e)}")
            raise
    
    async def _store_via_contract(self, tx_data: Dict[str, Any]) -> str:
        """Store data using the DALStorage smart contract."""
        web3 = self._get_web3()
        
        # Determine data type
        data_type = tx_data.get('type', 'generic')
        
        # Convert data to JSON string
        json_data = json.dumps(tx_data, default=str)
        
        try:
            # Build transaction
            function_call = self.contract.functions.storeData(data_type, json_data)
            
            # Estimate gas
            gas_estimate = function_call.estimate_gas({'from': self.account_address})
            
            # Build transaction
            transaction = function_call.build_transaction({
                'from': self.account_address,
                'gas': int(gas_estimate * 1.2),  # Add 20% buffer
                'gasPrice': web3.to_wei('1', 'gwei'),
                'nonce': web3.eth.get_transaction_count(self.account_address)
            })
            
            # Sign and send transaction
            signed_txn = web3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            # Wait for transaction to be mined
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                logger.info(f"Data stored in smart contract - Block: {receipt.blockNumber}, Gas used: {receipt.gasUsed}")
                return tx_hash.hex()
            else:
                raise Exception("Transaction failed")
                
        except ContractLogicError as e:
            logger.error(f"Smart contract error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Transaction failed: {str(e)}")
            raise
    
    async def _store_basic_transaction(self, tx_data: Dict[str, Any]) -> str:
        """Store data as a basic blockchain transaction (fallback)."""
        web3 = self._get_web3()
        
        # Create a simple transaction with data in the input field
        data_string = json.dumps(tx_data, default=str)
        data_hex = Web3.to_hex(text=f"DAL:{data_string}")
        
        transaction = {
            'to': self.account_address,  # Self-transaction
            'value': 0,
            'gas': 50000,
            'gasPrice': web3.to_wei('1', 'gwei'),
            'nonce': web3.eth.get_transaction_count(self.account_address),
            'data': data_hex
        }
        
        # Sign and send transaction
        signed_txn = web3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for transaction to be mined
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        logger.info(f"Basic transaction stored - Block: {receipt.blockNumber}")
        
        return tx_hash.hex()
    
    async def retrieve_transaction(self, tx_id_or_hash: str) -> Dict[str, Any]:
        """
        Retrieve transaction data from the Besu blockchain.
        
        Args:
            tx_id_or_hash: Transaction ID or hash to retrieve
            
        Returns:
            Dict: Transaction data if found
        """
        web3 = self._get_web3()
        
        try:
            if self.contract and not tx_id_or_hash.startswith('0x'):
                # Try to retrieve from smart contract using data ID
                return await self._retrieve_from_contract(tx_id_or_hash)
            else:
                # Retrieve using transaction hash
                return await self._retrieve_basic_transaction(tx_id_or_hash)
                
        except Exception as e:
            logger.error(f"Failed to retrieve transaction: {str(e)}")
            raise
    
    async def _retrieve_from_contract(self, data_id: str) -> Dict[str, Any]:
        """Retrieve data from smart contract."""
        try:
            # Convert string ID to bytes32 (if needed)
            if len(data_id) == 64:  # Hex string without 0x
                data_id_bytes = bytes.fromhex(data_id)
            else:
                data_id_bytes = data_id.encode()
            
            # Call contract function
            result = self.contract.functions.getData(data_id_bytes).call()
            
            # Parse result
            data_type, json_data, sender, timestamp = result
            
            return {
                "data_type": data_type,
                "data": json.loads(json_data),
                "sender": sender,
                "timestamp": timestamp,
                "source": "smart_contract"
            }
            
        except Exception as e:
            logger.error(f"Smart contract retrieval failed: {str(e)}")
            raise ValueError(f"Data not found: {data_id}")
    
    async def _retrieve_basic_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """Retrieve basic transaction data."""
        web3 = self._get_web3()
        
        try:
            tx = web3.eth.get_transaction(tx_hash)
            receipt = web3.eth.get_transaction_receipt(tx_hash)
            
            # Extract data from transaction input
            data = {}
            if tx.input and tx.input.startswith('0x44414c3a'):  # "DAL:" in hex
                try:
                    data_string = Web3.to_text(tx.input).replace("DAL:", "")
                    data = json.loads(data_string)
                except:
                    pass
            
            return {
                "tx_hash": tx_hash,
                "block_number": receipt.blockNumber,
                "gas_used": receipt.gasUsed,
                "status": receipt.status,
                "data": data,
                "source": "basic_transaction"
            }
            
        except TransactionNotFound:
            raise ValueError(f"Transaction {tx_hash} not found on blockchain")
    
    async def get_chain_status(self) -> Dict[str, Any]:
        """Get IBFT blockchain status and statistics."""
        web3 = self._get_web3()
        
        try:
            latest_block = web3.eth.get_block('latest')
            validators = await self._get_validators()
            
            # Get smart contract stats if available
            contract_stats = {}
            if self.contract:
                try:
                    stats = self.contract.functions.getStats().call()
                    contract_stats = {
                        "data_entries": stats[0],
                        "voting_results": stats[1], 
                        "model_updates": stats[2],
                        "contract_address": self.contract_address
                    }
                except Exception as e:
                    logger.warning(f"Could not fetch contract stats: {str(e)}")
            
            return {
                "status": "healthy",
                "consensus": "IBFT 2.0",
                "chain_id": web3.eth.chain_id,
                "latest_block": {
                    "number": latest_block.number,
                    "hash": latest_block.hash.hex(),
                    "timestamp": latest_block.timestamp,
                    "transactions": len(latest_block.transactions)
                },
                "validators": {
                    "count": len(validators),
                    "addresses": validators
                },
                "network": {
                    "peer_count": web3.net.peer_count,
                    "connected_nodes": len(self.web3_instances),
                    "current_node": self.node_urls[self.current_node_index]
                },
                "smart_contract": contract_stats
            }
            
        except Exception as e:
            logger.error(f"Failed to get chain status: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def get_recent_blocks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent blocks from the IBFT blockchain."""
        web3 = self._get_web3()
        
        try:
            latest_block_number = web3.eth.block_number
            blocks = []
            
            for i in range(min(limit, latest_block_number + 1)):
                block_number = latest_block_number - i
                if block_number < 0:
                    break
                    
                block = web3.eth.get_block(block_number)
                blocks.append({
                    "number": block.number,
                    "hash": block.hash.hex(),
                    "timestamp": block.timestamp,
                    "transaction_count": len(block.transactions),
                    "gas_used": block.gasUsed,
                    "gas_limit": block.gasLimit,
                    "miner": block.miner,
                    "size": block.size
                })
            
            return blocks
            
        except Exception as e:
            logger.error(f"Failed to get recent blocks: {str(e)}")
            return []
    
    async def verify_chain(self) -> bool:
        """Verify IBFT blockchain integrity."""
        web3 = self._get_web3()
        
        try:
            # Basic verification - check if we can get latest block
            latest_block = web3.eth.get_block('latest')
            
            # Verify IBFT consensus is working (blocks are being produced)
            if latest_block.number == 0:
                logger.warning("Only genesis block found")
                return True
            
            # Check if blocks are recent (within last 30 seconds)
            current_time = int(time.time())
            block_age = current_time - latest_block.timestamp
            
            if block_age > 30:  # IBFT should produce blocks every 2 seconds
                logger.warning(f"Latest block is {block_age} seconds old")
                return False
            
            # Verify smart contract if available
            if self.contract:
                await self._verify_contract()
            
            logger.info("IBFT chain verification successful")
            return True
            
        except Exception as e:
            logger.error(f"Chain verification failed: {str(e)}")
            return False
    
    async def reset_storage(self) -> Dict[str, Any]:
        """Reset functionality (limited for real blockchain)."""
        return {
            "status": "info",
            "message": "Cannot reset blockchain data - data is immutable",
            "note": "Smart contract data persists on blockchain"
        } 