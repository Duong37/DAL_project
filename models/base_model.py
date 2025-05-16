"""
Base model class for active learning.
"""
from abc import ABC, abstractmethod
import numpy as np
from typing import Any, List, Tuple

class BaseModel(ABC):
    def __init__(self):
        self.model = None
    
    @abstractmethod
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train the model on given data."""
        pass
    
    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions on input data."""
        pass
    
    @abstractmethod
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict class probabilities for input data."""
        pass
    
    def get_uncertainty(self, X: np.ndarray) -> Tuple[List[int], List[float]]:
        """Calculate uncertainty scores for input samples."""
        probas = self.predict_proba(X)
        uncertainty_scores = 1 - np.max(probas, axis=1)
        return list(range(len(X))), uncertainty_scores.tolist() 