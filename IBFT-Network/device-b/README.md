# Device B - Additional Besu Node

This setup creates an additional Besu node that connects to the main IBFT network as a non-validator participant. This node will sync with the 4-validator IBFT network and can be used for additional capacity, testing, or as a read-only node.

## 📁 Directory Structure

```
device-b/
├── README.md                 # This file
├── docker-compose.yml        # Docker configuration for Device B node
├── start-device-b.sh         # Start script
├── check-sync.sh            # Synchronization checker
├── genesis.json             # Network genesis file (copied from main)
├── node-data/               # Node data directory (created automatically)
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Main IBFT network running (4 validators)
- Available ports: 8550 (JSON-RPC), 30310 (P2P)

### 1. Make scripts executable
```bash
chmod +x start-device-b.sh check-sync.sh
```

### 2. Start Device B node
```bash
./start-device-b.sh
```

### 3. Check synchronization
```bash
./check-sync.sh
```

## 🔧 Configuration Details

### Network Settings
- **Chain ID**: 1337 (same as main network)
- **Genesis**: Identical to main IBFT network
- **Role**: Non-validator node (sync only)
- **Sync Mode**: FULL synchronization

### Port Mapping
- **JSON-RPC**: http://localhost:8550 (mapped from container port 8545)
- **P2P**: localhost:30310 (mapped from container port 30303)

### Connection
- **Bootnode**: Connects to Node-1 from main network
- **Enode**: `enode://b3966c680028e5804d8faa6684bd308c179118be97e9a6970e30b55cc67d0720d6c1b68bbc2cbac80d75b05f63ebd14c22398feb824be672ec03911d876b3d4d@host.docker.internal:30303`

## 📊 Node Features

### ✅ Capabilities
- **Read Operations**: All Ethereum JSON-RPC read methods
- **Transaction Submission**: Can submit transactions to the network
- **Block Synchronization**: Receives all blocks from validators
- **Event Monitoring**: Can monitor events and logs
- **Smart Contract Interaction**: Full smart contract read/write capability

### ❌ Limitations
- **Not a Validator**: Cannot participate in consensus
- **No Block Production**: Cannot create new blocks
- **No Voting**: Cannot vote on validator changes

## 🛠 Management Commands

### Start the node
```bash
./start-device-b.sh
```

### Check status
```bash
./check-sync.sh
```

### View logs
```bash
docker-compose logs -f
```

### Stop the node
```bash
docker-compose down
```

### Restart the node
```bash
docker-compose down && ./start-device-b.sh
```

## 🔍 Monitoring & Testing

### Check current block number
```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8550
```

### Check peer connections
```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8550
```

### Check synchronization status
```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8550
```

### Get account balance
```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xfe3b557e8fb62b89f4916b721be55ceb828dbd73","latest"],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8550
```

## 🔗 Integration Examples

### MetaMask Configuration
1. **Network Name**: Besu IBFT Local (Device B)
2. **RPC URL**: http://localhost:8550
3. **Chain ID**: 1337
4. **Currency Symbol**: ETH

### Web3.js Connection
```javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8550');

// Test connection
web3.eth.getBlockNumber()
    .then(blockNumber => console.log('Current block:', blockNumber));
```

### Ethers.js Connection
```javascript
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8550');

// Test connection
provider.getBlockNumber()
    .then(blockNumber => console.log('Current block:', blockNumber));
```

## 🔧 Troubleshooting

### Node not starting
1. **Check Docker**: `docker --version && docker-compose --version`
2. **Check ports**: Ensure 8550 and 30310 are available
3. **Check genesis**: Verify `genesis.json` exists and is valid
4. **Check logs**: `docker-compose logs`

### Not connecting to peers
1. **Main network**: Ensure the main IBFT network is running
2. **Firewall**: Check if ports are blocked
3. **Wait time**: Initial peer discovery can take 2-3 minutes
4. **Bootnode**: Verify bootnode enode URL is correct

### Synchronization issues
1. **Check main network**: Ensure validators are producing blocks
2. **Wait time**: Full sync can take time depending on chain length
3. **Restart**: Try `docker-compose down && ./start-device-b.sh`

### Performance optimization
1. **Resources**: Allocate more CPU/memory to Docker
2. **Storage**: Ensure sufficient disk space for blockchain data
3. **Network**: Check network connectivity between containers

## 📈 Use Cases

### Development & Testing
- **Smart Contract Testing**: Deploy and test contracts
- **Transaction Simulation**: Test transaction flows
- **Event Monitoring**: Monitor blockchain events
- **Load Testing**: Additional endpoint for load distribution

### Production Support
- **Read Replica**: Offload read operations from validators
- **Backup Node**: Additional network participant for resilience
- **API Gateway**: Dedicated endpoint for external applications
- **Monitoring**: Dedicated node for blockchain monitoring tools

## 🔒 Security Notes

- **Development Only**: This setup is for development/testing
- **No Private Keys**: Device B doesn't store validator keys
- **Network Access**: Ensure proper firewall configuration
- **Resource Limits**: Monitor resource usage in production

## 📖 Additional Resources

- [Hyperledger Besu Documentation](https://besu.hyperledger.org/)
- [JSON-RPC API Reference](https://besu.hyperledger.org/en/stable/Reference/API-Methods/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

💡 **Tip**: Device B provides additional network capacity while maintaining full blockchain functionality! 