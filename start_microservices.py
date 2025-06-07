#!/usr/bin/env python3
"""
DAL Microservices Startup Script

This script starts all three DAL microservices in the correct order:
1. AL Engine Service (port 8001)
2. Blockchain Service (port 8002)  
3. DAL Orchestrator Service (port 8000)
"""

import subprocess
import time
import sys
import os
import signal
import requests
from typing import List

class MicroserviceManager:
    def __init__(self):
        self.processes: List[subprocess.Popen] = []
        self.services = [
            {
                "name": "AL Engine",
                "directory": "al-engine",
                "port": 8001,
                "command": ["python", "main.py"],
                "health_url": "http://localhost:8001/health"
            },
            {
                "name": "Blockchain Service", 
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
    
    def check_port_available(self, port: int) -> bool:
        """Check if a port is available."""
        try:
            response = requests.get(f"http://localhost:{port}/health", timeout=2)
            return False  # Port is in use
        except requests.exceptions.RequestException:
            return True  # Port is available
    
    def wait_for_service(self, service: dict, timeout: int = 30) -> bool:
        """Wait for a service to become healthy."""
        print(f"Waiting for {service['name']} to start...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(service['health_url'], timeout=2)
                if response.status_code == 200:
                    print(f"✅ {service['name']} is healthy")
                    return True
            except requests.exceptions.RequestException:
                pass
            time.sleep(1)
        
        print(f"❌ {service['name']} failed to start within {timeout} seconds")
        return False
    
    def start_service(self, service: dict) -> subprocess.Popen:
        """Start a single service."""
        print(f"Starting {service['name']} on port {service['port']}...")
        
        # Check if port is already in use
        if not self.check_port_available(service['port']):
            print(f"⚠️  Port {service['port']} is already in use. {service['name']} may already be running.")
            return None
        
        # Change to service directory
        service_dir = os.path.join(os.getcwd(), service['directory'])
        if not os.path.exists(service_dir):
            print(f"❌ Service directory not found: {service_dir}")
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
            time.sleep(2)
            
            # Check if process is still running
            if process.poll() is not None:
                stdout, stderr = process.communicate()
                print(f"❌ {service['name']} failed to start:")
                print(f"STDOUT: {stdout}")
                print(f"STDERR: {stderr}")
                return None
            
            return process
            
        except Exception as e:
            print(f"❌ Failed to start {service['name']}: {str(e)}")
            return None
    
    def start_all_services(self):
        """Start all services in order."""
        print("🚀 Starting DAL Microservices...")
        print("=" * 50)
        
        for service in self.services:
            process = self.start_service(service)
            if process:
                self.processes.append(process)
                
                # Wait for service to become healthy
                if not self.wait_for_service(service):
                    print(f"❌ Failed to start {service['name']}")
                    self.stop_all_services()
                    return False
            else:
                # Check if service is already running
                try:
                    response = requests.get(service['health_url'], timeout=2)
                    if response.status_code == 200:
                        print(f"✅ {service['name']} is already running and healthy")
                        continue
                except requests.exceptions.RequestException:
                    pass
                
                print(f"❌ Failed to start {service['name']}")
                self.stop_all_services()
                return False
        
        print("\n🎉 All services started successfully!")
        print("=" * 50)
        print("Service URLs:")
        for service in self.services:
            print(f"  {service['name']}: http://localhost:{service['port']}")
        print("\nAPI Documentation:")
        for service in self.services:
            print(f"  {service['name']}: http://localhost:{service['port']}/docs")
        print("\nPress Ctrl+C to stop all services")
        
        return True
    
    def stop_all_services(self):
        """Stop all running services."""
        print("\n🛑 Stopping all services...")
        
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
        print("✅ All services stopped")
    
    def signal_handler(self, signum, frame):
        """Handle interrupt signals."""
        print(f"\nReceived signal {signum}")
        self.stop_all_services()
        sys.exit(0)

def main():
    """Main function."""
    manager = MicroserviceManager()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, manager.signal_handler)
    signal.signal(signal.SIGTERM, manager.signal_handler)
    
    try:
        if manager.start_all_services():
            # Keep the script running
            while True:
                time.sleep(1)
                
                # Check if any process has died
                for i, process in enumerate(manager.processes):
                    if process and process.poll() is not None:
                        service_name = manager.services[i]['name']
                        print(f"❌ {service_name} has stopped unexpectedly")
                        manager.stop_all_services()
                        sys.exit(1)
        else:
            print("❌ Failed to start all services")
            sys.exit(1)
            
    except KeyboardInterrupt:
        manager.stop_all_services()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        manager.stop_all_services()
        sys.exit(1)

if __name__ == "__main__":
    main() 