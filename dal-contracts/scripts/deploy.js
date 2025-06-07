const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying DALStorage contract to Besu IBFT network...");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Deploying contracts with account:", deployer.address);
    
    // Get account balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    // Get the contract factory
    const DALStorage = await ethers.getContractFactory("DALStorage");
    
    // Deploy the contract
    console.log("📦 Deploying DALStorage contract...");
    const dalStorage = await DALStorage.deploy();
    
    // Wait for deployment to be mined
    await dalStorage.deployed();
    
    console.log("✅ DALStorage contract deployed!");
    console.log("📍 Contract address:", dalStorage.address);
    console.log("🔗 Transaction hash:", dalStorage.deployTransaction.hash);
    
    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    const owner = await dalStorage.owner();
    const stats = await dalStorage.getStats();
    
    console.log("👤 Contract owner:", owner);
    console.log("📊 Initial stats:");
    console.log("   - Data entries:", stats.dataEntries.toString());
    console.log("   - Voting results:", stats.votingResults_.toString());
    console.log("   - Model updates:", stats.modelUpdates_.toString());
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: dalStorage.address,
        deployerAddress: deployer.address,
        transactionHash: dalStorage.deployTransaction.hash,
        blockNumber: dalStorage.deployTransaction.blockNumber,
        chainId: (await deployer.getChainId()).toString(),
        timestamp: new Date().toISOString()
    };
    
    // Write deployment info to file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentPath = path.join(__dirname, '..', 'deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("💾 Deployment info saved to deployment.json");
    console.log("\n🎉 Deployment completed successfully!");
    
    // Instructions for next steps
    console.log("\n📋 Next steps:");
    console.log("1. Update blockchain service with contract address:");
    console.log(`   CONTRACT_ADDRESS="${dalStorage.address}"`);
    console.log("2. Start the DAL blockchain service");
    console.log("3. Test the smart contract integration");
    
    return dalStorage.address;
}

// Handle errors
main()
    .then((address) => {
        console.log(`\n✅ Contract deployed at: ${address}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 