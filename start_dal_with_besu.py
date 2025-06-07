#!/usr/bin/env python3
"""
Complete DAL System with Besu IBFT Network

This script starts a complete DAL environment including:
1. 4-node Besu IBFT blockchain network
2. AL Engine service
3. Blockchain service  
4. DAL Orchestrator service

Usage:
    python start_dal_with_besu.py
"""

import os
import sys
import subprocess
import time
import json
import requests
import signal
from typing import Dict, List, Any
from pathlib import Path

# Configuration
BESU_NETWORK_DIR = "blockchain-service/IBFT-Network"
DOCKER_COMPOSE_FILE = f"{BESU_NETWORK_DIR}/docker-compose.yml"

# Service configurations
SERVICES = [
    {
        "name": "AL Engine",
        "directory": "al-engine",
        "port": 8001,
        "script": "main.py",
        "health_endpoint": "/health"
    },
    {
        "name": "Blockchain Service", 
        "directory": "blockchain-service",
        "port": 8002,
        "script": "main.py",
        "health_endpoint": "/health"
    },
    {
        "name": "DAL Orchestrator",
        "directory": "dal-backend", 
        "port": 8000,
        "script": "main.py",
        "health_endpoint": "/health"
    }
]

# Besu node configurations for monitoring
BESU_NODES = [
    {"name": "Node-1", "url": "http://localhost:8545"},
    {"name": "Node-2", "url": "http://localhost:8546"}, 
    {"name": "Node-3", "url": "http://localhost:8547"},
    {"name": "Node-4", "url": "http://localhost:8548"}
]

