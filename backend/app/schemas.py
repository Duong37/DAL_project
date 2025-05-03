from typing import List
from pydantic import BaseModel

# Defines request/response formats using Pydantic. 
# Structures input like sample count, and output like data point lists and task IDs.

class DataQueryRequest(BaseModel):
    strategy: str = "uncertainty"
    num_samples: int = 3

class DataPoint(BaseModel):
    id: int
    features: List[float]

class TaskResponse(BaseModel):
    task_id: str
    data: List[DataPoint]
