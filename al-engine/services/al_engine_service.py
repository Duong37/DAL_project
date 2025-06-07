"""
AL Engine Service

This service orchestrates the active learning workflow using the plugin system.
It manages experiments, coordinates between plugins, and provides a unified interface.
"""

import numpy as np
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from interfaces.base import ALFrameworkPlugin, SampleInfo
from plugin_registry import registry

logger = logging.getLogger(__name__)

class ALEngineService:
    """
    Main AL Engine Service
    
    This service manages active learning experiments using the plugin architecture.
    It coordinates between framework, model, strategy, and dataset plugins.
    """
    
    def __init__(self):
        """Initialize the AL Engine service."""
        self.current_framework: Optional[ALFrameworkPlugin] = None
        self.experiment_config: Optional[Dict[str, Any]] = None
        self.experiment_id: Optional[str] = None
        self.current_sample_index: int = 0
        self.unlabeled_indices: List[int] = []
        self.labeled_indices: List[int] = []
        self.experiment_state = "idle"  # idle, initialized, training, querying
        
        logger.info("AL Engine service initialized")
    
    async def initialize_experiment(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initialize a new AL experiment.
        
        Args:
            config: Experiment configuration containing:
                - experiment_id: Unique experiment identifier
                - al_framework: Framework configuration
                - model: Model configuration
                - query_strategy: Query strategy configuration
                - dataset: Dataset configuration
                
        Returns:
            Initialization result
        """
        try:
            logger.info("Initializing AL experiment")
            
            # Store experiment configuration
            self.experiment_config = config
            self.experiment_id = config.get("experiment_id", f"exp_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            
            # Get framework configuration
            framework_config = config.get("al_framework", {})
            framework_type = framework_config.get("type", "sklearn")
            
            # Initialize framework plugin
            self.current_framework = registry.get_framework(framework_type)
            self.current_framework.initialize(config)
            
            # Perform initial training
            dataset_config = config.get("dataset", {})
            initial_training_result = await self._perform_initial_training(dataset_config)
            
            if initial_training_result["status"] == "success":
                self.experiment_state = "initialized"
                logger.info(f"Experiment {self.experiment_id} initialized successfully")
                
                return {
                    "status": "success",
                    "experiment_id": self.experiment_id,
                    "framework": framework_type,
                    "initial_training": initial_training_result,
                    "available_plugins": registry.list_available()
                }
            else:
                self.experiment_state = "error"
                return {
                    "status": "error",
                    "error": "Initial training failed",
                    "details": initial_training_result
                }
                
        except Exception as e:
            logger.error(f"Experiment initialization failed: {str(e)}")
            self.experiment_state = "error"
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _perform_initial_training(self, dataset_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform initial training (warm start) on the dataset.
        
        Args:
            dataset_config: Dataset configuration
            
        Returns:
            Training result
        """
        try:
            # For now, use the framework's built-in dataset loading
            # In the future, this will use dataset plugins
            
            # The framework plugin handles initial training internally
            # This is a placeholder for when we have separate dataset plugins
            
            # Get initial training data from framework
            if hasattr(self.current_framework, 'X_train') and hasattr(self.current_framework, 'y_train'):
                X_train = self.current_framework.X_train
                y_train = self.current_framework.y_train
                
                # Perform initial training
                result = self.current_framework.train_initial_model(X_train, y_train)
                
                # Initialize unlabeled indices
                if hasattr(self.current_framework, 'X_unlabeled'):
                    self.unlabeled_indices = list(range(len(self.current_framework.X_unlabeled)))
                    self.labeled_indices = []
                
                return result
            else:
                return {
                    "status": "error",
                    "error": "Framework does not provide training data"
                }
                
        except Exception as e:
            logger.error(f"Initial training failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_next_sample(self) -> Dict[str, Any]:
        """
        Get the next most informative sample for labeling.
        
        Returns:
            Sample information for labeling
        """
        try:
            if not self.current_framework:
                raise ValueError("No experiment initialized")
            
            if self.experiment_state not in ["initialized", "training"]:
                raise ValueError(f"Invalid experiment state: {self.experiment_state}")
            
            if not self.unlabeled_indices:
                return {
                    "status": "no_samples",
                    "message": "No unlabeled samples available"
                }
            
            self.experiment_state = "querying"
            
            # Get unlabeled data
            X_unlabeled = self.current_framework.X_unlabeled[self.unlabeled_indices]
            
            # Query for most informative sample
            selected_indices = self.current_framework.query_samples(X_unlabeled, n_samples=1)
            
            if not selected_indices:
                return {
                    "status": "error",
                    "error": "Query strategy returned no samples"
                }
            
            # Map back to original indices
            original_index = self.unlabeled_indices[selected_indices[0]]
            sample_features = X_unlabeled[selected_indices[0]]
            
            # Get predictions and uncertainty
            predictions, uncertainties = self.current_framework.predict(sample_features.reshape(1, -1))
            
            # Create sample info
            sample_info = {
                "sample_id": f"sample_{original_index}",
                "sample_index": original_index,
                "features": self._format_features(sample_features),
                "uncertainty_score": float(uncertainties[0]) if len(uncertainties) > 0 else 0.0,
                "predicted_label": int(predictions[0]) if len(predictions) > 0 else 0,
                "metadata": {
                    "experiment_id": self.experiment_id,
                    "query_timestamp": datetime.now().isoformat(),
                    "remaining_unlabeled": len(self.unlabeled_indices) - 1
                }
            }
            
            # Store current sample for labeling
            self.current_sample_index = original_index
            
            self.experiment_state = "initialized"
            
            return {
                "status": "success",
                "sample": sample_info
            }
            
        except Exception as e:
            logger.error(f"Failed to get next sample: {str(e)}")
            self.experiment_state = "error"
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _format_features(self, features: np.ndarray) -> Dict[str, float]:
        """
        Format feature array as a dictionary.
        
        Args:
            features: Feature array
            
        Returns:
            Dictionary of feature names to values
        """
        # For wine dataset, use known feature names
        wine_feature_names = [
            'alcohol', 'malic_acid', 'ash', 'alcalinity_of_ash', 'magnesium',
            'total_phenols', 'flavanoids', 'nonflavanoid_phenols', 'proanthocyanins',
            'color_intensity', 'hue', 'od280/od315_of_diluted_wines', 'proline'
        ]
        
        if len(features) == len(wine_feature_names):
            return {name: float(value) for name, value in zip(wine_feature_names, features)}
        else:
            return {f"feature_{i}": float(value) for i, value in enumerate(features)}
    
    async def submit_label(self, sample_id: str, label: int) -> Dict[str, Any]:
        """
        Submit a label for a sample and update the model.
        
        Args:
            sample_id: ID of the sample being labeled
            label: Label assigned to the sample
            
        Returns:
            Update result
        """
        try:
            if not self.current_framework:
                raise ValueError("No experiment initialized")
            
            # Extract sample index from sample_id
            sample_index = int(sample_id.split("_")[-1])
            
            if sample_index not in self.unlabeled_indices:
                raise ValueError(f"Sample {sample_id} is not in unlabeled pool")
            
            self.experiment_state = "training"
            
            # Get sample features
            unlabeled_pool_index = self.unlabeled_indices.index(sample_index)
            X_new = self.current_framework.X_unlabeled[sample_index:sample_index+1]
            y_new = np.array([label])
            
            # Update model with new label
            update_result = self.current_framework.update_model(X_new, y_new)
            
            # Update indices
            self.unlabeled_indices.remove(sample_index)
            self.labeled_indices.append(sample_index)
            
            # Get updated metrics
            metrics = self.current_framework.get_metrics()
            
            self.experiment_state = "initialized"
            
            return {
                "status": "success",
                "sample_id": sample_id,
                "label": label,
                "update_result": update_result,
                "metrics": metrics.__dict__,
                "remaining_unlabeled": len(self.unlabeled_indices),
                "total_labeled": len(self.labeled_indices)
            }
            
        except Exception as e:
            logger.error(f"Failed to submit label: {str(e)}")
            self.experiment_state = "error"
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_metrics(self) -> Dict[str, Any]:
        """
        Get current model performance metrics.
        
        Returns:
            Current metrics
        """
        try:
            if not self.current_framework:
                raise ValueError("No experiment initialized")
            
            metrics = self.current_framework.get_metrics()
            
            return {
                "status": "success",
                "metrics": metrics.__dict__,
                "experiment_info": {
                    "experiment_id": self.experiment_id,
                    "state": self.experiment_state,
                    "labeled_samples": len(self.labeled_indices),
                    "unlabeled_samples": len(self.unlabeled_indices)
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get metrics: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_status(self) -> Dict[str, Any]:
        """
        Get AL engine status and configuration.
        
        Returns:
            Engine status
        """
        try:
            status = {
                "status": "success",
                "engine_state": self.experiment_state,
                "experiment_id": self.experiment_id,
                "experiment_config": self.experiment_config,
                "available_plugins": registry.list_available()
            }
            
            if self.current_framework:
                framework_state = self.current_framework.get_state()
                status["framework_state"] = framework_state
                
                if self.experiment_state in ["initialized", "training", "querying"]:
                    status["experiment_info"] = {
                        "labeled_samples": len(self.labeled_indices),
                        "unlabeled_samples": len(self.unlabeled_indices),
                        "total_samples": len(self.labeled_indices) + len(self.unlabeled_indices)
                    }
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get status: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def reset(self) -> Dict[str, Any]:
        """
        Reset the AL engine state.
        
        Returns:
            Reset result
        """
        try:
            logger.info("Resetting AL engine")
            
            # Reset state
            self.current_framework = None
            self.experiment_config = None
            self.experiment_id = None
            self.current_sample_index = 0
            self.unlabeled_indices = []
            self.labeled_indices = []
            self.experiment_state = "idle"
            
            return {
                "status": "success",
                "message": "AL engine reset successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to reset engine: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            } 