"""
Pydantic models for request/response validation.

This module defines the data models used for:
1. Request validation
2. Response formatting
3. Data type enforcement
4. Documentation generation

Using Pydantic models provides:
- Automatic validation
- JSON Schema generation
- OpenAPI documentation
- IDE support
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ModelType(str, Enum):
    """
    Supported model types for active learning.
    
    Currently supports:
    - SVM: Support Vector Machine
    - Random Forest: Ensemble method
    - Neural Net: Deep learning model
    
    Can be extended with additional model types as needed.
    """
    SVM = "svm"
    RANDOM_FOREST = "random_forest"
    NEURAL_NET = "neural_net"

class InitializeRequest(BaseModel):
    """
    Request model for initializing the active learning system.
    
    Contains:
    - Initial labeled dataset
    - Model configuration
    - Optional hyperparameters
    """
    features: List[List[float]] = Field(
        ...,
        description="Initial training features matrix"
    )
    labels: List[Any] = Field(
        ...,
        description="Initial training labels"
    )
    model_type: ModelType = Field(
        default=ModelType.SVM,
        description="Type of model to use for active learning"
    )
    model_params: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Model-specific parameters (e.g., C for SVM)"
    )

class QueryRequest(BaseModel):
    """
    Request model for querying informative instances.
    
    Used to:
    1. Submit unlabeled data for query
    2. Configure query batch size
    3. Specify query strategy
    """
    data: List[List[float]] = Field(
        ...,
        description="Unlabeled data points to query from"
    )
    batch_size: Optional[int] = Field(
        default=1,
        gt=0,
        description="Number of instances to query"
    )
    strategy: Optional[str] = Field(
        default="uncertainty",
        description="Query strategy to use"
    )

class QueryResponse(BaseModel):
    """
    Response model for query results.
    
    Contains:
    1. Indices of selected instances
    2. Uncertainty scores for selection
    """
    indices: List[int] = Field(
        ...,
        description="Indices of instances to label"
    )
    uncertainty_scores: List[float] = Field(
        ...,
        description="Uncertainty scores for selected instances"
    )

class UpdateRequest(BaseModel):
    """
    Request model for updating the model with new labels.
    
    Used to:
    1. Submit newly labeled instances
    2. Provide additional metadata
    3. Track labeling progress
    """
    features: List[List[float]] = Field(
        ...,
        description="Features of labeled instances"
    )
    labels: List[Any] = Field(
        ...,
        description="Labels for the instances"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional metadata about the update"
    )

class UpdateResponse(BaseModel):
    """
    Response model for model update results.
    
    Provides:
    1. Update status
    2. Performance metrics
    3. Blockchain transaction ID
    """
    status: str = Field(
        ...,
        description="Status of the update operation"
    )
    message: str = Field(
        ...,
        description="Detailed message about the update"
    )
    model_performance: Optional[Dict[str, float]] = Field(
        default=None,
        description="Performance metrics after update"
    )
    transaction_id: Optional[str] = Field(
        default=None,
        description="Blockchain transaction ID for this update"
    )

class ChainStatus(BaseModel):
    """
    Model for blockchain status information.
    
    Tracks:
    1. Chain length
    2. Pending transactions
    3. Latest block information
    """
    chain_length: int = Field(
        ...,
        description="Current length of the blockchain"
    )
    pending_transactions: int = Field(
        ...,
        description="Number of pending transactions"
    )
    last_block_hash: Optional[str] = Field(
        default=None,
        description="Hash of the last block in chain"
    )
    last_block_time: Optional[str] = Field(
        default=None,
        description="Timestamp of the last block"
    )

class SystemStatus(BaseModel):
    """
    Model for overall system status.
    
    Combines:
    1. Blockchain status
    2. Training progress
    3. Model state
    """
    blockchain_status: ChainStatus = Field(
        ...,
        description="Current status of the blockchain"
    )
    training_history: List[Dict[str, Any]] = Field(
        ...,
        description="History of training events"
    )
    total_samples_processed: int = Field(
        ...,
        description="Total number of samples processed"
    )
    active_model: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Current state of the active model"
    ) 