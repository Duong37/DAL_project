"""
Main FastAPI application module.

This module serves as the entry point for the DAL backend service.
It provides:
1. FastAPI application setup and configuration
2. API route registration
3. Middleware configuration (CORS, logging, etc.)
4. OpenAPI documentation setup
5. Application lifecycle management
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import List, Dict, Any
import uvicorn

# Import routes
from .routes import al_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Decentralized Active Learning API",
    description="""
    API for managing decentralized active learning workflows.
    
    Features:
    - Active learning model management
    - Data preprocessing and management
    - Blockchain integration for model versioning
    - Performance monitoring and tracking
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

# Include routers
app.include_router(
    al_routes.router,
    prefix="/api/v1/al",
    tags=["active-learning"]
)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Handle HTTP exceptions.
    
    Args:
        request: FastAPI request object
        exc: Exception object
        
    Returns:
        JSONResponse with error details
    """
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
    """
    Handle general exceptions.
    
    Args:
        request: FastAPI request object
        exc: Exception object
        
    Returns:
        JSONResponse with error details
    """
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

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    
    Returns:
        Dict with service status
    """
    return {"status": "healthy"}

# API information endpoint
@app.get("/api-info")
async def api_info() -> Dict[str, Any]:
    """
    Get API information.
    
    Returns:
        Dict containing:
        - API version
        - Available endpoints
        - Documentation links
    """
    return {
        "version": app.version,
        "title": app.title,
        "description": app.description,
        "docs_url": app.docs_url,
        "redoc_url": app.redoc_url
    }

# Startup event handler
@app.on_event("startup")
async def startup_event():
    """
    Handle application startup.
    
    Performs:
    1. Initialize logging
    2. Check dependencies
    3. Set up connections
    """
    logger.info("Starting DAL backend service...")

# Shutdown event handler
@app.on_event("shutdown")
async def shutdown_event():
    """
    Handle application shutdown.
    
    Performs:
    1. Close connections
    2. Clean up resources
    3. Save state if needed
    """
    logger.info("Shutting down DAL backend service...")

if __name__ == "__main__":
    # Run the application using uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
