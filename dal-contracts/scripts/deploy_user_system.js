const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying User Registration System...");
    
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    // Deploy UserProfileFactory
    console.log("\nDeploying UserProfileFactory...");
    const UserProfileFactory = await hre.ethers.getContractFactory("UserProfileFactory");
    const userProfileFactory = await UserProfileFactory.deploy();
    await userProfileFactory.deployed();
    
    console.log("UserProfileFactory deployed to:", userProfileFactory.address);
    console.log("Transaction hash:", userProfileFactory.deployTransaction.hash);
    
    // Wait for a few confirmations
    console.log("Waiting for confirmations...");
    await userProfileFactory.deployTransaction.wait(2);
    
    // Get factory stats
    const stats = await userProfileFactory.getFactoryStats();
    console.log("Factory initialized:");
    console.log("- Total users:", stats[0].toString());
    console.log("- Factory owner:", stats[1]);
    console.log("- Is paused:", stats[2]);
    
    // Save deployment information
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            UserProfileFactory: {
                address: userProfileFactory.address,
                transactionHash: userProfileFactory.deployTransaction.hash,
                blockNumber: userProfileFactory.deployTransaction.blockNumber
            }
        },
        gasUsed: {
            UserProfileFactory: (await hre.ethers.provider.getTransactionReceipt(
                userProfileFactory.deployTransaction.hash
            )).gasUsed.toString()
        }
    };
    
    // Write deployment info to file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `user_system_${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\nDeployment info saved to:", deploymentFile);
    
    // Test the factory by registering a test user
    console.log("\nTesting user registration...");
    try {
        const testTx = await userProfileFactory.registerUser(
            "test_user_" + Date.now(),
            "Test Organization",
            "Test Country"
        );
        await testTx.wait();
        
        console.log("Test user registered successfully!");
        console.log("Transaction hash:", testTx.hash);
        
        // Get updated stats
        const updatedStats = await userProfileFactory.getFactoryStats();
        console.log("Updated total users:", updatedStats[0].toString());
        
        // Check if user is registered
        const isRegistered = await userProfileFactory.isUserRegistered(deployer.address);
        console.log("Deployer is registered:", isRegistered);
        
        if (isRegistered) {
            const userProfileAddress = await userProfileFactory.getUserProfile(deployer.address);
            console.log("User profile contract address:", userProfileAddress);
            
            // Get user profile data
            const profileData = await userProfileFactory.getUserProfileData(deployer.address);
            console.log("Profile data:");
            console.log("- Profile contract:", profileData[0]);
            console.log("- Public address:", profileData[1]);
            console.log("- Username:", profileData[2]);
            console.log("- Organization:", profileData[3]);
            console.log("- Country:", profileData[4]);
            console.log("- Created at:", new Date(profileData[5].toNumber() * 1000).toISOString());
            console.log("- Last updated:", new Date(profileData[6].toNumber() * 1000).toISOString());
        }
        
    } catch (error) {
        console.log("Test registration failed:", error.message);
    }
    
    console.log("\n🎉 User Registration System deployment completed!");
    console.log("📋 Summary:");
    console.log("- UserProfileFactory:", userProfileFactory.address);
    console.log("- Network:", hre.network.name);
    console.log("- Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 