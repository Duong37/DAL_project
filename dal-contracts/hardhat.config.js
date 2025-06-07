require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");

// Besu network configuration
const BESU_NETWORK_CONFIG = {
  chainId: 1337,
  nodes: [
    "http://localhost:8545",  // Node-1
    "http://localhost:8546",  // Node-2
    "http://localhost:8547",  // Node-3
    "http://localhost:8548"   // Node-4
  ],
  // Pre-funded account from genesis (for deployment)
  accounts: [
    "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63", // Account 1
    "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3", // Account 2
    "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f"  // Account 3
  ]
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  networks: {
    // Local Besu IBFT network
    besu: {
      url: BESU_NETWORK_CONFIG.nodes[0], // Primary node
      chainId: BESU_NETWORK_CONFIG.chainId,
      accounts: BESU_NETWORK_CONFIG.accounts,
      gas: 4700000,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000
    },
    
    // Alternative nodes for failover
    "besu-node2": {
      url: BESU_NETWORK_CONFIG.nodes[1],
      chainId: BESU_NETWORK_CONFIG.chainId,
      accounts: BESU_NETWORK_CONFIG.accounts,
      gas: 4700000,
      gasPrice: 1000000000
    },
    
    "besu-node3": {
      url: BESU_NETWORK_CONFIG.nodes[2],
      chainId: BESU_NETWORK_CONFIG.chainId,
      accounts: BESU_NETWORK_CONFIG.accounts,
      gas: 4700000,
      gasPrice: 1000000000
    },
    
    "besu-node4": {
      url: BESU_NETWORK_CONFIG.nodes[3],
      chainId: BESU_NETWORK_CONFIG.chainId,
      accounts: BESU_NETWORK_CONFIG.accounts,
      gas: 4700000,
      gasPrice: 1000000000
    },
    
    // Development network (for testing)
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  
  mocha: {
    timeout: 40000
  }
}; 