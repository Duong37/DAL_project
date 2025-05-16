"""
Data Manager module.
Handles dataset loading and preprocessing.

This module is responsible for:
1. Loading datasets from various sources (CSV, etc.)
2. Preprocessing and feature engineering
3. Batch data management
4. Data validation and integrity checks

The DataManager class provides a clean interface for:
- Loading and validating datasets
- Preprocessing raw data
- Managing data batches for active learning
- Tracking data statistics
"""
import pandas as pd
import numpy as np
from typing import Tuple, Optional, Dict, List
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DataManager:
    """
    Manages dataset operations for active learning.
    
    This class handles:
    - Dataset loading and validation
    - Data preprocessing and feature engineering
    - Batch data management
    - Data statistics tracking
    
    Attributes:
        data (pd.DataFrame): Raw data loaded from source
        features (np.ndarray): Processed feature matrix
        labels (np.ndarray): Labels/targets
        feature_stats (Dict): Statistics about features
        data_info (Dict): Dataset metadata
    """
    
    def __init__(self):
        """Initialize the Data Manager with empty state."""
        self.data: Optional[pd.DataFrame] = None
        self.features: Optional[np.ndarray] = None
        self.labels: Optional[np.ndarray] = None
        self.feature_stats: Dict = {}
        self.data_info: Dict = {}
    
    def load_dataset(self, path: str) -> None:
        """
        Load dataset from file.
        
        Supports multiple file formats:
        - CSV (default)
        - Excel (if extension is .xlsx or .xls)
        - Parquet (if extension is .parquet)
        
        Args:
            path (str): Path to the dataset file
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If file format is not supported
        """
        try:
            file_path = Path(path)
            if not file_path.exists():
                raise FileNotFoundError(f"Dataset not found at {path}")
            
            # Load based on file extension
            if file_path.suffix == '.csv':
                self.data = pd.read_csv(path)
            elif file_path.suffix in ['.xlsx', '.xls']:
                self.data = pd.read_excel(path)
            elif file_path.suffix == '.parquet':
                self.data = pd.read_parquet(path)
            else:
                raise ValueError(f"Unsupported file format: {file_path.suffix}")
            
            logger.info(f"Loaded dataset from {path} with shape {self.data.shape}")
            self._update_data_info()
            
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            raise
    
    def preprocess_data(self, 
                       feature_columns: Optional[List[str]] = None,
                       target_column: Optional[str] = None,
                       categorical_columns: Optional[List[str]] = None) -> None:
        """
        Preprocess the loaded data.
        
        Performs:
        1. Feature selection
        2. Missing value handling
        3. Categorical encoding
        4. Feature scaling
        5. Data validation
        
        Args:
            feature_columns: List of columns to use as features
            target_column: Name of the target/label column
            categorical_columns: List of categorical columns to encode
            
        Raises:
            ValueError: If data is not loaded or invalid columns specified
        """
        if self.data is None:
            raise ValueError("No data loaded. Call load_dataset first.")
        
        try:
            # Select features
            if feature_columns is None:
                feature_columns = [col for col in self.data.columns 
                                 if col != target_column]
            
            # Handle missing values
            self._handle_missing_values(feature_columns)
            
            # Encode categorical variables
            if categorical_columns:
                self._encode_categorical(categorical_columns)
            
            # Convert to numpy arrays
            self.features = self.data[feature_columns].values
            if target_column:
                self.labels = self.data[target_column].values
            
            # Update feature statistics
            self._update_feature_stats(feature_columns)
            
            logger.info("Data preprocessing completed successfully")
            
        except Exception as e:
            logger.error(f"Error during preprocessing: {str(e)}")
            raise
    
    def get_batch(self, indices: Optional[List[int]] = None) -> Tuple[np.ndarray, np.ndarray]:
        """
        Get a batch of data by indices.
        
        Args:
            indices: List of indices to select. If None, returns all data.
            
        Returns:
            Tuple containing:
            - Feature matrix for selected indices
            - Labels for selected indices (if available)
            
        Raises:
            ValueError: If data not preprocessed or invalid indices
        """
        if self.features is None:
            raise ValueError("Features not available. Run preprocess_data first.")
        
        if indices is None:
            return self.features, self.labels
        
        try:
            selected_features = self.features[indices]
            selected_labels = self.labels[indices] if self.labels is not None else None
            return selected_features, selected_labels
        except Exception as e:
            logger.error(f"Error getting batch: {str(e)}")
            raise
    
    def _handle_missing_values(self, columns: List[str]) -> None:
        """
        Handle missing values in the dataset.
        
        Strategy:
        - Numeric columns: Fill with median
        - Categorical columns: Fill with mode
        - Drop rows if too many missing values
        
        Args:
            columns: List of columns to process
        """
        for col in columns:
            if self.data[col].dtype.kind in 'nufc':
                self.data[col] = self.data[col].fillna(self.data[col].median())
            else:
                self.data[col] = self.data[col].fillna(self.data[col].mode()[0])
    
    def _encode_categorical(self, categorical_columns: List[str]) -> None:
        """
        Encode categorical variables.
        
        Methods:
        - Ordinal encoding for binary categories
        - One-hot encoding for multi-class categories
        
        Args:
            categorical_columns: List of categorical columns to encode
        """
        for col in categorical_columns:
            if self.data[col].nunique() == 2:
                self.data[col] = pd.Categorical(self.data[col]).codes
            else:
                dummies = pd.get_dummies(self.data[col], prefix=col)
                self.data = pd.concat([self.data, dummies], axis=1)
                self.data.drop(col, axis=1, inplace=True)
    
    def _update_feature_stats(self, feature_columns: List[str]) -> None:
        """
        Update feature statistics.
        
        Calculates:
        - Mean, std, min, max for numeric features
        - Value counts for categorical features
        - Missing value percentages
        
        Args:
            feature_columns: List of feature columns to analyze
        """
        self.feature_stats = {
            'numeric_stats': self.data[feature_columns].describe(),
            'missing_percentages': self.data[feature_columns].isnull().mean() * 100,
            'feature_types': self.data[feature_columns].dtypes.to_dict()
        }
    
    def _update_data_info(self) -> None:
        """
        Update dataset metadata.
        
        Stores:
        - Dataset dimensions
        - Column names and types
        - Memory usage
        - Basic statistics
        """
        self.data_info = {
            'n_samples': len(self.data),
            'n_features': len(self.data.columns),
            'column_types': self.data.dtypes.to_dict(),
            'memory_usage': self.data.memory_usage(deep=True).sum(),
            'has_missing': self.data.isnull().any().any()
        }
        
    def get_data_info(self) -> Dict:
        """
        Get dataset information and statistics.
        
        Returns:
            Dict containing dataset metadata and statistics
        """
        return {
            'data_info': self.data_info,
            'feature_stats': self.feature_stats
        } 