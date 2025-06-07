"""
Blockchain Service - Main Application

This service handles all blockchain operations for the DAL system.
It provides a clean interface for storing and retrieving data from the blockchain.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import Dict, Any, List
import uvicorn

from services.blockchain_service import BlockchainService
from models.blockchain_models import TransactionRequest, VotingRequest, ModelUpdateRequest

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Blockchain Service",
    description="""
    Blockchain Service for Decentralized Active Learning
    
    Features:
    - Transaction storage and retrieval
    - Voting result management
    - Model update tracking
    - Data integrity verification
    - Blockchain status monitoring
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize blockchain service
blockchain_service = BlockchainService()

@app.post("/transactions")
async def store_transaction(request: TransactionRequest):
    """Store a generic transaction on the blockchain."""
    try:
        result = await blockchain_service.store_transaction(request.data)
        return result
    except Exception as e:
        logger.error(f"Failed to store transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions/{tx_id}")
async def get_transaction(tx_id: str):
    """Retrieve a transaction by ID."""
    try:
        result = await blockchain_service.get_transaction(tx_id)
        return result
    except Exception as e:
        logger.error(f"Failed to retrieve transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voting")
async def store_voting_result(request: VotingRequest):
    """Store voting results on the blockchain."""
    try:
        result = await blockchain_service.store_voting_result(request.dict())
        return result
    except Exception as e:
        logger.error(f"Failed to store voting result: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/voting/{session_id}")
async def get_voting_result(session_id: str):
    """Retrieve voting results by session ID."""
    try:
        result = await blockchain_service.get_voting_result(session_id)
        return result
    except Exception as e:
        logger.error(f"Failed to retrieve voting result: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/model-updates")
async def store_model_update(request: ModelUpdateRequest):
    """Store model update information on the blockchain."""
    try:
        result = await blockchain_service.store_model_update(request.dict())
        return result
    except Exception as e:
        logger.error(f"Failed to store model update: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-updates")
async def get_model_updates(limit: int = 10):
    """Get recent model updates."""
    try:
        result = await blockchain_service.get_model_updates(limit)
        return result
    except Exception as e:
        logger.error(f"Failed to retrieve model updates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chain/status")
async def get_chain_status():
    """Get blockchain status and statistics."""
    try:
        result = await blockchain_service.get_chain_status()
        return result
    except Exception as e:
        logger.error(f"Failed to get chain status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chain/blocks")
async def get_blocks(limit: int = 10):
    """Get recent blocks from the blockchain."""
    try:
        result = await blockchain_service.get_recent_blocks(limit)
        return result
    except Exception as e:
        logger.error(f"Failed to get blocks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chain/verify")
async def verify_chain():
    """Verify blockchain integrity."""
    try:
        result = await blockchain_service.verify_chain_integrity()
        return result
    except Exception as e:
        logger.error(f"Failed to verify chain: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset")
async def reset_blockchain():
    """Reset the blockchain (development only)."""
    try:
        result = await blockchain_service.reset_blockchain()
        return result
    except Exception as e:
        logger.error(f"Failed to reset blockchain: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "blockchain"}

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
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

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize blockchain service on startup."""
    logger.info("Starting Blockchain service...")
    await blockchain_service.initialize()

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Blockchain service...")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    ) 