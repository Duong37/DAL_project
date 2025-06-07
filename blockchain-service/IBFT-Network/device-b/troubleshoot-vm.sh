#!/bin/bash

echo "🔧 Device B VM Troubleshooting Script"
echo "====================================="

echo ""
echo "🌐 Testing network connectivity to main network..."
echo ""

# Test basic connectivity to main network
echo "1. Testing ping to main network (145.109.26.51)..."
if ping -c 3 145.109.26.51 > /dev/null 2>&1; then
    echo "   ✅ Basic connectivity: OK"
else
    echo "   ❌ Basic connectivity: FAILED - Cannot reach main network"
    echo "   Check your internet connection or firewall settings"
fi

echo ""
echo "2. Testing port connectivity to bootnode (145.109.26.51:30303)..."

# Test port connectivity
if command -v nc > /dev/null 2>&1; then
    if nc -z -w5 145.109.26.51 30303 2>/dev/null; then
        echo "   ✅ Port 30303: OPEN - Bootnode is accessible"
    else
        echo "   ❌ Port 30303: CLOSED or FILTERED"
        echo "   This is likely the problem! Main network port 30303 is not accessible from VM"
        echo "   Possible issues:"
        echo "   - Main network firewall blocking port 30303"
        echo "   - Router/NAT not forwarding port 30303"
        echo "   - University firewall blocking outbound P2P connections"
    fi
else
    echo "   ⚠️  netcat (nc) not available - trying telnet..."
    if command -v telnet > /dev/null 2>&1; then
        if timeout 5 telnet 145.109.26.51 30303 < /dev/null 2>&1 | grep -q "Connected"; then
            echo "   ✅ Port 30303: OPEN - Bootnode is accessible"
        else
            echo "   ❌ Port 30303: CLOSED or FILTERED"
        fi
    else
        echo "   ⚠️  Neither nc nor telnet available - manual test needed"
    fi
fi

echo ""
echo "3. Testing JSON-RPC connectivity to main network (145.109.26.51:8545)..."

main_rpc_response=$(curl -s --max-time 5 -X POST \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    -H "Content-Type: application/json" \
    145.109.26.51:8545 2>/dev/null)

if [[ $main_rpc_response == *"result"* ]]; then
    main_block_hex=$(echo $main_rpc_response | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    main_block_dec=$(printf "%d" $main_block_hex 2>/dev/null || echo "0")
    echo "   ✅ JSON-RPC: OK - Main network at block $main_block_dec"
else
    echo "   ❌ JSON-RPC: FAILED - Cannot reach main network JSON-RPC"
    echo "   This is expected if main network doesn't expose JSON-RPC externally"
fi

echo ""
echo "4. Checking Device B container status..."

if docker ps | grep -q "device-b-node"; then
    echo "   ✅ Container: Running"
    
    echo ""
    echo "5. Checking Device B logs for connectivity issues..."
    echo "   Recent logs:"
    docker compose -f docker-compose-vm.yml logs --tail=10 2>/dev/null | grep -E "(error|Error|ERROR|warn|Warn|WARN|peer|bootnode|connect)" || echo "   No specific errors found"
    
else
    echo "   ❌ Container: Not running"
    echo "   Start with: ./start-device-b-vm.sh"
fi

echo ""
echo "📋 Summary & Recommendations:"
echo ""

# Check which compose file exists
if [ -f "docker-compose-vm.yml" ]; then
    COMPOSE_FILE="docker-compose-vm.yml"
    echo "✅ Using correct VM configuration file"
else
    echo "❌ VM configuration file missing - create docker-compose-vm.yml"
fi

echo ""
echo "🔧 Troubleshooting Steps:"
echo ""
echo "If port 30303 is CLOSED:"
echo "1. On main network machine, check firewall:"
echo "   sudo ufw allow 30303"
echo "   # or for macOS:"
echo "   # Allow port 30303 in System Preferences > Security & Privacy > Firewall"
echo ""
echo "2. On main network machine, check if port is exposed:"
echo "   netstat -an | grep 30303"
echo "   # Should show: *.30303"
echo ""
echo "3. If behind router, forward port 30303 to main network machine"
echo ""
echo "If VM can't connect despite open port:"
echo "1. Check VM's outbound firewall (university networks often block P2P)"
echo "2. Try alternative bootnode discovery methods"
echo "3. Consider VPN or tunneling solutions"
echo ""
echo "🛠️  Quick fixes to try:"
echo "1. Restart Device B: ./start-device-b-vm.sh"
echo "2. Check logs: docker compose -f $COMPOSE_FILE logs -f"
echo "3. Wait longer (initial peer discovery can take 5-10 minutes over internet)" 