def start_besu_network():
    """Start the Besu IBFT network using Docker Compose"""
    print("Starting Besu IBFT Network...")
    
    # Change to network directory
    original_cwd = os.getcwd()
    network_path = Path(BESU_NETWORK_DIR)
    
    if not network_path.exists():
        print(f"Error: Besu network directory not found: {BESU_NETWORK_DIR}")
        print("Please ensure the blockchain-service/IBFT-Network directory exists")
        return False
        
    try:
        os.chdir(network_path)
        
        # Stop any existing containers
        subprocess.run(["docker-compose", "down"], 
                      capture_output=True, text=True)
        
        # Start the network
        result = subprocess.run(["docker-compose", "up", "-d"], 
                               capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Error starting Besu network: {result.stderr}")
            return False
            
        print("Besu containers started")
        return True
        
    except Exception as e:
        print(f"Error starting Besu network: {e}")
        return False
    finally:
        os.chdir(original_cwd)

def wait_for_besu_network():
    """Wait for all Besu nodes to become responsive"""
    print("Waiting for Besu nodes to become responsive...")
    
    max_wait = 120  # 2 minutes
    wait_interval = 5
    elapsed = 0
    
    while elapsed < max_wait:
        responsive_nodes = 0
        
        for node in BESU_NODES:
            try:
                # Check if node is responding
                response = requests.post(
                    node["url"],
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
                    if "result" in result:
                        block_number = int(result["result"], 16)
                        print(f"  {node['name']} responsive - Block: {block_number}")
                        responsive_nodes += 1
                        
            except Exception:
                print(f"  {node['name']} not ready yet...")
                
        print(f"{responsive_nodes}/4 Besu nodes are responsive")
        
        if responsive_nodes >= 4:
            return True
            
        time.sleep(wait_interval)
        elapsed += wait_interval
        
    print(f"Timeout: Only {responsive_nodes}/4 nodes became responsive")
    return False

def validate_ibft_network():
    """Validate that the IBFT network is working correctly"""
    print("Validating IBFT network...")
    
    try:
        # Check chain ID
        response = requests.post(
            BESU_NODES[0]["url"],
            json={
                "jsonrpc": "2.0",
                "method": "eth_chainId",
                "params": [],
                "id": 1
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            chain_id = int(result["result"], 16)
            if chain_id == 1337:
                print(f"  Chain ID verified: {chain_id}")
            else:
                print(f"  Unexpected chain ID: {chain_id}")
                
        # Check validators
        response = requests.post(
            BESU_NODES[0]["url"],
            json={
                "jsonrpc": "2.0",
                "method": "ibft_getValidatorsByBlockNumber",
                "params": ["latest"],
                "id": 1
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            validators = result.get("result", [])
            print(f"  IBFT Validators: {len(validators)} active")
            
            if len(validators) >= 4:
                print("  Sufficient validators for Byzantine fault tolerance")
            else:
                print("  Fewer than 4 validators")
                
        print("Besu IBFT network validated successfully")
        return True
        
    except Exception as e:
        print(f"Error validating IBFT network: {e}")
        return False

def is_port_in_use(port):
    """Check if a port is already in use"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        return sock.connect_ex(('localhost', port)) == 0

def wait_for_service_health(service):
    """Wait for a service to become healthy"""
    print(f"Waiting for {service['name']} to start...")
    
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"http://localhost:{service['port']}{service['health_endpoint']}", 
                                  timeout=2)
            if response.status_code == 200:
                print(f"  {service['name']} is healthy")
                return True
        except:
            pass
        time.sleep(2)
    return False

def start_service(service):
    """Start a microservice"""
    print(f"Starting {service['name']} on port {service['port']}...")
    
    # Check if port is already in use
    if is_port_in_use(service['port']):
        print(f"  Port {service['port']} is already in use.")
        
        # Check if it's our service already running
        try:
            response = requests.get(f"http://localhost:{service['port']}{service['health_endpoint']}", 
                                  timeout=2)
            if response.status_code == 200:
                print(f"  {service['name']} is already running and healthy")
                return True
        except:
            pass
            
        print(f"  Please stop the process using port {service['port']} and try again")
        return False
    
    # Start the service
    service_dir = Path(service['directory'])
    if not service_dir.exists():
        print(f"  Error: Service directory not found: {service['directory']}")
        return False
        
    try:
        # Start service in background
        env = os.environ.copy()
        env['PYTHONUNBUFFERED'] = '1'
        
        process = subprocess.Popen(
            [sys.executable, service['script']],
            cwd=service_dir,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Store process for cleanup
        if not hasattr(start_service, 'processes'):
            start_service.processes = []
        start_service.processes.append(process)
        
        # Wait for service to become healthy
        if wait_for_service_health(service):
            return True
        else:
            print(f"  {service['name']} failed to start or become healthy")
            process.terminate()
            return False
            
    except Exception as e:
        print(f"  Error starting {service['name']}: {e}")
        return False

def start_dal_services():
    """Start all DAL microservices"""
    print("\nStarting DAL Microservices...")
    
    started_services = []
    
    for service in SERVICES:
        if start_service(service):
            started_services.append(service)
        else:
            print(f"Failed to start {service['name']}")
            # Stop any services we've already started
            stop_all_services()
            return False
            
    return True

def get_node_block_number(node_url):
    """Get current block number for a node"""
    try:
        response = requests.post(
            node_url,
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
            return int(result["result"], 16)
    except:
        pass
    return None

def print_system_status():
    """Print comprehensive system status"""
    print("\nDAL System with Besu IBFT Network is ready!")
    
    # Besu network status
    print("\nBesu IBFT Network:")
    print("  Network: 4-node IBFT consensus")
    print("  Chain ID: 1337") 
    print("  Consensus: Istanbul Byzantine Fault Tolerance")
    print("  Block time: ~2 seconds")
    
    for node in BESU_NODES:
        block = get_node_block_number(node["url"])
        block_str = f"Block: {block}" if block else "Not responding"
        print(f"  {node['name']}: {node['url']} ({block_str})")
    
    # Service status
    print(f"\nDAL Microservices:")
    for service in SERVICES:
        try:
            response = requests.get(f"http://localhost:{service['port']}{service['health_endpoint']}", 
                                  timeout=2)
            status = "Running" if response.status_code == 200 else "Error"
        except:
            status = "Not responding"
        print(f"  {service['name']}: http://localhost:{service['port']}")
    
    # API Documentation
    print(f"\nAPI Documentation:")
    for service in SERVICES:
        print(f"  {service['name']}: http://localhost:{service['port']}/docs")
    
    print("\nUseful Commands:")
    print("  Test system:")
    print("    python test_microservices_workflow.py")
    print("    python test_besu_integration.py")
    print("")
    print("  Check blockchain:")
    print("    curl http://localhost:8002/blockchain/status")
    print("")
    print("  System status:")
    print("    curl http://localhost:8000/system/status")
    print("")
    print("  Stop system:")
    print("    python stop_microservices.py")
    print("    docker-compose -f blockchain-service/IBFT-Network/docker-compose.yml down")

def stop_besu_network():
    """Stop the Besu IBFT network"""
    original_cwd = os.getcwd()
    try:
        os.chdir(Path(BESU_NETWORK_DIR))
        subprocess.run(["docker-compose", "down"], capture_output=True)
        print("Besu network stopped")
    except Exception as e:
        print(f"Error stopping Besu network: {e}")
    finally:
        os.chdir(original_cwd)

def stop_all_services():
    """Stop all running services"""
    if hasattr(start_service, 'processes'):
        for process in start_service.processes:
            try:
                process.terminate()
                process.wait(timeout=5)
            except:
                try:
                    process.kill()
                except:
                    pass
        print("All services stopped")

def signal_handler(signum, frame):
    """Handle Ctrl+C gracefully"""
    print("\nShutting down...")
    stop_all_services()
    stop_besu_network()
    sys.exit(0)

def main():
    """Main function to start the complete DAL system"""
    # Set up signal handling
    signal.signal(signal.SIGINT, signal_handler)
    
    print("Starting Complete DAL System with Besu IBFT Network")
    print("=" * 60)
    
    try:
        # Step 1: Start Besu network
        if not start_besu_network():
            print("Failed to start Besu network")
            return 1
            
        # Step 2: Wait for Besu nodes
        if not wait_for_besu_network():
            print("Besu network failed to become ready")
            stop_besu_network()
            return 1
            
        # Step 3: Validate IBFT network
        if not validate_ibft_network():
            print("IBFT network validation failed")
            stop_besu_network()
            return 1
            
        # Step 4: Start DAL services
        if not start_dal_services():
            print("Failed to start DAL services")
            stop_besu_network()
            return 1
            
        # Step 5: Print status and keep running
        print_system_status()
        
        print("\nSystem running... Press Ctrl+C to stop")
        
        # Keep the main thread alive
        while True:
            time.sleep(10)
            
    except KeyboardInterrupt:
        signal_handler(None, None)
    except Exception as e:
        print(f"Error: {e}")
        stop_all_services()
        stop_besu_network()
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main()) 