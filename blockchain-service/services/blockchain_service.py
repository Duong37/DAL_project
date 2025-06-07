"""
Blockchain Service

This service wraps the existing blockchain logic and provides a clean interface
for storing and retrieving data from the blockchain.
"""

import json
import time
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from blockchain.besu_blockchain import BesuBlockchain
from models.blockchain_models import (
    TransactionResponse, BlockInfo, ChainStatus, 
    VotingResult, ModelUpdate
)

logger = logging.getLogger(__name__)

class BlockchainService:
    """
    Blockchain Service
    
    This service provides a clean interface for blockchain operations,
    wrapping the underlying Besu IBFT blockchain implementation.
    """
    
    def __init__(self):
        """Initialize the blockchain service with Besu IBFT network."""
        # Initialize Besu blockchain with all 4 validator nodes
        self.blockchain = BesuBlockchain([
            "http://localhost:8545",  # Node-1 
            "http://localhost:8546",  # Node-2
            "http://localhost:8547",  # Node-3
            "http://localhost:8548"   # Node-4
        ])
        self.voting_results: Dict[str, Dict[str, Any]] = {}
        self.model_updates: List[Dict[str, Any]] = []
        
        logger.info("Blockchain service initialized with Besu IBFT network")
    
    async def initialize(self):
        """Initialize the blockchain service and connect to Besu network."""
        logger.info("Initializing blockchain service and connecting to Besu IBFT network...")
        try:
            await self.blockchain.initialize()
            logger.info("Successfully connected to Besu IBFT network")
        except Exception as e:
            logger.error(f"Failed to connect to Besu network: {str(e)}")
            raise
    
    async def store_transaction(self, data: Dict[str, Any]) -> TransactionResponse:
        """
        Store a generic transaction on the blockchain.
        
        Args:
            data: Transaction data to store
            
        Returns:
            Transaction response with ID and status
        """
        try:
            # Add timestamp if not present
            if 'timestamp' not in data:
                data['timestamp'] = datetime.now().isoformat()
            
            # Store transaction using the blockchain
            tx_id = await self.blockchain.store_transaction(data)
            
            return TransactionResponse(
                status="success",
                transaction_id=tx_id,
                timestamp=data['timestamp'],
                message="Transaction stored successfully"
            )
            
        except Exception as e:
            logger.error(f"Failed to store transaction: {str(e)}")
            raise
    
    async def get_transaction(self, tx_id: str) -> Dict[str, Any]:
        """
        Retrieve a transaction by ID.
        
        Args:
            tx_id: Transaction ID
            
        Returns:
            Transaction data
        """
        try:
            transaction_data = await self.blockchain.retrieve_transaction(tx_id)
            
            return {
                "status": "success",
                "transaction_id": tx_id,
                "data": transaction_data
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve transaction {tx_id}: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def store_voting_result(self, voting_data: Dict[str, Any]) -> TransactionResponse:
        """
        Store voting results on the blockchain.
        
        Args:
            voting_data: Voting result data
            
        Returns:
            Transaction response
        """
        try:
            # Add metadata for voting transaction
            transaction_data = {
                "type": "voting_result",
                "session_id": voting_data["session_id"],
                "sample_id": voting_data["sample_id"],
                "final_label": voting_data["final_label"],
                "vote_count": voting_data["vote_count"],
                "consensus_reached": voting_data["consensus_reached"],
                "votes": voting_data["votes"],
                "timestamp": voting_data.get("timestamp", datetime.now().isoformat())
            }
            
            # Store on blockchain
            tx_id = await self.blockchain.store_transaction(transaction_data)
            
            # Store in local cache for quick retrieval
            self.voting_results[voting_data["session_id"]] = {
                **voting_data,
                "transaction_id": tx_id,
                "stored_at": datetime.now().isoformat()
            }
            
            return TransactionResponse(
                status="success",
                transaction_id=tx_id,
                timestamp=transaction_data["timestamp"],
                message="Voting result stored successfully"
            )
            
        except Exception as e:
            logger.error(f"Failed to store voting result: {str(e)}")
            raise
    
    async def get_voting_result(self, session_id: str) -> VotingResult:
        """
        Retrieve voting results by session ID.
        
        Args:
            session_id: Voting session ID
            
        Returns:
            Voting result data
        """
        try:
            if session_id in self.voting_results:
                data = self.voting_results[session_id]
                return VotingResult(**data)
            else:
                raise ValueError(f"Voting result for session {session_id} not found")
                
        except Exception as e:
            logger.error(f"Failed to retrieve voting result {session_id}: {str(e)}")
            raise
    
    async def store_model_update(self, update_data: Dict[str, Any]) -> TransactionResponse:
        """
        Store model update information on the blockchain.
        
        Args:
            update_data: Model update data
            
        Returns:
            Transaction response
        """
        try:
            # Add metadata for model update transaction
            transaction_data = {
                "type": "model_update",
                "experiment_id": update_data["experiment_id"],
                "update_type": update_data["update_type"],
                "samples_processed": update_data["samples_processed"],
                "performance_metrics": update_data["performance_metrics"],
                "model_info": update_data["model_info"],
                "timestamp": update_data.get("timestamp", datetime.now().isoformat())
            }
            
            # Store on blockchain
            tx_id = await self.blockchain.store_transaction(transaction_data)
            
            # Store in local cache
            model_update = {
                **update_data,
                "transaction_id": tx_id,
                "stored_at": datetime.now().isoformat()
            }
            self.model_updates.append(model_update)
            
            return TransactionResponse(
                status="success",
                transaction_id=tx_id,
                timestamp=transaction_data["timestamp"],
                message="Model update stored successfully"
            )
            
        except Exception as e:
            logger.error(f"Failed to store model update: {str(e)}")
            raise
    
    async def get_model_updates(self, limit: int = 10) -> List[ModelUpdate]:
        """
        Get recent model updates.
        
        Args:
            limit: Maximum number of updates to return
            
        Returns:
            List of model updates
        """
        try:
            # Return most recent updates
            recent_updates = self.model_updates[-limit:] if len(self.model_updates) > limit else self.model_updates
            return [ModelUpdate(**update) for update in reversed(recent_updates)]
            
        except Exception as e:
            logger.error(f"Failed to retrieve model updates: {str(e)}")
            raise
    
    async def get_chain_status(self) -> ChainStatus:
        """
        Get blockchain status and statistics.
        
        Returns:
            Chain status information
        """
        try:
            status = await self.blockchain.get_chain_status()
            
            return ChainStatus(
                total_blocks=status.get("latest_block", {}).get("number", 0),
                total_transactions=status.get("latest_block", {}).get("transactions", 0),
                latest_block_hash=status.get("latest_block", {}).get("hash", ""),
                chain_valid=status.get("status") == "healthy",
                last_update=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Failed to get chain status: {str(e)}")
            raise
    
    async def get_recent_blocks(self, limit: int = 10) -> List[BlockInfo]:
        """
        Get recent blocks from the blockchain.
        
        Args:
            limit: Maximum number of blocks to return
            
        Returns:
            List of block information
        """
        try:
            blocks = await self.blockchain.get_recent_blocks(limit)
            
            result = []
            for i, block in enumerate(blocks):
                # For Besu blocks, we need to map the fields correctly
                previous_hash = ""
                if i < len(blocks) - 1:
                    previous_hash = blocks[i + 1]["hash"]
                elif block["number"] > 0:
                    # Get the previous block hash if this isn't the first block
                    previous_hash = f"0x{'0' * 64}"  # Placeholder for previous hash
                
                result.append(BlockInfo(
                    index=block["number"],
                    hash=block["hash"],
                    previous_hash=previous_hash,
                    timestamp=float(block["timestamp"]),
                    transaction_count=block["transaction_count"],
                    transactions=[]  # We don't fetch full transaction details for performance
                ))
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get recent blocks: {str(e)}")
            raise
    
    async def verify_chain_integrity(self) -> Dict[str, Any]:
        """
        Verify blockchain integrity.
        
        Returns:
            Verification result
        """
        try:
            is_valid = self.blockchain.verify_chain()
            
            return {
                "status": "success",
                "chain_valid": is_valid,
                "verified_at": datetime.now().isoformat(),
                "message": "Chain is valid" if is_valid else "Chain integrity compromised"
            }
            
        except Exception as e:
            logger.error(f"Failed to verify chain integrity: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def reset_blockchain(self) -> Dict[str, Any]:
        """
        Reset the blockchain (development only).
        
        Returns:
            Reset result
        """
        try:
            logger.info("Resetting blockchain...")
            
            # Reset blockchain
            self.blockchain = BesuBlockchain([
                "http://localhost:8545",  # Node-1 
                "http://localhost:8546",  # Node-2
                "http://localhost:8547",  # Node-3
                "http://localhost:8548"   # Node-4
            ])
            
            # Clear caches
            self.voting_results.clear()
            self.model_updates.clear()
            
            return {
                "status": "success",
                "message": "Blockchain reset successfully",
                "reset_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to reset blockchain: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            } 