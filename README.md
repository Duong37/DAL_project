# DAL
Decentralized Active Learning

This project benchmarks a simple Ink! smart contract inspired by the "GroupContract" in the D-VRE paper. It measures latency and resource usage (e.g., gas) of contract operations on a local Substrate contracts node.

What It Includes
- An Ink! smart contract for file sharing within groups
- Deployment and transaction automation script using Polkadot.js
- Basic latency measurement (transaction roundtrip time)
- Setup to expand into throughput testing with repeated calls

🏗 Project Structure
substrate-benchmarking/
├── contracts/
│ └── group_contract/ # The Ink! contract
├── scripts/
│ └── benchmark.js # Script to test and measure performance

Setup Instructions

1. Install Prerequisites

Rust (with nightly and wasm target):
rustup update nightly  
rustup target add wasm32-unknown-unknown --toolchain nightly  

Install cargo-contract:
cargo install cargo-contract --force  

Node.js dependencies:
cd scripts  
npm install @polkadot/api @polkadot/api-contract 

2. Run Substrate Contracts Node

Start a local chain:
substrate-contracts-node --dev  

3. Compile the Contract

cd contracts/group_contract  
cargo +nightly contract build  
This will produce a .contract bundle (WASM + metadata).

4. Run the Benchmark Script

cd scripts  
node benchmark.js  
It will:
- Deploy the contract
- Send a transaction (addFile)
- Log the transaction latency

Future Benchmark Ideas
- Measure throughput over time (txs/sec)
- Deploy to Substrate testnet (e.g., Rococo)
- Compare with Ethereum gas and tx latency

Paper Reference:
Wang et al., D-VRE: From a Jupyter-enabled private research environment to decentralized collaborative research ecosystem, Blockchain: Research and Applications, 2025.

