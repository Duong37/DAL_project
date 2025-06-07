# Besu IBFT Network with Docker

This project sets up a private Hyperledger Besu network using IBFT 2.0 (Istanbul Byzantine Fault Tolerant) consensus with 4 validator nodes using Docker. The configuration includes the latest Ethereum protocol features for comprehensive testing and development.

## ✨ Features

- **🐳 Fully Dockerized**: All nodes run in containers for easy deployment
- **🔄 Automated Setup**: Single script handles key generation and configuration  
- **🔒 IBFT 2.0 Consensus**: Byzantine fault tolerant with immediate finality
- **⚡ Latest Ethereum Features**: All EIPs enabled (Berlin, London, Shanghai, etc.)
- **🧪 Comprehensive Testing**: Advanced validation scripts
- **📊 Enhanced Monitoring**: Detailed network health checks
- **💰 Pre-funded Accounts**: Ready-to-use test accounts

## Prerequisites

- Docker
- Docker Compose
- curl (for testing)
- bc (optional, for better balance calculations)

## Directory Structure

```
IBFT-Network/
├── README.md
├── docker-compose.yml           # Orchestrates 4 Besu nodes
├── ibftConfigFile.json         # Network configuration with latest EIPs
├── setup.sh                    # Automated setup with error handling
├── test-network.sh             # Comprehensive network validation
├── Node-1/
│   └── data/                   # Node-1 data and keys
├── Node-2/
│   └── data/                   # Node-2 data and keys
├── Node-3/
│   └── data/                   # Node-3 data and keys
└── Node-4/
    └── data/                   # Node-4 data and keys
```

## 🚀 Quick Start

### 1. Make scripts executable

```bash
chmod +x setup.sh test-network.sh
```

### 2. Run the setup script

```bash
./setup.sh
```

This enhanced setup script will:
- ✅ Verify Docker is running
- ✅ Generate blockchain configuration with latest Ethereum features
- ✅ Copy genesis file and node keys to appropriate directories
- ✅ Extract enode URL with retry logic
- ✅ Update Docker Compose configuration automatically
- ✅ Provide detailed status and next steps

### 3. Start the network

```bash
docker-compose up -d
```

This will start all 4 validator nodes in the background with:
- Isolated Docker network
- Proper port mapping
- Persistent data volumes

### 4. Test the network

```bash
./test-network.sh
```

The enhanced test script validates:
- ✅ Port connectivity
- ✅ JSON-RPC API responses
- ✅ IBFT validator configuration
- ✅ Block production and finality
- ✅ Network connectivity between all nodes
- ✅ Chain configuration (Chain ID, protocol version)
- ✅ Pre-funded account balances

## Network Endpoints

Once running, you can interact with the network through these JSON-RPC endpoints:

- **Node-1** (bootnode): http://localhost:8545
- **Node-2**: http://localhost:8546
- **Node-3**: http://localhost:8547
- **Node-4**: http://localhost:8548

## 🔧 Network Configuration

### Core Settings
- **Chain ID**: 1337
- **Consensus**: IBFT 2.0 (Istanbul Byzantine Fault Tolerant)
- **Block time**: 2 seconds
- **Epoch length**: 30000 blocks
- **Request timeout**: 4 seconds
- **Contract size limit**: 2147483647 bytes (maximum)
- **EVM stack size**: 1024

### Enabled Ethereum Features
All major Ethereum Improvement Proposals (EIPs) are enabled from block 0:
- **Homestead** - Basic Ethereum protocol
- **EIP-150** - Gas cost changes
- **EIP-155** - Replay attack protection
- **EIP-158** - State clearing
- **Byzantium** - Various protocol upgrades
- **Constantinople** - Additional protocol upgrades
- **Berlin** - Gas cost adjustments
- **London** - EIP-1559 base fee mechanism
- **Shanghai** - Latest protocol features

## Usage Examples

### Check validators

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"ibft_getValidatorsByBlockNumber","params":["latest"],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8545
```

### Check current block number

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8545
```

### Check peer connections

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8545
```

### Get account balance

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xfe3b557e8fb62b89f4916b721be55ceb828dbd73","latest"],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8545
```

## 💰 Pre-funded Accounts

The genesis file includes three pre-funded accounts for testing:

