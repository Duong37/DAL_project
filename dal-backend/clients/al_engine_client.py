"""
AL Engine Client

Client for communicating with the AL Engine service.
"""

import aiohttp
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ALEngineClient:
    """Client for AL Engine service communication."""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        """
        Initialize AL Engine client.
        
        Args:
            base_url: Base URL of the AL Engine service
        """
        self.base_url = base_url.rstrip('/')
        self.session = None
    
    async def _get_session(self):
        """Get or create aiohttp session."""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def _make_request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make HTTP request to AL Engine service.
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            data: Request data
            params: Query parameters
            
        Returns:
            Response data
        """
        session = await self._get_session()
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                async with session.get(url, params=params) as response:
                    response.raise_for_status()
                    return await response.json()
            elif method.upper() == "POST":
                async with session.post(url, json=data, params=params) as response:
                    response.raise_for_status()
                    return await response.json()
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
        except aiohttp.ClientError as e:
            logger.error(f"AL Engine request failed: {str(e)}")
            raise Exception(f"AL Engine service unavailable: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in AL Engine request: {str(e)}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """Check AL Engine service health."""
        return await self._make_request("GET", "/health")
    
    async def initialize_experiment(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize AL experiment."""
        return await self._make_request("POST", "/initialize", config)
    
    async def get_next_sample(self) -> Dict[str, Any]:
        """Get next sample for labeling."""
        return await self._make_request("GET", "/next-sample")
    
    async def submit_label(self, sample_id: str, label: int) -> Dict[str, Any]:
        """Submit label for a sample."""
        params = {"sample_id": sample_id, "label": label}
        return await self._make_request("POST", "/submit-label", params=params)
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get model performance metrics."""
        return await self._make_request("GET", "/metrics")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get AL engine status."""
        return await self._make_request("GET", "/status")
    
    async def reset(self) -> Dict[str, Any]:
        """Reset AL engine."""
        return await self._make_request("POST", "/reset")
    
    async def list_available_plugins(self) -> Dict[str, Any]:
        """List available plugins."""
        return await self._make_request("GET", "/plugins/available")
    
    async def close(self):
        """Close the client session."""
        if self.session:
            await self.session.close()
            self.session = None 