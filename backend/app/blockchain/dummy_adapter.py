import uuid
from typing import List, Dict
from app.blockchain.abstract import BlockchainAdapter

# A mock blockchain adapter that stores tasks in memory. 
# Useful for testing without a real chain.

class DummyAdapter(BlockchainAdapter):
    def __init__(self):
        self.tasks = {}

    def submit_task(self, data_points: List[Dict]) -> str:
        task_id = str(uuid.uuid4())
        self.tasks[task_id] = {"status": "submitted", "data": data_points}
        return task_id

    def get_task_status(self, task_id: str) -> str:
        return self.tasks.get(task_id, {}).get("status", "unknown")
