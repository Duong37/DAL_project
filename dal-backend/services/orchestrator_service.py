"""
DAL Orchestrator Service

This service coordinates between the AL Engine, Blockchain Service, and frontend.
It acts as the main API gateway and manages the overall DAL workflow.
"""

import asyncio
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging
import uuid
import json

from clients.al_engine_client import ALEngineClient
from services.blockchain_service import BlockchainService
from models.dal_models import (
    SystemStatus, ServiceHealth, ModelUpdate, VotingResult
)

logger = logging.getLogger(__name__)

class OrchestratorService:
    """
    Main orchestrator service for the DAL system.
    
    This service:
    - Coordinates between AL Engine and Blockchain services
    - Manages experiment lifecycle
    - Handles voting sessions
    - Tracks model updates and stores them on blockchain
    - Provides unified API for the frontend
    """
    
    def __init__(self):
        """Initialize the orchestrator service."""
        self.al_engine_client = ALEngineClient()
        self.blockchain_service = BlockchainService()
        
        # Service state
        self.active_experiments: Dict[str, Dict[str, Any]] = {}
        self.voting_sessions: Dict[str, Dict[str, Any]] = {}
        self.service_health: Dict[str, ServiceHealth] = {}
        self.start_time = time.time()
        
        logger.info("DAL Orchestrator service initialized")
    
    async def initialize(self):
        """Initialize the orchestrator and check service health."""
        logger.info("Initializing DAL Orchestrator...")
        
        # Initialize blockchain service
        await self.blockchain_service.initialize()
        
        # Check health of dependent services
        await self._check_service_health()
        
        logger.info("DAL Orchestrator initialization complete")
    
    async def _check_service_health(self):
        """Check health of all dependent services."""
        services = [
            ("al-engine", self.al_engine_client.health_check),
            ("blockchain", self.blockchain_service.health_check)
        ]
        
        for service_name, health_check_func in services:
            try:
                start_time = time.time()
                result = await health_check_func()
                response_time = (time.time() - start_time) * 1000
                
                if result.get("status") == "healthy":
                    status = "healthy"
                    error_message = None
                else:
                    status = "unhealthy"
                    error_message = result.get("error", "Unknown error")
                    
            except Exception as e:
                status = "unhealthy"
                response_time = None
                error_message = str(e)
            
            self.service_health[service_name] = ServiceHealth(
                service_name=service_name,
                status=status,
                last_check=datetime.now().isoformat(),
                response_time_ms=response_time,
                error_message=error_message
            )
    
    async def initialize_experiment(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initialize a new AL experiment.
        
        Args:
            config: Experiment configuration
            
        Returns:
            Initialization result
        """
        try:
            # Generate experiment ID if not provided
            experiment_id = config.get("experiment_id", f"exp_{uuid.uuid4().hex[:8]}")
            config["experiment_id"] = experiment_id
            
            logger.info(f"Initializing experiment {experiment_id}")
            
            # Initialize experiment in AL Engine
            al_result = await self.al_engine_client.initialize_experiment(config)
            
            if al_result["status"] == "success":
                # Store experiment state
                self.active_experiments[experiment_id] = {
                    "config": config,
                    "status": "initialized",
                    "created_at": datetime.now().isoformat(),
                    "al_engine_result": al_result
                }
                
                # Store initialization on blockchain
                blockchain_data = {
                    "type": "experiment_initialization",
                    "experiment_id": experiment_id,
                    "config": config,
                    "timestamp": datetime.now().isoformat()
                }
                
                try:
                    blockchain_result = await self.blockchain_service.store_transaction(blockchain_data)
                    self.active_experiments[experiment_id]["blockchain_tx_id"] = blockchain_result["transaction_id"]
                except Exception as e:
                    logger.warning(f"Failed to store initialization on blockchain: {str(e)}")
                
                return {
                    "status": "success",
                    "experiment_id": experiment_id,
                    "al_engine_result": al_result,
                    "message": "Experiment initialized successfully"
                }
            else:
                return {
                    "status": "error",
                    "error": "AL Engine initialization failed",
                    "details": al_result
                }
                
        except Exception as e:
            logger.error(f"Failed to initialize experiment: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_experiment_status(self, experiment_id: str) -> Dict[str, Any]:
        """
        Get experiment status and metrics.
        
        Args:
            experiment_id: Experiment identifier
            
        Returns:
            Experiment status
        """
        try:
            if experiment_id not in self.active_experiments:
                return {
                    "status": "error",
                    "error": f"Experiment {experiment_id} not found"
                }
            
            # Get status from AL Engine
            al_status = await self.al_engine_client.get_status()
            
            # Get metrics from AL Engine
            metrics_result = await self.al_engine_client.get_metrics()
            
            experiment_info = self.active_experiments[experiment_id]
            
            return {
                "status": "success",
                "experiment_id": experiment_id,
                "experiment_status": experiment_info["status"],
                "created_at": experiment_info["created_at"],
                "al_engine_status": al_status,
                "metrics": metrics_result.get("metrics", {}),
                "config": experiment_info["config"]
            }
            
        except Exception as e:
            logger.error(f"Failed to get experiment status: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_next_sample(self, experiment_id: str) -> Dict[str, Any]:
        """
        Get the next most informative sample for labeling.
        
        Args:
            experiment_id: Experiment identifier
            
        Returns:
            Sample information
        """
        try:
            if experiment_id not in self.active_experiments:
                return {
                    "status": "error",
                    "error": f"Experiment {experiment_id} not found"
                }
            
            # Get next sample from AL Engine
            result = await self.al_engine_client.get_next_sample()
            
            if result["status"] == "success":
                # Update experiment state
                self.active_experiments[experiment_id]["last_sample_request"] = datetime.now().isoformat()
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get next sample: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def submit_label(self, experiment_id: str, sample_id: str, label: int, 
                          metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Submit a label for a sample and update the model.
        
        Args:
            experiment_id: Experiment identifier
            sample_id: Sample identifier
            label: Label for the sample
            metadata: Additional metadata
            
        Returns:
            Label submission result
        """
        try:
            if experiment_id not in self.active_experiments:
                return {
                    "status": "error",
                    "error": f"Experiment {experiment_id} not found"
                }
            
            # Submit label to AL Engine
            al_result = await self.al_engine_client.submit_label(sample_id, label)
            
            if al_result["status"] == "success":
                # Store model update on blockchain
                model_update_data = {
                    "type": "model_update",
                    "experiment_id": experiment_id,
                    "update_type": "incremental",
                    "samples_processed": [sample_id],
                    "performance_metrics": al_result.get("metrics", {}),
                    "model_info": {
                        "sample_id": sample_id,
                        "label": label,
                        "metadata": metadata or {}
                    },
                    "timestamp": datetime.now().isoformat()
                }
                
                try:
                    blockchain_result = await self.blockchain_service.store_model_update(
                        experiment_id=model_update_data["experiment_id"],
                        update_type=model_update_data["update_type"],
                        samples_processed=json.dumps(model_update_data["samples_processed"]),
                        performance_metrics=json.dumps(model_update_data["performance_metrics"]),
                        model_info=json.dumps(model_update_data["model_info"])
                    )
                    al_result["blockchain_tx_id"] = blockchain_result["transaction_hash"]
                except Exception as e:
                    logger.warning(f"Failed to store model update on blockchain: {str(e)}")
                
                # Update experiment state
                self.active_experiments[experiment_id]["last_label_submission"] = datetime.now().isoformat()
                self.active_experiments[experiment_id]["total_labels"] = self.active_experiments[experiment_id].get("total_labels", 0) + 1
            
            return al_result
            
        except Exception as e:
            logger.error(f"Failed to submit label: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def start_voting_session(self, experiment_id: str, voting_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Start a voting session for a sample.
        
        Args:
            experiment_id: Experiment identifier
            voting_config: Voting configuration
            
        Returns:
            Voting session result
        """
        try:
            session_id = f"vote_{uuid.uuid4().hex[:8]}"
            
            voting_session = {
                "session_id": session_id,
                "experiment_id": experiment_id,
                "sample_id": voting_config["sample_id"],
                "voting_type": voting_config.get("voting_type", "majority"),
                "min_votes": voting_config.get("min_votes", 3),
                "max_votes": voting_config.get("max_votes", 10),
                "timeout_minutes": voting_config.get("timeout_minutes", 30),
                "status": "active",
                "votes": [],
                "created_at": datetime.now().isoformat()
            }
            
            self.voting_sessions[session_id] = voting_session
            
            return {
                "status": "success",
                "session_id": session_id,
                "voting_session": voting_session
            }
            
        except Exception as e:
            logger.error(f"Failed to start voting session: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def submit_vote(self, experiment_id: str, session_id: str, vote_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit a vote in a voting session.
        
        Args:
            experiment_id: Experiment identifier
            session_id: Voting session identifier
            vote_data: Vote data
            
        Returns:
            Vote submission result
        """
        try:
            if session_id not in self.voting_sessions:
                return {
                    "status": "error",
                    "error": f"Voting session {session_id} not found"
                }
            
            session = self.voting_sessions[session_id]
            
            if session["status"] != "active":
                return {
                    "status": "error",
                    "error": f"Voting session {session_id} is not active"
                }
            
            # Add vote to session
            vote = {
                "voter_id": vote_data["voter_id"],
                "label": vote_data["label"],
                "confidence": vote_data.get("confidence"),
                "timestamp": datetime.now().isoformat()
            }
            
            session["votes"].append(vote)
            
            # Check if voting is complete
            if len(session["votes"]) >= session["min_votes"]:
                await self._finalize_voting_session(session_id)
            
            return {
                "status": "success",
                "session_id": session_id,
                "vote_count": len(session["votes"]),
                "votes_needed": max(0, session["min_votes"] - len(session["votes"]))
            }
            
        except Exception as e:
            logger.error(f"Failed to submit vote: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _finalize_voting_session(self, session_id: str):
        """Finalize a voting session and determine consensus."""
        session = self.voting_sessions[session_id]
        
        # Simple majority voting
        vote_counts = {}
        for vote in session["votes"]:
            label = vote["label"]
            vote_counts[label] = vote_counts.get(label, 0) + 1
        
        if vote_counts:
            final_label = max(vote_counts, key=vote_counts.get)
            consensus_reached = vote_counts[final_label] > len(session["votes"]) / 2
        else:
            final_label = 0
            consensus_reached = False
        
        session["status"] = "completed"
        session["final_label"] = final_label
        session["consensus_reached"] = consensus_reached
        session["completed_at"] = datetime.now().isoformat()
        
        # Store voting result on blockchain
        voting_result_data = {
            "session_id": session_id,
            "sample_id": session["sample_id"],
            "votes": session["votes"],
            "final_label": final_label,
            "vote_count": len(session["votes"]),
            "consensus_reached": consensus_reached,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            blockchain_result = await self.blockchain_service.store_voting_result(
                session_id=voting_result_data["session_id"],
                sample_id=voting_result_data["sample_id"],
                final_label=voting_result_data["final_label"],
                vote_count=voting_result_data["vote_count"],
                consensus_reached=voting_result_data["consensus_reached"],
                votes_json=json.dumps(voting_result_data["votes"])
            )
            session["blockchain_tx_id"] = blockchain_result["transaction_hash"]
        except Exception as e:
            logger.warning(f"Failed to store voting result on blockchain: {str(e)}")
    
    async def get_voting_results(self, experiment_id: str, session_id: str) -> Dict[str, Any]:
        """
        Get voting session results.
        
        Args:
            experiment_id: Experiment identifier
            session_id: Voting session identifier
            
        Returns:
            Voting results
        """
        try:
            if session_id not in self.voting_sessions:
                return {
                    "status": "error",
                    "error": f"Voting session {session_id} not found"
                }
            
            session = self.voting_sessions[session_id]
            
            return {
                "status": "success",
                "voting_result": session
            }
            
        except Exception as e:
            logger.error(f"Failed to get voting results: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_metrics(self, experiment_id: str) -> Dict[str, Any]:
        """Get current model performance metrics."""
        try:
            return await self.al_engine_client.get_metrics()
        except Exception as e:
            logger.error(f"Failed to get metrics: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_model_updates(self, experiment_id: str, limit: int = 10) -> Dict[str, Any]:
        """Get recent model updates."""
        try:
            return await self.blockchain_service.get_model_updates(limit)
        except Exception as e:
            logger.error(f"Failed to get model updates: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_blockchain_status(self) -> Dict[str, Any]:
        """Get blockchain status."""
        try:
            return await self.blockchain_service.get_chain_status()
        except Exception as e:
            logger.error(f"Failed to get blockchain status: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_recent_blocks(self, limit: int = 10) -> Dict[str, Any]:
        """Get recent blockchain blocks."""
        try:
            return await self.blockchain_service.get_recent_blocks(limit)
        except Exception as e:
            logger.error(f"Failed to get recent blocks: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get overall system status."""
        try:
            await self._check_service_health()
            
            uptime = time.time() - self.start_time
            uptime_str = f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s"
            
            total_samples_processed = sum(
                exp.get("total_labels", 0) for exp in self.active_experiments.values()
            )
            
            system_status = SystemStatus(
                orchestrator_status="healthy",
                al_engine_status=self.service_health.get("al-engine", ServiceHealth(
                    service_name="al-engine", status="unknown", last_check=""
                )).status,
                blockchain_status=self.service_health.get("blockchain", ServiceHealth(
                    service_name="blockchain", status="unknown", last_check=""
                )).status,
                active_experiments=len(self.active_experiments),
                total_samples_processed=total_samples_processed,
                system_uptime=uptime_str,
                last_health_check=datetime.now().isoformat()
            )
            
            return {
                "status": "success",
                "system_status": system_status.dict(),
                "service_health": {name: health.dict() for name, health in self.service_health.items()}
            }
            
        except Exception as e:
            logger.error(f"Failed to get system status: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def reset_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Reset experiment state."""
        try:
            if experiment_id in self.active_experiments:
                del self.active_experiments[experiment_id]
            
            # Reset AL Engine
            al_result = await self.al_engine_client.reset()
            
            return {
                "status": "success",
                "message": f"Experiment {experiment_id} reset successfully",
                "al_engine_result": al_result
            }
            
        except Exception as e:
            logger.error(f"Failed to reset experiment: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def reset_system(self) -> Dict[str, Any]:
        """Reset entire system."""
        try:
            # Reset all experiments
            self.active_experiments.clear()
            self.voting_sessions.clear()
            
            # Reset AL Engine
            al_result = await self.al_engine_client.reset()
            
            # Reset Blockchain
            blockchain_result = await self.blockchain_service.reset_blockchain()
            
            return {
                "status": "success",
                "message": "System reset successfully",
                "al_engine_result": al_result,
                "blockchain_result": blockchain_result
            }
            
        except Exception as e:
            logger.error(f"Failed to reset system: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            } 