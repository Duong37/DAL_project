#!/bin/bash

# Function to get current block number
get_block_number() {
    curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8550 | \
    grep -o '"result":"[^"]*"' | \
    cut -d'"' -f4 | \
    xargs printf "%d\n" 2>/dev/null
}

# Function to get sync status
get_sync_status() {
    curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
        http://localhost:8550
}

echo "Checking Device B synchronization status..."
echo "----------------------------------------"

# Check if node is accessible
if ! curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
    http://localhost:8550 > /dev/null; then
    echo "❌ Error: Cannot connect to Device B node. Make sure it's running."
    exit 1
fi

# Get current block number
BLOCK_NUM=$(get_block_number)
SYNC_STATUS=$(get_sync_status)

if [[ $SYNC_STATUS == *"false"* ]]; then
    echo "✅ Node is synchronized"
    echo "Current block number: $BLOCK_NUM"
else
    echo "🔄 Node is still synchronizing"
    echo "Current block number: $BLOCK_NUM"
fi

# Check peer count
PEER_COUNT=$(curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
    http://localhost:8550 | \
    grep -o '"result":"[^"]*"' | \
    cut -d'"' -f4 | \
    xargs printf "%d\n" 2>/dev/null)

echo "Connected peers: $PEER_COUNT"

echo "🔍 Checking Device B Node Synchronization..."
echo "============================================="

# Function to make JSON-RPC calls
make_rpc_call() {
    local method=$1
    local params=$2
    local timeout=${3:-10}
    
    curl -s --max-time $timeout -X POST \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"$method\",\"params\":$params,\"id\":1}" \
        -H "Content-Type: application/json" \
        localhost:8550 2>/dev/null
}

# Check if container is running
if ! docker ps | grep -q "device-b-node"; then
    echo "❌ Device B node container is not running!"
    echo "Start it with: ./start-device-b.sh"
    exit 1
fi

echo "✅ Device B node container is running"
echo ""

# Check JSON-RPC connectivity
echo "📡 Testing JSON-RPC connectivity..."
response=$(make_rpc_call "eth_blockNumber" "[]")

if [[ $response == *"result"* ]]; then
    block_hex=$(echo $response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    block_dec=$(printf "%d" $block_hex 2>/dev/null || echo "0")
    echo "✅ JSON-RPC responding - Current block: $block_dec"
else
    echo "❌ JSON-RPC not responding yet. Wait a few more seconds..."
    exit 1
fi

# Check peer connections
echo ""
echo "🌐 Checking peer connections..."
peers_response=$(make_rpc_call "net_peerCount" "[]")

if [[ $peers_response == *"result"* ]]; then
    peer_count_hex=$(echo $peers_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    peer_count_dec=$(printf "%d" $peer_count_hex 2>/dev/null || echo "0")
    
    if [ "$peer_count_dec" -gt 0 ]; then
        echo "✅ Connected to $peer_count_dec peer(s)"
    else
        echo "⚠️  Not connected to any peers yet"
        echo "   This may take a few minutes to establish connections"
    fi
else
    echo "❌ Failed to get peer count"
fi

# Check sync status
echo ""
echo "🔄 Checking synchronization status..."
sync_response=$(make_rpc_call "eth_syncing" "[]")

if [[ $sync_response == *"false"* ]]; then
    echo "✅ Node is fully synchronized!"
elif [[ $sync_response == *"result"* ]]; then
    echo "🔄 Node is synchronizing..."
    # Try to extract sync info if available
    if [[ $sync_response == *"currentBlock"* ]]; then
        echo "   Sync in progress - check logs for details"
    fi
else
    echo "⚠️  Unable to determine sync status"
fi

# Compare with main network
echo ""
echo "📊 Comparing with main network..."

# Get block from main network (assuming it's running)
main_response=$(curl -s --max-time 5 -X POST \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    -H "Content-Type: application/json" \
    localhost:8545 2>/dev/null)

if [[ $main_response == *"result"* ]]; then
    main_block_hex=$(echo $main_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    main_block_dec=$(printf "%d" $main_block_hex 2>/dev/null || echo "0")
    
    echo "├── Main Network (Node-1): Block $main_block_dec"
    echo "└── Device B: Block $block_dec"
    
    block_diff=$((main_block_dec - block_dec))
    
    if [ "$block_diff" -eq 0 ]; then
        echo "✅ Device B is fully synchronized with main network!"
    elif [ "$block_diff" -lt 5 ]; then
        echo "✅ Device B is nearly synchronized (${block_diff} blocks behind)"
    else
        echo "🔄 Device B is synchronizing (${block_diff} blocks behind)"
    fi
else
    echo "⚠️  Cannot connect to main network (localhost:8545)"
    echo "   Make sure the main IBFT network is running"
fi

# Chain configuration check
echo ""
echo "⚙️  Checking chain configuration..."
chain_response=$(make_rpc_call "eth_chainId" "[]")

if [[ $chain_response == *"result"* ]]; then
    chain_hex=$(echo $chain_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    chain_dec=$(printf "%d" $chain_hex 2>/dev/null || echo "0")
    
    if [ "$chain_dec" -eq 1337 ]; then
        echo "✅ Chain ID: $chain_dec (correct)"
    else
        echo "❌ Chain ID: $chain_dec (expected 1337)"
    fi
else
    echo "❌ Failed to get chain ID"
fi

echo ""
echo "📋 Device B Node Summary:"
echo "├── Endpoint: http://localhost:8550"
echo "├── Current Block: $block_dec"
echo "├── Peers: $peer_count_dec"
echo "├── Chain ID: $chain_dec"
echo "└── Container: device-b-node"
echo ""
echo "💡 Commands:"
echo "├── View logs: docker-compose logs -f"
echo "├── Stop node: docker-compose down"
echo "└── Restart: ./start-device-b.sh" 