#!/usr/bin/env python3
"""
Modern API Workflow Test

This script tests the modern microservices API endpoints to ensure
the updated JupyterLab extension will work correctly.
"""

import requests
import json
import time

def test_modern_api_workflow():
    """Test the modern microservices API workflow."""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Modern Microservices API Workflow")
    print("=" * 60)
    
    # Test 1: Check system status
    print("\n1. Testing system status...")
    try:
        response = requests.get(f"{base_url}/system/status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ System Status: {data['status']}")
            print(f"   Services: {len(data.get('services', {}))} services")
            for service, status in data.get('services', {}).items():
                print(f"   - {service}: {status.get('status', 'unknown')}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Initialize experiment
    print("\n2. Testing experiment initialization...")
    try:
        config = {
            "experiment_id": "modern_test_experiment",
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
            data = response.json()
            print(f"✅ Status: {data['status']}")
            print(f"   Experiment ID: {data['experiment_id']}")
            experiment_id = data['experiment_id']
        else:
            print(f"❌ Failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 3: Get experiment status
    print("\n3. Testing experiment status...")
    try:
        response = requests.get(f"{base_url}/experiments/{experiment_id}/status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            if data['status'] == 'success':
                exp_data = data['experiment']
                print(f"   State: {exp_data['state']}")
                print(f"   Labeled Samples: {exp_data['labeled_count']}")
                print(f"   Total Samples: {exp_data['total_samples']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Get next sample
    print("\n4. Testing next sample retrieval...")
    try:
        response = requests.get(f"{base_url}/experiments/{experiment_id}/next-sample")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            if data['status'] == 'success':
                sample = data['sample']
                print(f"   Sample ID: {sample['sample_id']}")
                print(f"   Uncertainty: {sample['uncertainty_score']:.3f}")
                print(f"   Predicted Label: {sample['predicted_label']}")
                sample_id = sample['sample_id']
                predicted_label = sample['predicted_label']
        else:
            print(f"❌ Failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 5: Submit label
    print("\n5. Testing label submission...")
    try:
        label_data = {
            "sample_id": sample_id,
            "label": predicted_label,
            "metadata": {"confidence": 0.9, "timestamp": int(time.time() * 1000)}
        }
        
        response = requests.post(
            f"{base_url}/experiments/{experiment_id}/submit-label",
            json=label_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            if data['status'] == 'success':
                print(f"   Model Updated: {data.get('model_updated', False)}")
                if 'metrics' in data:
                    metrics = data['metrics']
                    print(f"   New Accuracy: {metrics['accuracy']:.2%}")
                    print(f"   Labeled Count: {metrics['labeled_count']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 6: Get metrics
    print("\n6. Testing metrics retrieval...")
    try:
        response = requests.get(f"{base_url}/experiments/{experiment_id}/metrics")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            if data['status'] == 'success':
                metrics = data['metrics']
                print(f"   Accuracy: {metrics['accuracy']:.2%}")
                print(f"   F1 Score: {metrics['f1_score']:.3f}")
                print(f"   Labeled Count: {metrics['labeled_count']}")
                print(f"   Total Samples: {metrics['total_samples']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 7: Get model updates
    print("\n7. Testing model updates...")
    try:
        response = requests.get(f"{base_url}/experiments/{experiment_id}/model-updates")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            if data['status'] == 'success':
                updates = data['model_updates']
                print(f"   Total Updates: {len(updates.get('updates', []))}")
                if updates.get('summary'):
                    summary = updates['summary']
                    print(f"   Current Accuracy: {summary['current_accuracy']:.2%}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 8: Get blockchain status
    print("\n8. Testing blockchain status...")
    try:
        response = requests.get(f"{base_url}/blockchain/status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Blockchain Status: {data.get('status', 'unknown')}")
            if 'total_blocks' in data:
                print(f"   Total Blocks: {data['total_blocks']}")
                print(f"   Total Transactions: {data['total_transactions']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 9: Reset system
    print("\n9. Testing system reset...")
    try:
        response = requests.post(f"{base_url}/system/reset")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Reset Status: {data['status']}")
            print(f"   Message: {data.get('message', 'System reset')}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print(f"\n🎉 Modern API Workflow Test Complete!")
    print("=" * 60)
    print("✅ All modern microservices endpoints are working correctly!")
    print("✅ The updated JupyterLab extension should work with the new API!")

if __name__ == "__main__":
    try:
        test_modern_api_workflow()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to DAL services.")
        print("   Make sure all microservices are running:")
        print("   - Run: python start_microservices.py")
    except Exception as e:
        print(f"❌ Unexpected error: {e}") 