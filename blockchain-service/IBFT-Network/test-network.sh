#!/bin/bash

echo "🧪 Testing Besu IBFT Network..."
echo "=================================="

# Function to make JSON-RPC calls
make_rpc_call() {
    local port=$1
    local method=$2
    local params=$3
    local timeout=${4:-10}
    
    curl -s --max-time $timeout -X POST \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"$method\",\"params\":$params,\"id\":1}" \
        -H "Content-Type: application/json" \
        localhost:$port 2>/dev/null
}

# Function to check if a port is responding
check_port() {
    local port=$1
    nc -z localhost $port 2>/dev/null
    return $?
}

# Wait for network to stabilize
echo "⏳ Waiting for network to stabilize..."
sleep 15

echo ""
echo "📋 Test 1: Port Connectivity"
echo "─────────────────────────────"

# Check if ports are open before making RPC calls
for port in 8545 8546 8547 8548; do
    if check_port $port; then
        echo "✓ Port $port is open"
    else
        echo "✗ Port $port is not accessible"
        echo "  Make sure the network is running: docker-compose up -d"
    fi
done

echo ""
echo "📋 Test 2: JSON-RPC API Responses"
echo "──────────────────────────────────"

# Test RPC endpoints
all_nodes_responding=true
for port in 8545 8546 8547 8548; do
    response=$(make_rpc_call $port "eth_blockNumber" "[]")
    
    if [[ $response == *"result"* ]]; then
        block_hex=$(echo $response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
        block_dec=$(printf "%d" $block_hex 2>/dev/null || echo "0")
        echo "✓ Node on port $port is responding (block: $block_dec)"
    else
        echo "✗ Node on port $port is not responding"
        all_nodes_responding=false
    fi
done

echo ""
echo "📋 Test 3: IBFT Validator Configuration"
echo "───────────────────────────────────────"

validators_response=$(make_rpc_call 8545 "ibft_getValidatorsByBlockNumber" "[\"latest\"]")

if [[ $validators_response == *"result"* ]]; then
    echo "✓ Validators query successful"
    
    # Extract and display validators
    validators=$(echo $validators_response | grep -o '"0x[a-fA-F0-9]*"' | tr -d '"')
    validator_count=$(echo $validators | wc -w)
    
    echo "  Validator count: $validator_count"
    echo "  Validators:"
    echo "$validators" | while read -r validator; do
        if [ -n "$validator" ]; then
            echo "    └── $validator"
        fi
    done
    
    if [ "$validator_count" -eq 4 ]; then
        echo "✓ Correct number of validators (4) - Byzantine fault tolerant ✨"
    else
        echo "✗ Incorrect number of validators (expected 4, got $validator_count)"
    fi
else
    echo "✗ Failed to get validators"
    echo "  Response: $validators_response"
fi

echo ""
echo "📋 Test 4: Block Production & Finality"
echo "───────────────────────────────────────"

# Get initial block
block1_response=$(make_rpc_call 8545 "eth_blockNumber" "[]")
if [[ $block1_response == *"result"* ]]; then
    block1_hex=$(echo $block1_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    block1_dec=$(printf "%d" $block1_hex 2>/dev/null || echo "0")
    echo "📊 Initial block: $block1_dec"
    
    # Wait for new blocks
    echo "⏳ Waiting 8 seconds for new blocks..."
    sleep 8
    
    # Get new block
    block2_response=$(make_rpc_call 8545 "eth_blockNumber" "[]")
    if [[ $block2_response == *"result"* ]]; then
        block2_hex=$(echo $block2_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
        block2_dec=$(printf "%d" $block2_hex 2>/dev/null || echo "0")
        echo "📊 Final block: $block2_dec"
        
        blocks_produced=$((block2_dec - block1_dec))
        
        if [ "$blocks_produced" -gt 0 ]; then
            echo "✓ Block production active ($blocks_produced blocks in 8 seconds)"
            echo "  Block time: ~$((8 / blocks_produced)) seconds (configured: 2s)"
        else
            echo "✗ No blocks produced - check network consensus"
        fi
    fi
else
    echo "✗ Failed to get block number"
fi

echo ""
echo "📋 Test 5: Network Connectivity"
echo "───────────────────────────────"

# Check peer connections for each node
for port in 8545 8546 8547 8548; do
    node_num=$((port - 8544))
    peers_response=$(make_rpc_call $port "net_peerCount" "[]")
    
    if [[ $peers_response == *"result"* ]]; then
        peer_count_hex=$(echo $peers_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
        peer_count_dec=$(printf "%d" $peer_count_hex 2>/dev/null || echo "0")
        
        if [ "$peer_count_dec" -eq 3 ]; then
            echo "✓ Node-$node_num: Connected to all peers ($peer_count_dec/3)"
        else
            echo "⚠ Node-$node_num: Connected to $peer_count_dec/3 peers"
        fi
    else
        echo "✗ Node-$node_num: Failed to get peer count"
    fi
done

echo ""
echo "📋 Test 6: Chain Configuration"
echo "──────────────────────────────"

# Check chain ID
chain_response=$(make_rpc_call 8545 "eth_chainId" "[]")
if [[ $chain_response == *"result"* ]]; then
    chain_hex=$(echo $chain_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    chain_dec=$(printf "%d" $chain_hex 2>/dev/null || echo "0")
    
    if [ "$chain_dec" -eq 1337 ]; then
        echo "✓ Chain ID: $chain_dec (correct)"
    else
        echo "⚠ Chain ID: $chain_dec (expected 1337)"
    fi
else
    echo "✗ Failed to get chain ID"
fi

# Check protocol version
protocol_response=$(make_rpc_call 8545 "eth_protocolVersion" "[]")
if [[ $protocol_response == *"result"* ]]; then
    protocol=$(echo $protocol_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    echo "✓ Protocol version: $protocol"
else
    echo "⚠ Could not determine protocol version"
fi

echo ""
echo "📋 Test 7: Account Balances"
echo "───────────────────────────"

# Check pre-funded accounts
accounts=(
    "fe3b557e8fb62b89f4916b721be55ceb828dbd73"
    "627306090abaB3A6e1400e9345bC60c78a8BEf57"
    "f17f52151EbEF6C7334FAD080c5704D77216b732"
)

for account in "${accounts[@]}"; do
    balance_response=$(make_rpc_call 8545 "eth_getBalance" "[\"0x$account\", \"latest\"]")
    if [[ $balance_response == *"result"* ]]; then
        balance_hex=$(echo $balance_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
        balance_dec=$(printf "%d" $balance_hex 2>/dev/null || echo "0")
        balance_eth=$(echo "scale=6; $balance_dec / 1000000000000000000" | bc -l 2>/dev/null || echo "N/A")
        echo "✓ Account 0x$account: $balance_eth ETH"
    else
        echo "⚠ Could not check balance for 0x$account"
    fi
done

echo ""
echo "🎯 Test Summary"
echo "═══════════════"

# Summary
if [ "$all_nodes_responding" = true ]; then
    echo "✅ All nodes are operational"
else
    echo "❌ Some nodes are not responding"
fi

echo ""
echo "🔗 Network Information"
echo "─────────────────────"
echo "Chain ID: 1337"
echo "Consensus: IBFT 2.0 (Istanbul Byzantine Fault Tolerant)"
echo "Validators: 4 nodes"
echo "Block time: ~2 seconds"
echo "Features: Latest Ethereum protocol enabled"
echo ""
echo "🌐 Available Endpoints:"
echo "├── Node-1 (bootnode): http://localhost:8545"
echo "├── Node-2: http://localhost:8546"
echo "├── Node-3: http://localhost:8547"
echo "└── Node-4: http://localhost:8548"
echo ""
echo "📚 Example Commands:"
echo "# Get latest block:"
echo "curl -X POST --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' \\"
echo "     -H \"Content-Type: application/json\" localhost:8545"
echo ""
echo "# Get validators:"
echo "curl -X POST --data '{\"jsonrpc\":\"2.0\",\"method\":\"ibft_getValidatorsByBlockNumber\",\"params\":[\"latest\"],\"id\":1}' \\"
echo "     -H \"Content-Type: application/json\" localhost:8545"
echo ""

if command -v bc >/dev/null 2>&1; then
    echo "💡 Tip: Your network is ready for smart contract deployment and testing!"
else
    echo "💡 Tip: Install 'bc' for better balance calculations: brew install bc (macOS) or apt-get install bc (Linux)"
fi 