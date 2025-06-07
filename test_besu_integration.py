#!/usr/bin/env python3
"""
Test Besu Integration

This script tests the integration between DAL services and the Besu blockchain
with deployed smart contracts.
"""

import asyncio
import json
import requests
import time
import sys
from pathlib import Path

# Add blockchain service to path
sys.path.append(str(Path(__file__).parent / "blockchain-service"))

from blockchain.besu_blockchain import BesuBlockchain

class BesuIntegrationTester:
    """Test the Besu blockchain integration."""
    
    def __init__(self):
        self.besu_nodes = [
            "http://localhost:8545",
            "http://localhost:8546", 
            "http://localhost:8547",
            "http://localhost:8548"
        ]
        self.blockchain = None
        
    async def test_network_connectivity(self):
        """Test if Besu nodes are running and responsive."""
        print("🔍 Testing Besu network connectivity...")
        
        responsive_nodes = 0
        for i, url in enumerate(self.besu_nodes, 1):
            try:
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
                        print(f"  ✅ Node-{i}: Block {block_number}")
                        responsive_nodes += 1
                    else:
                        print(f"  ❌ Node-{i}: Invalid response")
                else:
                    print(f"  ❌ Node-{i}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"  ❌ Node-{i}: {str(e)}")
        
        if responsive_nodes >= 3:
            print(f"✅ Network OK: {responsive_nodes}/4 nodes responsive")
            return True
        else:
            print(f"❌ Network Issue: Only {responsive_nodes}/4 nodes responsive")
            return False
    
    async def test_blockchain_adapter(self):
        """Test the BesuBlockchain adapter."""
        print("\n🔍 Testing BesuBlockchain adapter...")
        
        try:
            # Initialize blockchain adapter
            self.blockchain = BesuBlockchain()
            await self.blockchain.initialize()
            print("✅ Blockchain adapter initialized")
            
            # Test chain status
            status = await self.blockchain.get_chain_status()
            print(f"✅ Chain status: {status['status']}")
            print(f"   - Chain ID: {status.get('chain_id')}")
            print(f"   - Latest block: {status.get('latest_block', {}).get('number')}")
            print(f"   - Validators: {status.get('validators', {}).get('count')}")
            
            # Check if smart contract is loaded
            if status.get('smart_contract'):
                contract_stats = status['smart_contract']
                print(f"✅ Smart contract loaded:")
                print(f"   - Address: {contract_stats.get('contract_address')}")
                print(f"   - Data entries: {contract_stats.get('data_entries')}")
                print(f"   - Voting results: {contract_stats.get('voting_results')}")
                print(f"   - Model updates: {contract_stats.get('model_updates')}")
                return True
            else:
                print("⚠️ Smart contract not loaded - will use basic transactions")
                return True
                
        except Exception as e:
            print(f"❌ Blockchain adapter failed: {str(e)}")
            return False
    
    async def test_data_storage(self):
        """Test storing and retrieving data."""
        print("\n🔍 Testing data storage...")
        
        if not self.blockchain:
            print("❌ Blockchain adapter not initialized")
            return False
        
        try:
            # Test data
            test_data = {
                "type": "experiment_data",
                "experiment_id": "test_experiment_001",
                "timestamp": time.time(),
                "data": {
                    "model_type": "random_forest",
                    "dataset": "wine",
                    "samples_processed": ["sample_1", "sample_2", "sample_3"]
                }
            }
            
            # Store data
            print("📦 Storing test data...")
            tx_hash = await self.blockchain.store_transaction(test_data)
            print(f"✅ Data stored: {tx_hash}")
            
            # Wait a moment for blockchain to process
            await asyncio.sleep(3)
            
            # Try to retrieve data
            print("📥 Retrieving test data...")
            retrieved_data = await self.blockchain.retrieve_transaction(tx_hash)
            print(f"✅ Data retrieved: {retrieved_data.get('source', 'unknown source')}")
            
            return True
            
        except Exception as e:
            print(f"❌ Data storage test failed: {str(e)}")
            return False
    
    async def test_voting_result_storage(self):
        """Test storing voting results."""
        print("\n🔍 Testing voting result storage...")
        
        if not self.blockchain:
            print("❌ Blockchain adapter not initialized")
            return False
        
        try:
            voting_data = {
                "type": "voting_result",
                "session_id": f"session_{int(time.time())}",
                "sample_id": "sample_vote_001",
                "final_label": 2,
                "vote_count": 3,
                "consensus_reached": True,
                "votes": [
                    {"voter": "node_1", "label": 2, "confidence": 0.9},
                    {"voter": "node_2", "label": 2, "confidence": 0.8},
                    {"voter": "node_3", "label": 2, "confidence": 0.85}
                ],
                "timestamp": time.time()
            }
            
            print("🗳️ Storing voting result...")
            tx_hash = await self.blockchain.store_transaction(voting_data)
            print(f"✅ Voting result stored: {tx_hash}")
            
            return True
            
        except Exception as e:
            print(f"❌ Voting result storage failed: {str(e)}")
            return False
    
    async def test_model_update_storage(self):
        """Test storing model updates.""" 
        print("\n🔍 Testing model update storage...")
        
        if not self.blockchain:
            print("❌ Blockchain adapter not initialized")
            return False
            
        try:
            model_update_data = {
                "type": "model_update",
                "experiment_id": "test_experiment_001",
                "update_type": "retrain",
                "samples_processed": ["sample_1", "sample_2", "sample_3", "sample_4"],
                "performance_metrics": {
                    "accuracy": 0.92,
                    "precision": 0.89,
                    "recall": 0.94,
                    "f1_score": 0.915
                },
                "model_info": {
                    "algorithm": "random_forest",
                    "n_estimators": 100,
                    "max_depth": 10,
                    "training_samples": 150
                },
                "timestamp": time.time()
            }
            
            print("🔄 Storing model update...")
            tx_hash = await self.blockchain.store_transaction(model_update_data)
            print(f"✅ Model update stored: {tx_hash}")
            
            return True
            
        except Exception as e:
            print(f"❌ Model update storage failed: {str(e)}")
            return False
    
    async def test_blockchain_service_api(self):
        """Test the blockchain service API endpoints."""
        print("\n🔍 Testing blockchain service API...")
        
        try:
            # Check if blockchain service is running
            response = requests.get("http://localhost:8002/health", timeout=5)
            if response.status_code != 200:
                print("❌ Blockchain service not running")
                return False
            
            print("✅ Blockchain service is running")
            
            # Test chain status endpoint
            response = requests.get("http://localhost:8002/chain/status", timeout=10)
            if response.status_code == 200:
                status = response.json()
                print(f"✅ Chain status API: {status.get('status', 'unknown')}")
            else:
                print(f"⚠️ Chain status API returned: {response.status_code}")
            
            # Test storing data via API
            test_data = {
                "data": {
                    "type": "api_test",
                    "message": "Testing API endpoint",
                    "timestamp": time.time()
                }
            }
            
            response = requests.post(
                "http://localhost:8002/transactions",
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ API transaction stored: {result.get('transaction_id')}")
            else:
                print(f"⚠️ API transaction failed: {response.status_code}")
            
            return True
            
        except Exception as e:
            print(f"❌ Blockchain service API test failed: {str(e)}")
            return False
    
    def check_smart_contract_deployment(self):
        """Check if smart contract is deployed."""
        print("\n🔍 Checking smart contract deployment...")
        
        deployment_file = Path("dal-contracts/deployment.json")
        if deployment_file.exists():
            with open(deployment_file, 'r') as f:
                deployment_info = json.load(f)
                contract_address = deployment_info.get('contractAddress')
                print(f"✅ Smart contract deployed at: {contract_address}")
                return True
        else:
            print("⚠️ No deployment.json found - smart contract may not be deployed")
            print("💡 Run: cd dal-contracts && npm install && npm run deploy")
            return False

async def main():
    """Main test function."""
    print("🚀 Testing DAL Besu Integration")
    print("=" * 50)
    
    tester = BesuIntegrationTester()
    
    # Test 1: Network connectivity
    if not await tester.test_network_connectivity():
        print("\n❌ Besu network not ready. Please start the network first:")
        print("   cd blockchain-service/IBFT-Network && docker-compose up -d")
        return
    
    # Test 2: Smart contract deployment
    contract_deployed = tester.check_smart_contract_deployment()
    
    # Test 3: Blockchain adapter
    if not await tester.test_blockchain_adapter():
        print("\n❌ Blockchain adapter failed")
        return
    
    # Test 4: Data storage
    await tester.test_data_storage()
    
    # Test 5: Voting results
    await tester.test_voting_result_storage()
    
    # Test 6: Model updates
    await tester.test_model_update_storage()
    
    # Test 7: Service API (if running)
    await tester.test_blockchain_service_api()
    
    print("\n🎉 Integration testing completed!")
    
    if contract_deployed:
        print("\n✅ Your Besu blockchain integration is ready!")
        print("🔧 Next steps:")
        print("   1. Start DAL services: python start_dal_with_besu.py")
        print("   2. Test full workflow: python test_microservices_workflow.py")
    else:
        print("\n⚠️ To enable full smart contract features:")
        print("   1. cd dal-contracts")
        print("   2. npm install")
        print("   3. npm run deploy")
        print("   4. Restart blockchain service")

if __name__ == "__main__":
    asyncio.run(main()) 