"""
DAL Backend Package.

This package implements the backend services for the Decentralized Active Learning (DAL) framework.
It provides a comprehensive set of tools and services for:

1. Active Learning
   - Model management and training
   - Query strategy implementation
   - Performance tracking

2. Data Management
   - Dataset loading and preprocessing
   - Feature engineering
   - Batch operations

3. Blockchain Integration
   - Model versioning
   - Transaction management
   - Data integrity verification

4. API Services
   - RESTful endpoints
   - Real-time updates
   - System monitoring

Usage:
    from DAL.backend import create_app
    app = create_app()
"""

import logging
from typing import Optional
from fastapi import FastAPI
from .main import app as fastapi_app

# Configure package-level logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

__version__ = "0.1.0"
__author__ = "Your Name"
__license__ = "MIT"

def create_app(config: Optional[dict] = None) -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    This function:
    1. Creates the FastAPI app
    2. Applies configuration
    3. Sets up middleware
    4. Registers routes
    
    Args:
        config: Optional configuration dictionary
        
    Returns:
        Configured FastAPI application
    """
    app = fastapi_app
    
    if config:
        # Apply custom configuration if provided
        for key, value in config.items():
            setattr(app, key, value)
    
    logger.info(f"Created DAL backend application v{__version__}")
    return app

# Export key components
__all__ = [
    'create_app',
    'fastapi_app',
    '__version__',
    '__author__',
    '__license__'
] 