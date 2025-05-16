"""
Utility functions for the DAL backend.
"""
import json
from typing import Any, Dict
import numpy as np

def serialize_numpy(obj: Any) -> Dict:
    """Serialize numpy arrays for JSON encoding."""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def load_config(config_path: str) -> Dict:
    """Load configuration from JSON file."""
    with open(config_path, 'r') as f:
        return json.load(f)

def validate_input_data(data: Dict) -> bool:
    """Validate input data format."""
    # TODO: Implement input validation
    return True 