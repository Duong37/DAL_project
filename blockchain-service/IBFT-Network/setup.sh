#!/bin/bash

echo "Setting up Besu IBFT Network with Docker..."

# Navigate to the IBFT-Network directory
cd "$(dirname "$0")"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Clean up any existing containers from previous runs
echo "Cleaning up any existing containers..."
docker rm -f temp-node1 besu-init besu-node1 besu-node2 besu-node3 besu-node4 2>/dev/null || true

# Clean up existing networkFiles directory
echo "Cleaning up existing networkFiles directory..."
rm -rf networkFiles/ genesis.json Node-*/data/key* docker-compose.yml.bak 2>/dev/null || true

# Step 1: Generate blockchain config and keys using Docker
echo "Generating blockchain configuration and keys..."
docker run --rm \
  -v "$(pwd)/ibftConfigFile.json:/opt/besu/config/ibftConfigFile.json" \
  -v "$(pwd)/networkFiles:/opt/besu/networkFiles" \
  hyperledger/besu:latest \
  operator generate-blockchain-config \
  --config-file=/opt/besu/config/ibftConfigFile.json \
  --to=/opt/besu/networkFiles \
  --private-key-file-name=key

if [ $? -ne 0 ]; then
    echo "Error: Failed to generate blockchain configuration"
    exit 1
fi

# Step 2: Copy genesis file to current directory
echo "Copying genesis file..."
if [ -f "networkFiles/genesis.json" ]; then
    cp networkFiles/genesis.json .
    echo "Genesis file copied successfully"
else
    echo "Error: Genesis file not found"
    exit 1
fi

# Step 3: Copy node keys to respective node directories
echo "Copying node keys to node directories..."

# Get the list of key directories (node addresses)
if [ -d "networkFiles/keys" ]; then
    key_dirs=($(ls networkFiles/keys/))
    echo "Found ${#key_dirs[@]} validator key directories"
else
    echo "Error: Keys directory not found"
    exit 1
fi

for i in {0..3}; do
    node_num=$((i + 1))
    if [ ${#key_dirs[@]} -gt $i ]; then
        key_dir="${key_dirs[$i]}"
        echo "Copying keys for Node-$node_num from $key_dir"
        cp "networkFiles/keys/$key_dir/key" "Node-$node_num/data/"
        cp "networkFiles/keys/$key_dir/key.pub" "Node-$node_num/data/"
        
        # Verify keys were copied
        if [ ! -f "Node-$node_num/data/key" ]; then
            echo "Error: Failed to copy keys for Node-$node_num"
            exit 1
        fi
    else
        echo "Error: Not enough key directories found for Node-$node_num"
        exit 1
    fi
done

# Step 4: Start Node-1 temporarily to get enode URL
echo "Starting Node-1 temporarily to get enode URL..."
docker run --rm -d \
  --name temp-node1 \
  --network host \
  -v "$(pwd)/Node-1/data:/opt/besu/data" \
  -v "$(pwd)/genesis.json:/opt/besu/genesis.json" \
  hyperledger/besu:latest \
  --data-path=/opt/besu/data \
  --genesis-file=/opt/besu/genesis.json \
  --rpc-http-enabled \
  --rpc-http-host=0.0.0.0 \
  --rpc-http-api=ETH,NET,IBFT \
  --host-allowlist="*" \
  --rpc-http-cors-origins="all" \
  --p2p-host=0.0.0.0 \
  --profile=ENTERPRISE

# Wait for the node to start and get enode URL
echo "Waiting for Node-1 to start..."
max_attempts=30
attempt=0
enode_url=""

while [ $attempt -lt $max_attempts ] && [ -z "$enode_url" ]; do
    sleep 2
    enode_url=$(docker logs temp-node1 2>&1 | grep -o 'enode://[^[:space:]]*' | head -1)
    attempt=$((attempt + 1))
    if [ -n "$enode_url" ]; then
        break
    fi
    echo "Attempt $attempt/$max_attempts: Waiting for enode URL..."
done

# Stop the temporary node
docker stop temp-node1 > /dev/null 2>&1

if [ -n "$enode_url" ]; then
    echo "Found enode URL: $enode_url"
    
    # Extract the public key from the enode URL
    public_key=$(echo "$enode_url" | sed 's/enode:\/\/\([^@]*\)@.*/\1/')
    
    if [ -n "$public_key" ]; then
        # Update docker-compose.yml with the actual enode URL
        echo "Updating docker-compose.yml with enode URL..."
        if [ -f "docker-compose.yml" ]; then
            # Create backup
            cp docker-compose.yml docker-compose.yml.bak
            
            # Update the placeholder
            sed -i.tmp "s/enode:\/\/PLACEHOLDER@172.20.0.10:30303/enode:\/\/$public_key@172.20.0.10:30303/g" docker-compose.yml
            rm -f docker-compose.yml.tmp
            
            echo "✓ Docker Compose configuration updated successfully!"
        else
            echo "Error: docker-compose.yml file not found"
            exit 1
        fi
    else
        echo "Error: Could not extract public key from enode URL"
        exit 1
    fi
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start the network: docker-compose up -d"
    echo "2. Test the network: ./test-network.sh"
    echo ""
    echo "Network endpoints will be available at:"
    echo "├── Node-1 (bootnode): http://localhost:8545"
    echo "├── Node-2: http://localhost:8546"
    echo "├── Node-3: http://localhost:8547"
    echo "└── Node-4: http://localhost:8548"
    echo ""
    echo "Network features:"
    echo "├── Chain ID: 1337"
    echo "├── Consensus: IBFT 2.0"
    echo "├── Block time: 2 seconds"
    echo "├── Validators: 4 nodes"
    echo "└── Latest Ethereum features enabled"
    
else
    echo "❌ Warning: Could not extract enode URL after $max_attempts attempts."
    echo "You may need to:"
    echo "1. Check Docker logs: docker logs temp-node1"
    echo "2. Manually update docker-compose.yml with the correct enode URL"
    echo "3. Ensure all ports are available (8545, 30303)"
    exit 1
fi 