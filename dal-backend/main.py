"""
DAL Orchestrator Service - Main Application

This service acts as the API gateway and orchestrator for the DAL microservices system.
It coordinates between the AL Engine and Blockchain services.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import List, Dict, Any
import uvicorn

# Import services
from services.orchestrator_service import OrchestratorService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="DAL Orchestrator Service",
    description="""
    API Gateway and Orchestrator for the Decentralized Active Learning System
    
    Features:
    - Experiment lifecycle management
    - Service coordination between AL Engine and Blockchain
    - Unified API for frontend applications
    - Health monitoring and system status
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator service
orchestrator = OrchestratorService()

# Experiment Management Endpoints
@app.post("/experiments/initialize")
async def initialize_experiment(config: Dict[str, Any]):
    """Initialize a new AL experiment."""
    try:
        result = await orchestrator.initialize_experiment(config)
        return result
    except Exception as e:
        logger.error(f"Failed to initialize experiment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/experiments/{experiment_id}/status")
async def get_experiment_status(experiment_id: str):
    """Get experiment status and metrics."""
    try:
        result = await orchestrator.get_experiment_status(experiment_id)
        return result
    except Exception as e:
        logger.error(f"Failed to get experiment status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/experiments/{experiment_id}/reset")
async def reset_experiment(experiment_id: str):
    """Reset an experiment."""
    try:
        result = await orchestrator.reset_experiment(experiment_id)
        return result
    except Exception as e:
        logger.error(f"Failed to reset experiment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/experiments/{experiment_id}/next-sample")
async def get_next_sample(experiment_id: str):
    """Get the next most informative sample for labeling."""
    try:
        result = await orchestrator.get_next_sample(experiment_id)
        return result
    except Exception as e:
        logger.error(f"Failed to get next sample: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/experiments/{experiment_id}/submit-label")
async def submit_label(experiment_id: str, label_data: Dict[str, Any]):
    """Submit a label for a sample and update the model."""
    try:
        sample_id = label_data.get("sample_id")
        label = label_data.get("label")
        metadata = label_data.get("metadata")
        
        if sample_id is None or label is None:
            raise HTTPException(status_code=400, detail="sample_id and label are required")
        
        result = await orchestrator.submit_label(experiment_id, sample_id, label, metadata)
        return result
    except Exception as e:
        logger.error(f"Failed to submit label: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Voting Endpoints
@app.post("/experiments/{experiment_id}/voting/start")
async def start_voting_session(experiment_id: str, voting_config: Dict[str, Any]):
    """Start a voting session for model updates."""
    try:
        result = await orchestrator.start_voting_session(experiment_id, voting_config)
        return result
    except Exception as e:
        logger.error(f"Failed to start voting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/experiments/{experiment_id}/voting/{session_id}/vote")
async def submit_vote(experiment_id: str, session_id: str, vote_data: Dict[str, Any]):
    """Submit a vote for a voting session."""
    try:
        result = await orchestrator.submit_vote(experiment_id, session_id, vote_data)
        return result
    except Exception as e:
        logger.error(f"Failed to submit vote: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/experiments/{experiment_id}/voting/{session_id}/results")
async def get_voting_results(experiment_id: str, session_id: str):
    """Get voting results for a session."""
    try:
        result = await orchestrator.get_voting_results(experiment_id, session_id)
        return result
    except Exception as e:
        logger.error(f"Failed to get voting results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Metrics and Monitoring Endpoints
@app.get("/experiments/{experiment_id}/metrics")
async def get_metrics(experiment_id: str):
    """Get experiment metrics and performance data."""
    try:
        result = await orchestrator.get_metrics(experiment_id)
        return result
    except Exception as e:
        logger.error(f"Failed to get metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/experiments/{experiment_id}/model-updates")
async def get_model_updates(experiment_id: str, limit: int = 10):
    """Get model update history."""
    try:
        result = await orchestrator.get_model_updates(experiment_id, limit)
        return result
    except Exception as e:
        logger.error(f"Failed to get model updates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Blockchain Endpoints
@app.get("/blockchain/status")
async def get_blockchain_status():
    """Get blockchain status."""
    try:
        result = await orchestrator.get_blockchain_status()
        return result
    except Exception as e:
        logger.error(f"Failed to get blockchain status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/blockchain/blocks")
async def get_recent_blocks(limit: int = 10):
    """Get recent blockchain blocks."""
    try:
        result = await orchestrator.get_recent_blocks(limit)
        return result
    except Exception as e:
        logger.error(f"Failed to get recent blocks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# System Management Endpoints
@app.get("/system/status")
async def get_system_status():
    """Get overall system status."""
    try:
        result = await orchestrator.get_system_status()
        return result
    except Exception as e:
        logger.error(f"Failed to get system status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/system/reset")
async def reset_system():
    """Reset the entire system."""
    try:
        result = await orchestrator.reset_system()
        return result
    except Exception as e:
        logger.error(f"Failed to reset system: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": str(exc.detail),
                "type": "HTTPException"
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "type": type(exc).__name__
            }
        }
    )

# Startup event handler
@app.on_event("startup")
async def startup_event():
    """Handle application startup."""
    logger.info("Starting DAL Orchestrator service...")
    await orchestrator.initialize()
    logger.info("DAL Orchestrator service started successfully")

# Shutdown event handler
@app.on_event("shutdown")
async def shutdown_event():
    """Handle application shutdown."""
    logger.info("Shutting down DAL Orchestrator service...")

if __name__ == "__main__":
    # Run the application using uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
