"""
Active Learning API routes.

This module defines the FastAPI routes for the active learning system.
It provides endpoints for:
1. Model initialization
2. Query selection
3. Model updates
4. System status monitoring

Each endpoint handles:
- Request validation using Pydantic models
- Error handling and appropriate HTTP responses
- Integration with AL Manager and Blockchain
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..schemas import (
    QueryRequest, QueryResponse,
    UpdateRequest, UpdateResponse,
    InitializeRequest
)
from ..al_manager import ActiveLearningManager
from ..blockchain_adapter import BlockchainAdapter
import numpy as np
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency injection functions
async def get_al_manager():
    """
    Dependency injection for AL Manager.
    
    In a production system, this would:
    1. Handle proper initialization
    2. Manage connection pooling
    3. Handle cleanup
    4. Possibly integrate with a dependency injection framework
    
    Returns:
        ActiveLearningManager: Instance of the AL manager
    """
    # In a real application, this would be a proper dependency injection
    return ActiveLearningManager()

async def get_blockchain():
    """
    Dependency injection for Blockchain adapter.
    
    In a production system, this would:
    1. Handle blockchain client initialization
    2. Manage connection pools
    3. Handle authentication
    4. Implement proper cleanup
    
    Returns:
        BlockchainAdapter: Instance of the blockchain adapter
    """
    return BlockchainAdapter()

@router.post("/initialize", response_model=Dict[str, str])
async def initialize_model(
    initial_data: InitializeRequest,
    al_manager: ActiveLearningManager = Depends(get_al_manager)
):
    """
    Initialize the active learning model with initial data.
    
    This endpoint:
    1. Validates the initial data format
    2. Converts data to numpy arrays
    3. Initializes the AL model
    4. Returns success/failure status
    
    Args:
        initial_data: Initial training data and model configuration
        al_manager: Injected AL manager instance
        
    Returns:
        Dict with status and message
        
    Raises:
        HTTPException: If initialization fails
    """
    try:
        logger.info("Initializing model with initial data")
        X_initial = np.array(initial_data.features)
        y_initial = np.array(initial_data.labels)
        
        success = al_manager.initialize_model(
            estimator=initial_data.get("estimator", None),  # Should be properly handled
            X_initial=X_initial,
            y_initial=y_initial
        )
        
        if success:
            logger.info("Model initialized successfully")
            return {"status": "success", "message": "Model initialized successfully"}
        else:
            logger.error("Failed to initialize model")
            raise HTTPException(status_code=400, detail="Failed to initialize model")
            
    except Exception as e:
        logger.error(f"Error during model initialization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=QueryResponse)
async def query_samples(
    request: QueryRequest,
    al_manager: ActiveLearningManager = Depends(get_al_manager)
):
    """
    Query for most informative samples to label.
    
    This endpoint:
    1. Validates the input data format
    2. Converts data to numpy array
    3. Queries the AL model for informative instances
    4. Returns selected indices and uncertainty scores
    
    Args:
        request: Query request containing unlabeled data
        al_manager: Injected AL manager instance
        
    Returns:
        QueryResponse with selected indices and uncertainty scores
        
    Raises:
        HTTPException: If query fails or model not initialized
    """
    try:
        logger.info(f"Querying {request.batch_size} samples")
        X = np.array(request.data)
        indices, scores = al_manager.query(X, n_instances=request.batch_size)
        
        logger.info(f"Selected {len(indices)} samples for labeling")
        return QueryResponse(
            indices=indices,
            uncertainty_scores=scores
        )
    except ValueError as e:
        logger.error(f"Invalid query request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error during query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update", response_model=UpdateResponse)
async def update_model(
    request: UpdateRequest,
    al_manager: ActiveLearningManager = Depends(get_al_manager),
    blockchain: BlockchainAdapter = Depends(get_blockchain)
):
    """
    Update model with new labeled data.
    
    This endpoint:
    1. Validates the update data format
    2. Updates the AL model with new labels
    3. Stores the update in blockchain
    4. Returns update status and performance metrics
    
    Args:
        request: Update request with new labeled data
        al_manager: Injected AL manager instance
        blockchain: Injected blockchain adapter
        
    Returns:
        UpdateResponse with status and performance metrics
        
    Raises:
        HTTPException: If update fails
    """
    try:
        logger.info("Updating model with new labeled data")
        # Update model
        update_metrics = al_manager.update(
            np.array(request.features),
            np.array(request.labels)
        )
        
        # Store update in blockchain
        model_state = {
            "update_time": "now",  # Should use proper timestamp
            "features_shape": np.array(request.features).shape,
            "performance": update_metrics
        }
        tx_id = await blockchain.store_model(model_state)
        logger.info(f"Model update stored in blockchain with ID: {tx_id}")
        
        return UpdateResponse(
            status="success",
            message=f"Model updated successfully. Transaction ID: {tx_id}",
            model_performance=update_metrics
        )
    except ValueError as e:
        logger.error(f"Invalid update request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error during model update: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status(
    al_manager: ActiveLearningManager = Depends(get_al_manager),
    blockchain: BlockchainAdapter = Depends(get_blockchain)
):
    """
    Get current system status.
    
    This endpoint provides:
    1. Blockchain status (chain length, pending transactions)
    2. Training history
    3. Total samples processed
    
    Args:
        al_manager: Injected AL manager instance
        blockchain: Injected blockchain adapter
        
    Returns:
        Dict containing system status information
        
    Raises:
        HTTPException: If status retrieval fails
    """
    try:
        logger.info("Retrieving system status")
        chain_status = blockchain.get_chain_status()
        training_history = al_manager.get_training_history()
        
        return {
            "blockchain_status": chain_status,
            "training_history": training_history,
            "total_samples_processed": (
                training_history[-1]["total_samples"]
                if training_history else 0
            )
        }
    except Exception as e:
        logger.error(f"Error retrieving system status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 