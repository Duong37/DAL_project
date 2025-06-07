# DAL JupyterLab Extension

A JupyterLab extension for the Decentralized Active Learning (DAL) framework.

## Features

- Wallet authentication (MetaMask integration)
- Sample viewing and voting interface
- Vote status tracking
- Model update visualization
- Blockchain interaction via ethers.js

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Install the extension in JupyterLab:
```bash
jupyter labextension install .
```

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── services/      # API and blockchain services
├── types/         # TypeScript type definitions
└── index.ts       # Extension entry point
```

## Development

```bash
# Watch mode
npm run watch

# Build for production
npm run build

# Run tests
npm test
```

## Contributing

See the main project's CONTRIBUTING.md file. 