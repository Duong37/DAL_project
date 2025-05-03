import numpy as np
from modAL.models import ActiveLearner
from modAL.uncertainty import uncertainty_sampling
from sklearn.ensemble import RandomForestClassifier

# Implements Active Learning using modAL. 
# Loads data, sets up learner, and selects the most uncertain samples.

# Dummy dataset
X_pool = np.random.rand(100, 5)
X_initial = X_pool[:5]
y_initial = np.random.randint(0, 2, size=5)

# AL learner
learner = ActiveLearner(
    estimator=RandomForestClassifier(),
    query_strategy=uncertainty_sampling,
    X_training=X_initial,
    y_training=y_initial
)

def get_uncertain_samples(n: int):
    query_idx, query_instances = learner.query(X_pool, n_instances=n)
    return [
        {"id": int(i), "features": X_pool[i].tolist()}
        for i in query_idx
    ]
