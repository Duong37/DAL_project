# DAL Smart Contracts

Ethereum smart contracts for the Decentralized Active Learning (DAL) framework.

## Features

- Vote recording and aggregation
- Event emission for vote completion
- Metadata storage for samples and votes
- Role-based access control

## Project Structure

```
dal-contracts/
├── contracts/     # Smart contract source files
├── scripts/       # Deployment and testing scripts
├── test/          # Contract test files
└── hardhat.config.js  # Hardhat configuration
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Run tests:
```bash
npx hardhat test
```

4. Deploy to network:
```bash
npx hardhat deploy --network <network-name>
```

## Smart Contracts

### VotingContract
- Handles vote submission and aggregation
- Emits events for vote completion
- Stores metadata about samples and votes

### AccessControl
- Manages roles and permissions
- Controls who can submit votes
- Handles admin functions

## Development

```bash
# Run local node
npx hardhat node

# Deploy to local network
npx hardhat deploy --network localhost

# Run tests with coverage
npx hardhat coverage
```

## Contributing

See the main project's CONTRIBUTING.md file. 