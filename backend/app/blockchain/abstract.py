from abc import ABC, abstractmethod
from typing import List, Dict

# Defines the BlockchainAdapter interface so any blockchain backend (dummy, Substrate, Ethereum, etc.) can be plugged in.

class BlockchainAdapter(ABC):
    @abstractmethod
    def submit_task(self, data_points: List[Dict]) -> str: pass

    @abstractmethod
    def get_task_status(self, task_id: str) -> str: pass
