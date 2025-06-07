"""
Blockchain Service Models

Pydantic models for API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class TransactionRequest(BaseModel):
    """Request model for storing a generic transaction."""
    data: Dict[str, Any] = Field(..., description="Transaction data to store")
    transaction_type: Optional[str] = Field(None, description="Type of transaction")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class VotingRequest(BaseModel):
    """Request model for storing voting results."""
    session_id: str = Field(..., description="Voting session identifier")
    sample_id: str = Field(..., description="Sample being voted on")
    votes: List[Dict[str, Any]] = Field(..., description="List of votes")
    final_label: int = Field(..., description="Final consensus label")
    vote_count: int = Field(..., description="Total number of votes")
    consensus_reached: bool = Field(..., description="Whether consensus was reached")
    timestamp: Optional[str] = Field(None, description="Voting timestamp")

class ModelUpdateRequest(BaseModel):
    """Request model for storing model updates."""
    experiment_id: str = Field(..., description="Experiment identifier")
    update_type: str = Field(..., description="Type of update (initial, incremental)")
    samples_processed: List[str] = Field(..., description="List of sample IDs processed")
    performance_metrics: Dict[str, float] = Field(..., description="Model performance metrics")
    model_info: Dict[str, Any] = Field(..., description="Model configuration and state")
    timestamp: Optional[str] = Field(None, description="Update timestamp")

class TransactionResponse(BaseModel):
    """Response model for transaction operations."""
    status: str = Field(..., description="Operation status")
    transaction_id: str = Field(..., description="Unique transaction identifier")
    block_hash: Optional[str] = Field(None, description="Hash of the block containing the transaction")
    timestamp: str = Field(..., description="Transaction timestamp")
    message: Optional[str] = Field(None, description="Additional message")

class BlockInfo(BaseModel):
    """Information about a blockchain block."""
    index: int = Field(..., description="Block index in the chain")
    hash: str = Field(..., description="Block hash")
    previous_hash: str = Field(..., description="Previous block hash")
    timestamp: float = Field(..., description="Block creation timestamp")
    transaction_count: int = Field(..., description="Number of transactions in the block")
    transactions: List[Dict[str, Any]] = Field(..., description="List of transactions")

class ChainStatus(BaseModel):
    """Blockchain status information."""
    total_blocks: int = Field(..., description="Total number of blocks")
    total_transactions: int = Field(..., description="Total number of transactions")
    latest_block_hash: str = Field(..., description="Hash of the latest block")
    chain_valid: bool = Field(..., description="Whether the chain is valid")
    last_update: str = Field(..., description="Timestamp of last update")

class VotingResult(BaseModel):
    """Voting result information."""
    session_id: str = Field(..., description="Voting session identifier")
    sample_id: str = Field(..., description="Sample that was voted on")
    final_label: int = Field(..., description="Final consensus label")
    vote_count: int = Field(..., description="Total number of votes")
    consensus_reached: bool = Field(..., description="Whether consensus was reached")
    votes: List[Dict[str, Any]] = Field(..., description="Individual votes")
    stored_at: str = Field(..., description="When the result was stored")
    transaction_id: str = Field(..., description="Blockchain transaction ID")

class ModelUpdate(BaseModel):
    """Model update information."""
    experiment_id: str = Field(..., description="Experiment identifier")
    update_type: str = Field(..., description="Type of update")
    samples_processed: List[str] = Field(..., description="Samples processed in this update")
    performance_metrics: Dict[str, float] = Field(..., description="Performance metrics")
    model_info: Dict[str, Any] = Field(..., description="Model information")
    stored_at: str = Field(..., description="When the update was stored")
    transaction_id: str = Field(..., description="Blockchain transaction ID") 