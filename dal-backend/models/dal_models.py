"""
DAL Orchestrator Models

Pydantic models for the DAL orchestrator service API.
Only includes models that are actually used by the system.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class SystemStatus(BaseModel):
    """Overall system status."""
    orchestrator_status: str = Field(..., description="Orchestrator service status")
    al_engine_status: str = Field(..., description="AL Engine service status")
    blockchain_status: str = Field(..., description="Blockchain service status")
    active_experiments: int = Field(..., description="Number of active experiments")
    total_samples_processed: int = Field(..., description="Total samples processed")
    system_uptime: str = Field(..., description="System uptime")
    last_health_check: str = Field(..., description="Last health check timestamp")

class ServiceHealth(BaseModel):
    """Health status of individual services."""
    service_name: str = Field(..., description="Name of the service")
    status: str = Field(..., description="Service status (healthy, unhealthy, unknown)")
    last_check: str = Field(..., description="Last health check timestamp")
    response_time_ms: Optional[float] = Field(None, description="Response time in milliseconds")
    error_message: Optional[str] = Field(None, description="Error message if unhealthy")

class ModelUpdate(BaseModel):
    """Model update information."""
    update_id: str = Field(..., description="Update identifier")
    experiment_id: str = Field(..., description="Experiment identifier")
    update_type: str = Field(..., description="Type of update")
    samples_processed: List[str] = Field(..., description="Samples processed")
    metrics_before: Dict[str, float] = Field(..., description="Metrics before update")
    metrics_after: Dict[str, float] = Field(..., description="Metrics after update")
    timestamp: str = Field(..., description="Update timestamp")
    blockchain_tx_id: Optional[str] = Field(None, description="Blockchain transaction ID")

class Vote(BaseModel):
    """Model for individual votes."""
    voter_id: str = Field(..., description="ID of the voter")
    label: int = Field(..., description="Voted label")
    confidence: Optional[float] = Field(None, description="Confidence in the vote")
    timestamp: Optional[str] = Field(None, description="Vote timestamp")

class VotingResult(BaseModel):
    """Voting result information."""
    session_id: str = Field(..., description="Voting session identifier")
    sample_id: str = Field(..., description="Sample that was voted on")
    final_label: int = Field(..., description="Final consensus label")
    vote_count: int = Field(..., description="Total number of votes")
    consensus_reached: bool = Field(..., description="Whether consensus was reached")
    votes: List[Vote] = Field(..., description="Individual votes")
    confidence_score: Optional[float] = Field(None, description="Overall confidence")
    timestamp: str = Field(..., description="Result timestamp")

class ExperimentConfig(BaseModel):
    """Configuration for initializing an AL experiment."""
    experiment_id: Optional[str] = Field(None, description="Unique experiment identifier")
    al_framework: Dict[str, Any] = Field(..., description="AL framework configuration")
    model: Dict[str, Any] = Field(..., description="Model configuration")
    query_strategy: Dict[str, Any] = Field(..., description="Query strategy configuration")
    dataset: Dict[str, Any] = Field(..., description="Dataset configuration")
    voting_config: Optional[Dict[str, Any]] = Field(None, description="Voting system configuration")
    blockchain_config: Optional[Dict[str, Any]] = Field(None, description="Blockchain configuration")

class LabelSubmission(BaseModel):
    """Model for submitting a label for a sample."""
    sample_id: str = Field(..., description="ID of the sample being labeled")
    label: int = Field(..., description="Label assigned to the sample")
    confidence: Optional[float] = Field(None, description="Confidence in the label")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class VotingSession(BaseModel):
    """Model for voting session configuration."""
    session_id: str = Field(..., description="Unique voting session identifier")
    sample_id: str = Field(..., description="Sample being voted on")
    voting_type: str = Field(..., description="Type of voting (majority, consensus, etc.)")
    min_votes: int = Field(3, description="Minimum number of votes required")
    max_votes: int = Field(10, description="Maximum number of votes allowed")
    timeout_minutes: int = Field(30, description="Voting timeout in minutes")

class ExperimentStatus(BaseModel):
    """Model for experiment status information."""
    experiment_id: str = Field(..., description="Experiment identifier")
    status: str = Field(..., description="Current experiment status")
    labeled_samples: int = Field(..., description="Number of labeled samples")
    unlabeled_samples: int = Field(..., description="Number of unlabeled samples")
    current_metrics: Dict[str, float] = Field(..., description="Current model metrics")
    last_updated: str = Field(..., description="Last update timestamp")

class SampleResponse(BaseModel):
    """Model for sample information response."""
    sample_id: str = Field(..., description="Sample identifier")
    features: Dict[str, float] = Field(..., description="Sample features")
    uncertainty_score: float = Field(..., description="Uncertainty score")
    predicted_label: int = Field(..., description="Predicted label")
    metadata: Dict[str, Any] = Field(..., description="Sample metadata")

class ModelMetrics(BaseModel):
    """Model performance metrics."""
    accuracy: float = Field(..., description="Model accuracy")
    f1_score: float = Field(..., description="F1 score")
    precision: float = Field(..., description="Precision")
    recall: float = Field(..., description="Recall")
    labeled_count: int = Field(..., description="Number of labeled samples")
    total_samples: int = Field(..., description="Total number of samples")
    last_updated: str = Field(..., description="Last update timestamp")

class BlockchainInfo(BaseModel):
    """Blockchain status information."""
    total_blocks: int = Field(..., description="Total number of blocks")
    total_transactions: int = Field(..., description="Total number of transactions")
    latest_block_hash: str = Field(..., description="Hash of the latest block")
    chain_valid: bool = Field(..., description="Whether the chain is valid")
    pending_transactions: int = Field(..., description="Number of pending transactions")

class APIResponse(BaseModel):
    """Generic API response wrapper."""
    status: str = Field(..., description="Response status (success, error)")
    message: Optional[str] = Field(None, description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")
    timestamp: str = Field(..., description="Response timestamp")
    request_id: Optional[str] = Field(None, description="Request identifier") 