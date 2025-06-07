#!/usr/bin/env python3
"""
Start Besu IBFT Network

This script manages the Besu IBFT network startup and validation.
"""

import subprocess
import time
import requests
import json
import logging
import sys
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BesuNetworkManager:
    """Manages the Besu IBFT network lifecycle."""
    
    def __init__(self):
        self.network_dir = Path(__file__).parent.parent / "IBFT-Network"
        self.node_urls = [
            "http://localhost:8545",
            "http://localhost:8546", 
            "http://localhost:8547",
            "http://localhost:8548"
        ]
        
    def start_network(self):
        """Start the Besu IBFT network using docker-compose."""
        logger.info("Starting Besu IBFT network...")
        
        # Change to network directory
        original_dir = os.getcwd()
        try:
            os.chdir(self.network_dir)
            
            # Check if docker-compose.yml exists
            if not Path("docker-compose.yml").exists():
                logger.error("docker-compose.yml not found in IBFT-Network directory")
                return False
            
            # Start the network
            result = subprocess.run(
                ["docker-compose", "up", "-d"],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Failed to start network: {result.stderr}")
                return False
                
            logger.info("Docker containers started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error starting network: {str(e)}")
            return False
        finally:
            os.chdir(original_dir)
    
    def wait_for_nodes(self, timeout=60):
        """Wait for all nodes to become responsive."""
        logger.info("Waiting for nodes to become responsive...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            all_responsive = True
            
            for i, url in enumerate(self.node_urls, 1):
                try:
                    response = requests.post(
                        url,
                        json={
                            "jsonrpc": "2.0",
                            "method": "eth_blockNumber",
                            "params": [],
                            "id": 1
                        },
                        timeout=5
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if 'result' in result:
                            block_number = int(result['result'], 16)
                            logger.info(f"Node-{i} responsive - Block: {block_number}")
                        else:
                            all_responsive = False
                    else:
                        all_responsive = False
                        
                except Exception as e:
                    logger.debug(f"Node-{i} not ready: {str(e)}")
                    all_responsive = False
            
            if all_responsive:
                logger.info("All nodes are responsive!")
                return True
                
            time.sleep(2)
        
        logger.error(f"Timeout waiting for nodes after {timeout} seconds")
        return False
    
    def validate_network(self):
        """Validate the IBFT network is working correctly."""
        logger.info("Validating IBFT network...")
        
        try:
            # Test primary node
            url = self.node_urls[0]
            
            # Check chain ID
            response = requests.post(url, json={
                "jsonrpc": "2.0",
                "method": "eth_chainId", 
                "params": [],
                "id": 1
            }, timeout=10)
            
            if response.status_code == 200:
                chain_id = int(response.json()['result'], 16)
                if chain_id == 1337:
                    logger.info(f"✓ Chain ID verified: {chain_id}")
                else:
                    logger.warning(f"Unexpected chain ID: {chain_id}")
            
            # Check IBFT validators
            response = requests.post(url, json={
                "jsonrpc": "2.0",
                "method": "ibft_getValidatorsByBlockNumber",
                "params": ["latest"],
                "id": 1
            }, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    validators = result['result']
                    logger.info(f"✓ IBFT Validators ({len(validators)}): {validators}")
                    
                    if len(validators) >= 4:
                        logger.info("✓ Network has sufficient validators for Byzantine fault tolerance")
                    else:
                        logger.warning("⚠ Network has fewer than 4 validators")
                        
            # Check if blocks are being produced
            time.sleep(5)  # Wait for a block
            
            response = requests.post(url, json={
                "jsonrpc": "2.0",
                "method": "eth_blockNumber",
                "params": [],
                "id": 1
            }, timeout=10)
            
            if response.status_code == 200:
                block_number = int(response.json()['result'], 16)
                if block_number > 0:
                    logger.info(f"✓ Blocks are being produced - Current block: {block_number}")
                else:
                    logger.warning("⚠ No blocks produced yet")
            
            logger.info("✓ Network validation completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Network validation failed: {str(e)}")
            return False
    
    def get_network_status(self):
        """Get comprehensive network status."""
        logger.info("Getting network status...")
        
        status = {
            "nodes": [],
            "consensus": "IBFT 2.0",
            "chain_id": None,
            "validators": [],
            "latest_block": None
        }
        
        for i, url in enumerate(self.node_urls, 1):
            node_status = {"node": f"Node-{i}", "url": url, "status": "offline"}
            
            try:
                # Test basic connectivity
                response = requests.post(url, json={
                    "jsonrpc": "2.0",
                    "method": "eth_blockNumber",
                    "params": [],
                    "id": 1
                }, timeout=5)
                
                if response.status_code == 200:
                    result = response.json()
                    if 'result' in result:
                        block_number = int(result['result'], 16)
                        node_status.update({
                            "status": "online",
                            "block_number": block_number
                        })
                        
                        if status["latest_block"] is None or block_number > status["latest_block"]:
                            status["latest_block"] = block_number
                            
            except Exception as e:
                node_status["error"] = str(e)
            
            status["nodes"].append(node_status)
        
        # Get chain info from first available node
        for node in status["nodes"]:
            if node["status"] == "online":
                try:
                    url = node["url"]
                    
                    # Get chain ID
                    response = requests.post(url, json={
                        "jsonrpc": "2.0",
                        "method": "eth_chainId",
                        "params": [],
                        "id": 1
                    }, timeout=5)
                    
                    if response.status_code == 200:
                        status["chain_id"] = int(response.json()['result'], 16)
                    
                    # Get validators
                    response = requests.post(url, json={
                        "jsonrpc": "2.0", 
                        "method": "ibft_getValidatorsByBlockNumber",
                        "params": ["latest"],
                        "id": 1
                    }, timeout=5)
                    
                    if response.status_code == 200:
                        result = response.json()
                        if 'result' in result:
                            status["validators"] = result['result']
                    
                    break
                    
                except Exception as e:
                    logger.debug(f"Failed to get chain info from {url}: {str(e)}")
        
        return status

def main():
    """Main function to start and validate Besu network."""
    manager = BesuNetworkManager()
    
    logger.info("=== Starting Besu IBFT Network ===")
    
    # Start the network
    if not manager.start_network():
        logger.error("Failed to start network")
        sys.exit(1)
    
    # Wait for nodes to be ready
    if not manager.wait_for_nodes():
        logger.error("Nodes failed to become responsive")
        sys.exit(1)
    
    # Validate network
    if not manager.validate_network():
        logger.error("Network validation failed")
        sys.exit(1)
    
    # Show final status
    status = manager.get_network_status()
    logger.info("=== Network Status ===")
    logger.info(f"Chain ID: {status['chain_id']}")
    logger.info(f"Consensus: {status['consensus']}")
    logger.info(f"Latest Block: {status['latest_block']}")
    logger.info(f"Validators: {len(status['validators'])}")
    
    online_nodes = [n for n in status['nodes'] if n['status'] == 'online']
    logger.info(f"Online Nodes: {len(online_nodes)}/{len(status['nodes'])}")
    
    if len(online_nodes) >= 3:  # Need at least 3 for IBFT consensus
        logger.info("✓ Network is ready for DAL blockchain service")
        sys.exit(0)
    else:
        logger.error("✗ Insufficient nodes for IBFT consensus")
        sys.exit(1)

if __name__ == "__main__":
    main() 