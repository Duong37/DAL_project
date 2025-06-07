#!/usr/bin/env python3
"""
DAL Microservices Stop Script

This script stops all running DAL microservices.
"""

import subprocess
import sys
import time

def stop_microservices():
    """Stop all DAL microservices."""
    print("🛑 Stopping DAL Microservices...")
    print("=" * 40)
    
    # Kill all Python processes running main.py
    try:
        print("Stopping Python services...")
        subprocess.run(["pkill", "-f", "python main.py"], check=False)
        time.sleep(2)
        
        # Force kill if needed
        subprocess.run(["pkill", "-9", "-f", "python main.py"], check=False)
        
        print("✅ All services stopped")
        
    except Exception as e:
        print(f"❌ Error stopping services: {e}")
        return False
    
    # Verify ports are free
    ports = [8000, 8001, 8002]
    for port in ports:
        try:
            result = subprocess.run(
                ["lsof", "-i", f":{port}"], 
                capture_output=True, 
                text=True
            )
            if result.returncode == 0:
                print(f"⚠️  Port {port} still in use")
            else:
                print(f"✅ Port {port} is free")
        except Exception:
            pass
    
    print("\n🎉 Cleanup complete!")
    return True

if __name__ == "__main__":
    stop_microservices() 