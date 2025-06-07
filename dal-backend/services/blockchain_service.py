"""
Blockchain Service for DAL Framework

This service manages interactions with the Ethereum-compatible blockchain
running the DAL smart contract.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class BlockchainService:
    """Service for interacting with the DAL smart contract on blockchain."""
    
    def __init__(self):
        """Initialize the blockchain service."""
        self.web3 = None
        self.contract = None
        self.account = None
        self.contract_address = None
        self.contract_abi = None
        
        # Load configuration
        self._load_config()
        
    def _load_config(self):
        """Load blockchain configuration."""
        # Default configuration for Besu IBFT network
        self.config = {
            'rpc_url': 'http://localhost:8545',
            'chain_id': 1337,
            'gas_limit': 4700000,
            'gas_price': 1000000000,  # 1 gwei
            # Pre-funded account from genesis
            'private_key': '8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
        }
        
        # Load from environment if available
        self.config['rpc_url'] = os.getenv('BLOCKCHAIN_RPC_URL', self.config['rpc_url'])
        self.config['private_key'] = os.getenv('BLOCKCHAIN_PRIVATE_KEY', self.config['private_key'])
        
        # Load contract deployment info
        self._load_contract_info()
        
    def _load_contract_info(self):
        """Load contract address and ABI from deployment files."""
        try:
            # Load deployment info
            deployment_path = Path(__file__).parent.parent.parent / 'dal-contracts' / 'deployment.json'
            if deployment_path.exists():
                with open(deployment_path, 'r') as f:
                    deployment_info = json.load(f)
                    self.contract_address = deployment_info['contractAddress']
                    logger.info(f"Loaded contract address: {self.contract_address}")
            
            # Load contract ABI
            artifacts_path = Path(__file__).parent.parent.parent / 'dal-contracts' / 'artifacts' / 'contracts' / 'DALStorage.sol' / 'DALStorage.json'
            if artifacts_path.exists():
                with open(artifacts_path, 'r') as f:
                    artifact = json.load(f)
                    self.contract_abi = artifact['abi']
                    logger.info("Loaded contract ABI")
                    
        except Exception as e:
            logger.error(f"Failed to load contract info: {e}")
            raise
    
    async def initialize(self):
        """Initialize Web3 connection and contract."""
        try:
            # Initialize Web3
            self.web3 = Web3(Web3.HTTPProvider(self.config['rpc_url']))
            
            # Add POA middleware for IBFT consensus
            self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            # Check connection by trying to get chain ID
            try:
                chain_id = self.web3.eth.chain_id
                logger.info(f"Connected to blockchain at {self.config['rpc_url']}")
                logger.info(f"Chain ID: {chain_id}")
            except Exception:
                raise Exception("Failed to connect to blockchain")
            
            # Initialize account
            self.account = Account.from_key(self.config['private_key'])
            logger.info(f"Using account: {self.account.address}")
            
            # Get account balance
            balance = self.web3.eth.get_balance(self.account.address)
            logger.info(f"Account balance: {self.web3.from_wei(balance, 'ether')} ETH")
            
            # Initialize contract
            if self.contract_address and self.contract_abi:
                self.contract = self.web3.eth.contract(
                    address=self.contract_address,
                    abi=self.contract_abi
                )
                logger.info("Contract initialized successfully")
            else:
                raise Exception("Contract address or ABI not found")
                
        except Exception as e:
            logger.error(f"Failed to initialize blockchain service: {e}")
            raise
    
    async def get_status(self) -> Dict[str, Any]:
        """Get blockchain status."""
        try:
            latest_block = self.web3.eth.get_block('latest')
            balance = self.web3.eth.get_balance(self.account.address)
            
            # Check if connected by trying to get chain ID
            try:
                chain_id = self.web3.eth.chain_id
                connected = True
            except Exception:
                connected = False
            
            # Get contract stats
            stats = await self.get_contract_stats()
            
            return {
                'connected': connected,
                'chain_id': chain_id if connected else None,
                'latest_block': {
                    'number': latest_block.number,
                    'timestamp': latest_block.timestamp,
                    'hash': latest_block.hash.hex()
                },
                'account': {
                    'address': self.account.address,
                    'balance_eth': float(self.web3.from_wei(balance, 'ether'))
                },
                'contract': {
                    'address': self.contract_address,
                    'stats': stats
                }
            }
        except Exception as e:
            logger.error(f"Failed to get blockchain status: {e}")
            raise
    
    async def get_contract_stats(self) -> Dict[str, Any]:
        """Get contract statistics."""
        try:
            # Call contract methods to get stats
            total_data = self.contract.functions.totalDataEntries().call()
            total_voting = self.contract.functions.totalVotingResults().call()
            total_updates = self.contract.functions.totalModelUpdates().call()
            owner = self.contract.functions.owner().call()
            
            return {
                'total_data_entries': total_data,
                'total_voting_results': total_voting,
                'total_model_updates': total_updates,
                'owner': owner
            }
        except Exception as e:
            logger.error(f"Failed to get contract stats: {e}")
            raise
    
    async def store_data(self, data_type: str, json_data: str) -> str:
        """Store generic data on blockchain."""
        try:
            # Build transaction
            transaction = self.contract.functions.storeData(
                data_type,
                json_data
            ).build_transaction({
                'from': self.account.address,
                'gas': self.config['gas_limit'],
                'gasPrice': self.config['gas_price'],
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.web3.eth.account.sign_transaction(transaction, self.config['private_key'])
            tx_hash = self.web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Get the data ID from events
            data_stored_event = self.contract.events.DataStored().process_receipt(receipt)
            data_id = data_stored_event[0]['args']['dataId'].hex() if data_stored_event else None
            
            logger.info(f"Data stored on blockchain. TX: {tx_hash.hex()}")
            
            return {
                'transaction_hash': tx_hash.hex(),
                'block_number': receipt.blockNumber,
                'data_id': data_id,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            logger.error(f"Failed to store data on blockchain: {e}")
            raise
    
    async def store_voting_result(self, session_id: str, sample_id: str, final_label: int, 
                                vote_count: int, consensus_reached: bool, votes_json: str) -> str:
        """Store voting result on blockchain."""
        try:
            # Build transaction
            transaction = self.contract.functions.storeVotingResult(
                session_id,
                sample_id,
                final_label,
                vote_count,
                consensus_reached,
                votes_json
            ).build_transaction({
                'from': self.account.address,
                'gas': self.config['gas_limit'],
                'gasPrice': self.config['gas_price'],
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.web3.eth.account.sign_transaction(transaction, self.config['private_key'])
            tx_hash = self.web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            logger.info(f"Voting result stored on blockchain. TX: {tx_hash.hex()}")
            
            return {
                'transaction_hash': tx_hash.hex(),
                'block_number': receipt.blockNumber,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            logger.error(f"Failed to store voting result on blockchain: {e}")
            raise
    
    async def store_model_update(self, experiment_id: str, update_type: str,
                               samples_processed: str, performance_metrics: str,
                               model_info: str) -> str:
        """Store model update on blockchain."""
        try:
            # Build transaction
            transaction = self.contract.functions.storeModelUpdate(
                experiment_id,
                update_type,
                samples_processed,
                performance_metrics,
                model_info
            ).build_transaction({
                'from': self.account.address,
                'gas': self.config['gas_limit'],
                'gasPrice': self.config['gas_price'],
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.web3.eth.account.sign_transaction(transaction, self.config['private_key'])
            tx_hash = self.web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Generate the update ID (same as contract logic)
            # updateId = keccak256(abi.encodePacked(experimentId, updateType, block.timestamp, msg.sender))
            block = self.web3.eth.get_block(receipt.blockNumber)
            update_id = self.web3.keccak(
                text=experiment_id + update_type + str(block.timestamp) + self.account.address.lower()
            ).hex()
            
            logger.info(f"Model update stored on blockchain. TX: {tx_hash.hex()}")
            
            return {
                'transaction_hash': tx_hash.hex(),
                'block_number': receipt.blockNumber,
                'update_id': update_id,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            logger.error(f"Failed to store model update on blockchain: {e}")
            raise
    
    async def get_data(self, data_id: str) -> Dict[str, Any]:
        """Retrieve data from blockchain."""
        try:
            # Convert hex string to bytes32
            data_id_bytes = bytes.fromhex(data_id.replace('0x', ''))
            
            # Call contract to get data
            result = self.contract.functions.getData(data_id_bytes).call()
            
            return {
                'data_type': result[0],
                'json_data': result[1],
                'sender': result[2],
                'timestamp': result[3]
            }
            
        except Exception as e:
            logger.error(f"Failed to get data from blockchain: {e}")
            raise
    
    async def get_voting_result(self, session_id: str) -> Dict[str, Any]:
        """Get voting result from blockchain."""
        try:
            # Call contract to get voting result
            result = self.contract.functions.votingResults(session_id).call()
            
            return {
                'session_id': result[0],
                'sample_id': result[1],
                'final_label': result[2],
                'vote_count': result[3],
                'consensus_reached': result[4],
                'votes_json': result[5],
                'timestamp': result[6],
                'exists': result[7]
            }
            
        except Exception as e:
            logger.error(f"Failed to get voting result from blockchain: {e}")
            raise
    
    async def get_recent_blocks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent blockchain blocks."""
        try:
            latest_block_num = self.web3.eth.block_number
            blocks = []
            
            for i in range(min(limit, latest_block_num + 1)):
                block_num = latest_block_num - i
                block = self.web3.eth.get_block(block_num, full_transactions=True)
                
                blocks.append({
                    'number': block.number,
                    'hash': block.hash.hex(),
                    'timestamp': block.timestamp,
                    'transaction_count': len(block.transactions),
                    'gas_used': block.gasUsed,
                    'size': block.size
                })
            
            return blocks
            
        except Exception as e:
            logger.error(f"Failed to get recent blocks: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """Check blockchain service health."""
        try:
            # Try to get the latest block to verify connectivity
            latest_block = self.web3.eth.get_block('latest')
            return {
                "status": "healthy",
                "latest_block": latest_block.number,
                "chain_id": self.web3.eth.chain_id
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def store_transaction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Store transaction data on blockchain using the generic store_data method."""
        try:
            json_data = json.dumps(data)
            result = await self.store_data("transaction", json_data)
            return {
                "status": "success",
                "transaction_id": result["data_id"],
                "blockchain_tx": result["transaction_hash"]
            }
        except Exception as e:
            logger.error(f"Failed to store transaction: {e}")
            raise
    
    async def get_chain_status(self) -> Dict[str, Any]:
        """Get blockchain chain status."""
        return await self.get_status()
    
    async def get_model_updates(self, limit: int = 10) -> Dict[str, Any]:
        """Get recent model updates from blockchain."""
        try:
            # This is a simplified implementation
            # In a real scenario, you might want to query events or maintain an index
            recent_blocks = await self.get_recent_blocks(limit * 2)
            
            return {
                "status": "success",
                "updates": [],  # Would contain parsed model updates from blockchain
                "message": "Model updates retrieval not fully implemented yet"
            }
        except Exception as e:
            logger.error(f"Failed to get model updates: {e}")
            raise
    
    async def reset_blockchain(self) -> Dict[str, Any]:
        """Reset blockchain (not applicable for our setup)."""
        return {
            "status": "error",
            "message": "Blockchain reset not supported on live network"
        } 