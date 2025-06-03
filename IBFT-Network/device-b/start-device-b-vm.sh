#!/bin/bash

echo "🚀 Starting Device B Node on VM..."
echo "=================================="

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

# Check which compose file to use
if [ -f "docker-compose-vm.yml" ]; then
    COMPOSE_FILE="docker-compose-vm.yml"
    echo "✅ Using VM configuration: $COMPOSE_FILE"
else
    COMPOSE_FILE="docker-compose.yml"
    echo "⚠️  Using local configuration: $COMPOSE_FILE"
fi

# Clean up any existing container
echo "🧹 Cleaning up existing Device B container..."
docker compose -f $COMPOSE_FILE down 2>/dev/null || true

# Start the Device B node
echo "🔄 Starting Device B node..."
docker compose -f $COMPOSE_FILE up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Device B node started successfully on VM!"
    echo ""
    echo "📊 Node Information:"
    echo "├── Container: device-b-node"
    echo "├── JSON-RPC: http://localhost:8550"
    echo "├── P2P Port: 30310"
    echo "└── Data: ./node-data"
    echo ""
    echo "🔗 Connecting to Main Network:"
    echo "├── Chain ID: 1337"
    echo "├── Bootnode: 145.109.26.51:30303"
    echo "└── Sync Mode: FULL"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Wait for synchronization: ./check-sync-vm.sh"
    echo "2. Check logs: docker compose -f $COMPOSE_FILE logs -f"
    echo "3. Test connection: curl -X POST --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' -H \"Content-Type: application/json\" localhost:8550"
    echo ""
    echo "⏱️  Give it 1-2 minutes to connect to the main network over the internet..."
else
    echo "❌ Failed to start Device B node. Check the logs with: docker compose -f $COMPOSE_FILE logs"
    exit 1
fi 