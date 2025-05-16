"""
Active Learning Manager module.
Wraps modAL functionality for active learning workflows.

This module serves as the core of the active learning system, providing:
1. Model initialization and management
2. Query strategies for selecting informative instances
3. Model updates with new labeled data
4. Performance tracking and history
"""
from typing import List, Tuple, Any, Optional, Dict
import numpy as np
from modAL.models import ActiveLearner
from modAL.uncertainty import uncertainty_sampling
from sklearn.base import BaseEstimator
import logging

logger = logging.getLogger(__name__)

class ActiveLearningManager:
    """
    Manages the active learning workflow.
    
    This class wraps modAL's ActiveLearner and provides additional functionality for:
    - Model initialization and configuration
    - Instance querying using various strategies
    - Model updates and performance tracking
    - Training history management
    
    Attributes:
        model (Optional[ActiveLearner]): The modAL active learner instance
        query_strategy: The strategy used for selecting instances (default: uncertainty sampling)
        training_history (List[Dict]): History of training events and performance
    """
    
    def __init__(self):
        """Initialize the Active Learning Manager."""
        self.model: Optional[ActiveLearner] = None
        self.query_strategy = uncertainty_sampling  # Default query strategy
        self.training_history: List[Dict] = []
    
    def initialize_model(self, estimator: BaseEstimator, X_initial: np.ndarray, y_initial: np.ndarray):
        """
        Initialize the active learning model with initial labeled data.
        
        This method:
        1. Creates a new ActiveLearner instance
        2. Fits it on the initial labeled data
        3. Prepares it for active learning queries
        
        Args:
            estimator: A scikit-learn compatible estimator (e.g., SVM, Random Forest)
            X_initial: Initial training features (n_samples, n_features)
            y_initial: Initial training labels (n_samples,)
            
        Returns:
            bool: True if initialization successful, False otherwise
            
        Raises:
            ValueError: If the input data dimensions don't match
        """
        try:
            # Validate input dimensions
            if len(X_initial) != len(y_initial):
                raise ValueError("X and y must have the same number of samples")
            
            # Initialize the active learner
            self.model = ActiveLearner(
                estimator=estimator,
                X_training=X_initial,
                y_training=y_initial,
                query_strategy=self.query_strategy
            )
            
            # Log the initialization event
            self._log_training_event("model_initialized", len(y_initial))
            logger.info(f"Model initialized with {len(y_initial)} samples")
            
            return True
        except Exception as e:
            logger.error(f"Failed to initialize model: {str(e)}")
            return False
    
    def query(self, X: np.ndarray, n_instances: int = 1) -> Tuple[List[int], List[float]]:
        """
        Query the most informative instances for labeling.
        
        Uses the active learner's query strategy to select instances that would
        be most informative when labeled. Default strategy is uncertainty sampling.
        
        Args:
            X: Pool of unlabeled instances to query from (n_samples, n_features)
            n_instances: Number of instances to query
            
        Returns:
            Tuple containing:
            - List of indices of selected instances
            - List of uncertainty scores for selected instances
            
        Raises:
            ValueError: If model not initialized or input data invalid
        """
        if self.model is None:
            raise ValueError("Model not initialized. Call initialize_model first.")
        
        try:
            # Query instances using the active learner
            query_indices, uncertainty_scores = self.model.query(X, n_instances=n_instances)
            
            # Log the query event
            logger.info(f"Queried {n_instances} instances")
            
            return query_indices.tolist(), uncertainty_scores.tolist()
        except Exception as e:
            logger.error(f"Query failed: {str(e)}")
            return [], []
    
    def update(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """
        Update the model with new labeled data.
        
        This method:
        1. Updates the model with new labeled instances
        2. Tracks performance before and after update
        3. Logs the update event
        
        Args:
            X: New training features (n_samples, n_features)
            y: New training labels (n_samples,)
            
        Returns:
            Dictionary containing:
            - Performance metrics before update
            - Performance metrics after update
            - Number of samples added
            
        Raises:
            ValueError: If model not initialized or input data invalid
        """
        if self.model is None:
            raise ValueError("Model not initialized. Call initialize_model first.")
        
        try:
            # Get performance metrics before update
            performance_before = self._get_performance_metrics()
            
            # Update the model with new labeled data
            self.model.teach(X, y)
            
            # Get performance metrics after update
            performance_after = self._get_performance_metrics()
            
            # Log the update event
            self._log_training_event("model_updated", len(y))
            logger.info(f"Model updated with {len(y)} new samples")
            
            return {
                "performance_before": performance_before,
                "performance_after": performance_after,
                "samples_added": len(y)
            }
        except Exception as e:
            logger.error(f"Update failed: {str(e)}")
            return {}
    
    def _get_performance_metrics(self) -> Dict[str, float]:
        """
        Get current model performance metrics.
        
        Currently only returns the training score, but could be extended to include:
        - Validation score
        - F1 score
        - Precision/Recall
        - Custom metrics
        
        Returns:
            Dictionary of performance metrics
        """
        if not hasattr(self.model.estimator, 'score'):
            return {}
        
        try:
            score = self.model.score(
                self.model.X_training,
                self.model.y_training
            )
            return {"training_score": float(score)}
        except Exception:
            return {}
    
    def _log_training_event(self, event_type: str, n_samples: int):
        """
        Log training events for tracking.
        
        Maintains a history of all training events including:
        - Model initialization
        - Model updates
        - Number of samples processed
        - Total samples seen
        
        Args:
            event_type: Type of event (e.g., "model_initialized", "model_updated")
            n_samples: Number of samples involved in the event
        """
        self.training_history.append({
            "event_type": event_type,
            "n_samples": n_samples,
            "total_samples": len(self.model.y_training) if self.model else 0
        })
    
    def get_training_history(self) -> List[Dict]:
        """
        Get the complete training history.
        
        Returns:
            List of dictionaries containing training events and their details
        """
        return self.training_history 