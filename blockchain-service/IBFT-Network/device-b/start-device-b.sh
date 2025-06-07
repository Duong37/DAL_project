#!/bin/bash

echo "🚀 Starting Device B Node..."
echo "=============================="

# Navigate to the device-b directory
cd "$(dirname "$0")"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if genesis file exists
if [ ! -f "genesis.json" ]; then
    echo "❌ Error: genesis.json not found. Please copy it from the main network."
    echo "Run: cp ../IBFT-Network/genesis.json ."
    exit 1
fi

# Create data directory if it doesn't exist
mkdir -p data

# Stop any existing containers
docker compose down -v

# Start the node
docker compose up -d

# Wait for node to start
sleep 5

echo "Device B node started. Use check-sync.sh to monitor synchronization."

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Device B node started successfully!"
    echo ""
    echo "📊 Node Information:"
    echo "├── Container: device-b-node"
    echo "├── JSON-RPC: http://localhost:8550"
    echo "├── P2P Port: 30310"
    echo "└── Data: ./node-data"
    echo ""
    echo "🔗 Connecting to Main Network:"
    echo "├── Chain ID: 1337"
    echo "├── Bootnode: Node-1 from main network"
    echo "└── Sync Mode: FULL"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Wait for synchronization: ./check-sync.sh"
    echo "2. Check logs: docker-compose logs -f"
    echo "3. Test connection: curl -X POST --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' -H \"Content-Type: application/json\" localhost:8550"
    echo ""
    echo "⏱️  Give it 30-60 seconds to connect and sync with the main network..."
else
    echo "❌ Failed to start Device B node. Check the logs with: docker-compose logs"
    exit 1
fi 