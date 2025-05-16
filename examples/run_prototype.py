"""
Example script demonstrating the DAL system.

This script provides a complete example of:
1. Setting up the active learning system
2. Generating synthetic data for demonstration
3. Running the active learning loop
4. Integrating with blockchain
5. Monitoring system performance

The example simulates a real-world scenario where:
- We start with a small labeled dataset
- Actively query for most informative samples
- Update the model with new labels
- Track progress and performance
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
from sklearn.datasets import make_classification
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from DAL.backend.al_manager import ActiveLearningManager
from DAL.backend.data_manager import DataManager
from DAL.backend.blockchain_adapter import BlockchainAdapter
import asyncio
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """
    Main function demonstrating the active learning workflow.
    
    Steps:
    1. Generate synthetic dataset
    2. Split into initial labeled set and unlabeled pool
    3. Initialize system components
    4. Run active learning loop
    5. Track and display progress
    """
    # Generate synthetic dataset for demonstration
    logger.info("Generating synthetic dataset...")
    X, y = make_classification(
        n_samples=1000,        # Total number of samples
        n_features=20,         # Number of features
        n_informative=15,      # Number of informative features
        n_redundant=5,         # Number of redundant features
        random_state=42        # For reproducibility
    )
    
    # Split into initial labeled set and unlabeled pool
    n_initial = 50  # Start with 5% labeled data
    indices = np.random.permutation(len(X))
    X_initial = X[indices[:n_initial]]
    y_initial = y[indices[:n_initial]]
    X_pool = X[indices[n_initial:]]
    y_pool = y[indices[n_initial:]]  # Ground truth (normally unknown)
    
    logger.info(f"Dataset split: {n_initial} initial labeled samples, {len(X_pool)} in unlabeled pool")
    
    # Initialize system components
    logger.info("Initializing system components...")
    al_manager = ActiveLearningManager()
    data_manager = DataManager()
    blockchain = BlockchainAdapter()
    
    # Initialize model with SVM
    # Using SVM with probability estimates for uncertainty sampling
    logger.info("Initializing model...")
    al_manager.initialize_model(
        estimator=SVC(
            probability=True,    # Required for uncertainty sampling
            random_state=42,     # For reproducibility
            kernel='rbf'         # Radial basis function kernel
        ),
        X_initial=X_initial,
        y_initial=y_initial
    )
    
    # Simulate active learning loop
    n_queries = 10             # Number of query iterations
    batch_size = 5            # Number of samples to query in each iteration
    
    logger.info(f"Starting active learning loop with {n_queries} iterations...")
    
    for i in range(n_queries):
        logger.info(f"\nIteration {i+1}/{n_queries}")
        
        # 1. Query most informative instances
        logger.info("Querying instances...")
        query_indices, uncertainty_scores = al_manager.query(X_pool, n_instances=batch_size)
        logger.info(f"Selected {len(query_indices)} instances for labeling")
        logger.info(f"Uncertainty scores: {uncertainty_scores[:3]}...")
        
        # 2. Simulate oracle labeling
        # In a real scenario, these would be labeled by human experts
        X_query = X_pool[query_indices]
        y_query = y_pool[query_indices]
        
        # 3. Update model with new labeled data
        logger.info("Updating model...")
        update_metrics = al_manager.update(X_query, y_query)
        logger.info(f"Update metrics: {update_metrics}")
        
        # 4. Store model state in blockchain
        logger.info("Storing model state in blockchain...")
        model_state = {
            "iteration": i + 1,
            "processed_samples": query_indices.tolist(),
            "performance": update_metrics
        }
        tx_id = await blockchain.store_model(model_state)
        logger.info(f"Model state stored with transaction ID: {tx_id}")
        
        # 5. Get blockchain status
        chain_status = blockchain.get_chain_status()
        logger.info(f"Blockchain status: {chain_status}")
        
        # 6. Calculate and display current performance
        # In a real scenario, this would use a separate test set
        if hasattr(al_manager.model, 'score'):
            accuracy = al_manager.model.score(X_pool, y_pool)
            logger.info(f"Current model accuracy: {accuracy:.4f}")
        
        logger.info("-" * 50)

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main()) 