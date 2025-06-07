#!/usr/bin/env python3
"""
DAL Microservices Workflow Test

This script demonstrates the complete workflow of the DAL microservices system:
1. Initialize an experiment
2. Get next samples for labeling
3. Submit labels
4. Check system status
"""

import requests
import json
import time

def test_dal_workflow():
    """Test the complete DAL workflow."""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing DAL Microservices Workflow")
    print("=" * 50)
    
    # 1. Check system status
    print("\n1. Checking system status...")
    response = requests.get(f"{base_url}/system/status")
    if response.status_code == 200:
        status = response.json()
        print(f"✅ System Status: {status['system_status']['orchestrator_status']}")
        print(f"   AL Engine: {status['system_status']['al_engine_status']}")
        print(f"   Blockchain: {status['system_status']['blockchain_status']}")
        print(f"   Active Experiments: {status['system_status']['active_experiments']}")
    else:
        print(f"❌ Failed to get system status: {response.status_code}")
        return
    
    # 2. Initialize experiment
    print("\n2. Initializing AL experiment...")
    config = {
        "experiment_id": "test_experiment",
        "al_framework": {"type": "sklearn"},
        "model": {
            "type": "random_forest",
            "parameters": {"n_estimators": 50, "random_state": 42}
        },
        "query_strategy": {"type": "uncertainty_sampling"},
        "dataset": {"type": "wine", "synthetic_samples": 50}
    }
    
    response = requests.post(
        f"{base_url}/experiments/initialize",
        json=config
    )
    
    if response.status_code == 200:
        result = response.json()
        if result["status"] == "success":
            experiment_id = result["experiment_id"]
            print(f"✅ Experiment initialized: {experiment_id}")
            
            # Print initial metrics
            initial_metrics = result["al_engine_result"]["initial_training"]["initial_metrics"]
            print(f"   Initial accuracy: {initial_metrics['accuracy']:.2%}")
            print(f"   Training samples: {initial_metrics['labeled_count']}")
            print(f"   Total samples: {initial_metrics['total_samples']}")
        else:
            print(f"❌ Experiment initialization failed: {result.get('error')}")
            return
    else:
        print(f"❌ Failed to initialize experiment: {response.status_code}")
        return
    
    # 3. Active Learning Loop
    print(f"\n3. Starting Active Learning loop...")
    
    for iteration in range(3):
        print(f"\n   Iteration {iteration + 1}:")
        
        # Get next sample
        response = requests.get(f"{base_url}/experiments/{experiment_id}/next-sample")
        if response.status_code == 200:
            result = response.json()
            if result["status"] == "success":
                sample = result["sample"]
                sample_id = sample["sample_id"]
                predicted_label = sample["predicted_label"]
                uncertainty = sample["uncertainty_score"]
                
                print(f"     📊 Sample: {sample_id}")
                print(f"     🎯 Predicted label: {predicted_label}")
                print(f"     ❓ Uncertainty: {uncertainty:.3f}")
                print(f"     📈 Remaining unlabeled: {sample['metadata']['remaining_unlabeled']}")
                
                # Submit label (using predicted label for demo)
                label_data = {
                    "sample_id": sample_id,
                    "label": predicted_label,
                    "confidence": 1.0 - uncertainty
                }
                
                response = requests.post(
                    f"{base_url}/experiments/{experiment_id}/submit-label",
                    json=label_data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result["status"] == "success":
                        metrics = result["metrics"]
                        print(f"     ✅ Label submitted successfully")
                        print(f"     📊 New accuracy: {metrics['accuracy']:.2%}")
                        print(f"     📈 Total labeled: {metrics['labeled_count']}")
                    else:
                        print(f"     ❌ Label submission failed: {result.get('error')}")
                else:
                    print(f"     ❌ Failed to submit label: {response.status_code}")
            else:
                print(f"     ❌ Failed to get next sample: {result.get('error')}")
                break
        else:
            print(f"     ❌ Failed to get next sample: {response.status_code}")
            break
        
        time.sleep(1)  # Brief pause between iterations
    
    # 4. Get final metrics
    print(f"\n4. Getting final experiment metrics...")
    response = requests.get(f"{base_url}/experiments/{experiment_id}/metrics")
    if response.status_code == 200:
        result = response.json()
        if result["status"] == "success":
            metrics = result["metrics"]
            print(f"✅ Final Results:")
            print(f"   Accuracy: {metrics['accuracy']:.2%}")
            print(f"   F1 Score: {metrics['f1_score']:.3f}")
            print(f"   Precision: {metrics['precision']:.3f}")
            print(f"   Recall: {metrics['recall']:.3f}")
            print(f"   Total Labeled: {metrics['labeled_count']}")
            print(f"   Total Samples: {metrics['total_samples']}")
    
    # 5. Check blockchain status
    print(f"\n5. Checking blockchain status...")
    response = requests.get(f"{base_url}/blockchain/status")
    if response.status_code == 200:
        blockchain_status = response.json()
        print(f"✅ Blockchain Status:")
        print(f"   Total Blocks: {blockchain_status['total_blocks']}")
        print(f"   Total Transactions: {blockchain_status['total_transactions']}")
        print(f"   Chain Valid: {blockchain_status['chain_valid']}")
    
    print(f"\n🎉 DAL Microservices Workflow Test Complete!")
    print("=" * 50)

if __name__ == "__main__":
    try:
        test_dal_workflow()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to DAL services.")
        print("   Make sure all microservices are running:")
        print("   - AL Engine: http://localhost:8001")
        print("   - Blockchain: http://localhost:8002") 
        print("   - Orchestrator: http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}") 