1. **Account 1**: `0xfe3b557e8fb62b89f4916b721be55ceb828dbd73`
   - Balance: 50,000,000,000,000,000,000 Wei (50 ETH)
   - Private Key: `8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63`

2. **Account 2**: `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`
   - Balance: 90,000,000,000,000,000,000,000 Wei (90,000 ETH)
   - Private Key: `c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3`

3. **Account 3**: `0xf17f52151EbEF6C7334FAD080c5704D77216b732`
   - Balance: 90,000,000,000,000,000,000,000 Wei (90,000 ETH)
   - Private Key: `ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f`

⚠️ **Warning**: These accounts have exposed private keys and should only be used for testing.

## 🛠 Management Commands

### Start the network
```bash
docker-compose up -d
```

### Stop the network
```bash
docker-compose down
```

### View logs
```bash
# View logs for all nodes
docker-compose logs

# View logs for specific node
docker-compose logs node1

# Follow logs in real-time
docker-compose logs -f
```

### Restart the network
```bash
docker-compose restart
```

### Check container status
```bash
docker-compose ps
```

## 🔍 Troubleshooting

### Network not starting properly
1. Check that all required ports are available (8545-8548, 30303-30306)
2. Verify Docker and Docker Compose are installed and running: `docker --version && docker-compose --version`
3. Check logs: `docker-compose logs`
4. Ensure you have sufficient system resources

### Nodes not connecting
1. Verify the enode URL was properly extracted during setup
2. Check the `docker-compose.yml` file for correct bootnode configuration
3. Ensure the network subnet doesn't conflict with existing networks
4. Check firewall settings

### Setup script fails
1. Ensure Docker is running: `docker info`
2. Check if ports 8545 and 30303 are available
3. Verify you have write permissions in the directory
4. Run setup script with verbose output: `bash -x ./setup.sh`

### Re-setup the network
If you need to start fresh:
```bash
# Stop and remove containers
docker-compose down

# Clean up generated files
rm -rf networkFiles/ genesis.json Node-*/data/key* docker-compose.yml.bak

# Re-run setup
./setup.sh
docker-compose up -d
```

### Performance issues
1. Allocate more resources to Docker
2. Check system CPU and memory usage
3. Consider reducing block time or epoch length for development

## 🔒 Security Notes

- This setup is for **development and testing only**
- The network is not secured and should be run behind a firewall
- Private keys are stored in plain text for testing purposes
- Do not use the pre-funded accounts on mainnet or public networks
- Consider using hardware security modules (HSM) for production deployments

## 🏗 IBFT 2.0 Features

- **Byzantine Fault Tolerance**: Can tolerate up to 1 faulty node (with 4 validators)
- **Immediate Finality**: Blocks are immediately final once committed
- **Validator Management**: Validators can be added/removed through voting
- **Enterprise Ready**: Suitable for consortium networks
- **High Performance**: Optimized for private network scenarios

## 🚀 Advanced Usage

### Adding/Removing Validators

Use the IBFT API to propose validator changes:

```bash
# Propose adding a validator
curl -X POST --data '{"jsonrpc":"2.0","method":"ibft_proposeValidatorVote","params":["0xNewValidatorAddress", true],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8545

# Check pending proposals
curl -X POST --data '{"jsonrpc":"2.0","method":"ibft_getPendingVotes","params":[],"id":1}' \
     -H "Content-Type: application/json" \
     localhost:8545
```

### Smart Contract Deployment

The network supports all Ethereum smart contract features. Use tools like:
- **Remix IDE**: Connect to http://localhost:8545
- **Truffle**: Configure network in `truffle-config.js`
- **Hardhat**: Add network to `hardhat.config.js`
- **web3.js/ethers.js**: Connect directly to the RPC endpoints

### MetaMask Integration

1. Add custom network in MetaMask:
   - Network Name: Besu IBFT Local
   - RPC URL: http://localhost:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import test accounts using the provided private keys

## 📖 Additional Resources

- [Hyperledger Besu Documentation](https://besu.hyperledger.org/)
- [IBFT 2.0 Consensus](https://besu.hyperledger.org/en/stable/HowTo/Configure/Consensus/IBFT/)
- [JSON-RPC API Reference](https://besu.hyperledger.org/en/stable/Reference/API-Methods/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

💡 **Tip**: This network is production-ready for private consortium use cases with proper security hardening! 