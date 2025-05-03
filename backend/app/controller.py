from fastapi import APIRouter
from app.model import get_uncertain_samples
from app.schemas import DataQueryRequest, TaskResponse
from app.blockchain.dummy_adapter import DummyAdapter

# Defines API routes (e.g. /query, /status/{task_id}), 
# connects Active Learning logic with the blockchain adapter.

router = APIRouter()
blockchain = DummyAdapter()  # Later: swap for real adapter

@router.post("/query", response_model=TaskResponse)
def query_uncertain_data(request: DataQueryRequest):
    data_points = get_uncertain_samples(request.num_samples)
    task_id = blockchain.submit_task(data_points)
    return TaskResponse(task_id=task_id, data=data_points)

@router.get("/status/{task_id}")
def get_task_status(task_id: str):
    return {"task_id": task_id, "status": blockchain.get_task_status(task_id)}
