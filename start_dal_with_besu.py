#!/usr/bin/env python3
"""
DAL with Besu IBFT Network Startup Script

This script manages the complete DAL system startup including:
1. Besu IBFT Network (4 validator nodes)
2. AL Engine Service (port 8001)
3. Blockchain Service (port 8002) - connected to Besu
4. DAL Orchestrator Service (port 8000)
"""

import subprocess
import time
import sys
import os
import signal
import requests
from typing import List
from pathlib import Path

class DALBesuManager:
    def __init__(self):
        self.processes: List[subprocess.Popen] = []
        self.besu_network_dir = Path("blockchain-service/IBFT-Network")
        
        self.besu_nodes = [
            {"name": "Node-1", "url": "http://localhost:8545"},
            {"name": "Node-2", "url": "http://localhost:8546"},
            {"name": "Node-3", "url": "http://localhost:8547"},
            {"name": "Node-4", "url": "http://localhost:8548"}
        ]
        
        self.services = [
            {
                "name": "AL Engine",
                "directory": "al-engine",
                "port": 8001,
                "command": ["python", "main.py"],
                "health_url": "http://localhost:8001/health"
            },
            {
                "name": "Blockchain Service (Besu)",
                "directory": "blockchain-service",
                "port": 8002,
                "command": ["python", "main.py"],
                "health_url": "http://localhost:8002/health"
            },
            {
                "name": "DAL Orchestrator",
                "directory": "dal-server", 
                "port": 8000,
                "command": ["python", "main.py"],
                "health_url": "http://localhost:8000/health"
            }
        ]
    
    def start_besu_network(self) -> bool:
        """Start the Besu IBFT network."""
        print("🔗 Starting Besu IBFT Network...")
        print("=" * 50)
        
        # Check if docker-compose exists
        docker_compose_path = self.besu_network_dir / "docker-compose.yml"
        if not docker_compose_path.exists():
            print(f"❌ Docker compose file not found: {docker_compose_path}")
            return False
        
        # Start the network
        original_dir = os.getcwd()
        try:
            os.chdir(self.besu_network_dir)
            
            print("Starting Besu validators with docker-compose...")
            result = subprocess.run(
                ["docker-compose", "up", "-d"],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                print(f"❌ Failed to start Besu network: {result.stderr}")
                return False
                
            print("✅ Besu containers started")
            
        except Exception as e:
            print(f"❌ Error starting Besu network: {str(e)}")
            return False
        finally:
            os.chdir(original_dir)
        
        # Wait for nodes to become responsive
        return self.wait_for_besu_nodes()
    
    def wait_for_besu_nodes(self, timeout: int = 60) -> bool:
        """Wait for Besu nodes to become responsive."""
        print("⏳ Waiting for Besu nodes to become responsive...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            responsive_nodes = 0
            
            for node in self.besu_nodes:
                try:
                    response = requests.post(
                        node["url"],
                        json={
                            "jsonrpc": "2.0",
                            "method": "eth_blockNumber",
                            "params": [],
                            "id": 1
                        },
                        timeout=3
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if 'result' in result:
                            block_number = int(result['result'], 16)
                            print(f"  ✅ {node['name']} responsive - Block: {block_number}")
                            responsive_nodes += 1
                        
                except Exception:
                    print(f"  ⏳ {node['name']} not ready yet...")
            
            if responsive_nodes >= 3:  # Need at least 3 for IBFT consensus
                print(f"✅ {responsive_nodes}/4 Besu nodes are responsive")
                return self.validate_besu_network()
                
            time.sleep(3)
        
        print(f"❌ Timeout waiting for Besu nodes after {timeout} seconds")
        return False
    
    def validate_besu_network(self) -> bool:
        """Validate the IBFT network is working correctly."""
        print("🔍 Validating IBFT network...")
        
        try:
            url = self.besu_nodes[0]["url"]
            
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
                    print(f"  ✅ Chain ID verified: {chain_id}")
                else:
                    print(f"  ⚠️ Unexpected chain ID: {chain_id}")
            
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
                    print(f"  ✅ IBFT Validators: {len(validators)} active")
                    
                    if len(validators) >= 4:
                        print("  ✅ Sufficient validators for Byzantine fault tolerance")
                    else:
                        print("  ⚠️ Fewer than 4 validators")
            
            print("✅ Besu IBFT network validated successfully")
            return True
            
        except Exception as e:
            print(f"❌ Network validation failed: {str(e)}")
            return False
    
    def check_port_available(self, port: int) -> bool:
        """Check if a port is available."""
        try:
            response = requests.get(f"http://localhost:{port}/health", timeout=2)
            return False  # Port is in use
        except requests.exceptions.RequestException:
            return True  # Port is available
    
    def wait_for_service(self, service: dict, timeout: int = 30) -> bool:
        """Wait for a service to become healthy."""
        print(f"⏳ Waiting for {service['name']} to start...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(service['health_url'], timeout=2)
                if response.status_code == 200:
                    print(f"  ✅ {service['name']} is healthy")
                    return True
            except requests.exceptions.RequestException:
                pass
            time.sleep(1)
        
        print(f"  ❌ {service['name']} failed to start within {timeout} seconds")
        return False
    
    def start_service(self, service: dict) -> subprocess.Popen:
        """Start a single service."""
        print(f"🚀 Starting {service['name']} on port {service['port']}...")
        
        # Check if port is already in use
        if not self.check_port_available(service['port']):
            print(f"  ⚠️ Port {service['port']} is already in use.")
            # Try to connect anyway - service might already be running
            try:
                response = requests.get(service['health_url'], timeout=2)
                if response.status_code == 200:
                    print(f"  ✅ {service['name']} is already running and healthy")
                    return None
            except:
                pass
        
        # Change to service directory
        service_dir = os.path.join(os.getcwd(), service['directory'])
        if not os.path.exists(service_dir):
            print(f"  ❌ Service directory not found: {service_dir}")
            return None
        
        # Start the service
        try:
            process = subprocess.Popen(
                service['command'],
                cwd=service_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Give the service a moment to start
            time.sleep(3)
            
            # Check if process is still running
            if process.poll() is not None:
                stdout, stderr = process.communicate()
                print(f"  ❌ {service['name']} failed to start:")
                print(f"  STDOUT: {stdout}")
                print(f"  STDERR: {stderr}")
                return None
            
            return process
            
        except Exception as e:
            print(f"  ❌ Failed to start {service['name']}: {str(e)}")
            return None
    
    def start_dal_services(self) -> bool:
        """Start all DAL services in order."""
        print("\n🚀 Starting DAL Microservices...")
        print("=" * 50)
        
        for service in self.services:
            process = self.start_service(service)
            if process:
                self.processes.append(process)
                
                # Wait for service to become healthy
                if not self.wait_for_service(service):
                    print(f"❌ Failed to start {service['name']}")
                    return False
            else:
                # Check if service is already running and healthy
                try:
                    response = requests.get(service['health_url'], timeout=2)
                    if response.status_code == 200:
                        continue  # Service is already running
                except:
                    pass
                
                print(f"❌ Failed to start {service['name']}")
                return False
        
        return True
    
    def show_system_status(self):
        """Show the status of the entire DAL system."""
        print("\n🎉 DAL System with Besu IBFT Network is ready!")
        print("=" * 60)
        
        print("\n🔗 Besu IBFT Network:")
        for node in self.besu_nodes:
            try:
                response = requests.post(
                    node["url"],
                    json={"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1},
                    timeout=2
                )
                if response.status_code == 200:
                    block = int(response.json()['result'], 16)
                    print(f"  ✅ {node['name']}: {node['url']} (Block: {block})")
                else:
                    print(f"  ❌ {node['name']}: {node['url']} (Offline)")
            except:
                print(f"  ❌ {node['name']}: {node['url']} (Offline)")
        
        print("\n🛠️ DAL Microservices:")
        for service in self.services:
            try:
                response = requests.get(service['health_url'], timeout=2)
                if response.status_code == 200:
                    print(f"  ✅ {service['name']}: http://localhost:{service['port']}")
                else:
                    print(f"  ❌ {service['name']}: http://localhost:{service['port']} (Unhealthy)")
            except:
                print(f"  ❌ {service['name']}: http://localhost:{service['port']} (Offline)")
        
        print("\n📚 API Documentation:")
        for service in self.services:
            print(f"  📖 {service['name']}: http://localhost:{service['port']}/docs")
        
        print("\n🔧 Useful Commands:")
        print("  • Check Besu validators: curl -X POST --data '{\"jsonrpc\":\"2.0\",\"method\":\"ibft_getValidatorsByBlockNumber\",\"params\":[\"latest\"],\"id\":1}' -H \"Content-Type: application/json\" localhost:8545")
        print("  • Check DAL system: curl http://localhost:8000/system/status")
        print("  • Stop system: Press Ctrl+C")
        
    def stop_all_services(self):
        """Stop all running services and Besu network."""
        print("\n🛑 Stopping DAL system...")
        
        # Stop DAL services
        print("Stopping DAL microservices...")
        for process in self.processes:
            if process and process.poll() is None:
                try:
                    process.terminate()
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                except Exception as e:
                    print(f"Error stopping process: {e}")
        
        self.processes.clear()
        
        # Stop Besu network
        print("Stopping Besu IBFT network...")
        original_dir = os.getcwd()
        try:
            os.chdir(self.besu_network_dir)
            subprocess.run(["docker-compose", "down"], capture_output=True)
            print("✅ Besu network stopped")
        except Exception as e:
            print(f"Error stopping Besu network: {e}")
        finally:
            os.chdir(original_dir)
        
        print("✅ All services stopped")
    
    def signal_handler(self, signum, frame):
        """Handle interrupt signals."""
        print(f"\nReceived signal {signum}")
        self.stop_all_services()
        sys.exit(0)

def main():
    """Main function."""
    manager = DALBesuManager()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, manager.signal_handler)
    signal.signal(signal.SIGTERM, manager.signal_handler)
    
    try:
        # Step 1: Start Besu IBFT Network
        if not manager.start_besu_network():
            print("❌ Failed to start Besu IBFT network")
            sys.exit(1)
        
        # Step 2: Start DAL Services
        if not manager.start_dal_services():
            print("❌ Failed to start DAL services")
            manager.stop_all_services()
            sys.exit(1)
        
        # Step 3: Show system status
        manager.show_system_status()
        
        # Keep the script running
        print("\n⏳ System running... Press Ctrl+C to stop")
        while True:
            time.sleep(5)
            
            # Check if any DAL process has died
            for i, process in enumerate(manager.processes):
                if process and process.poll() is not None:
                    service_name = manager.services[i]['name']
                    print(f"❌ {service_name} has stopped unexpectedly")
                    manager.stop_all_services()
                    sys.exit(1)
                    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        manager.stop_all_services()
        sys.exit(1)

if __name__ == "__main__":
    main() 