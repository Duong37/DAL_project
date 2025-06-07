const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying Complete DAL System...");
    
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {},
        gasUsed: {}
    };
    
    // Deploy UserProfileFactory
    console.log("\n📋 Deploying UserProfileFactory...");
    const UserProfileFactory = await hre.ethers.getContractFactory("UserProfileFactory");
    const userProfileFactory = await UserProfileFactory.deploy();
    await userProfileFactory.deployed();
    
    console.log("✅ UserProfileFactory deployed to:", userProfileFactory.address);
    console.log("Transaction hash:", userProfileFactory.deployTransaction.hash);
    
    deploymentInfo.contracts.UserProfileFactory = {
        address: userProfileFactory.address,
        transactionHash: userProfileFactory.deployTransaction.hash,
        blockNumber: userProfileFactory.deployTransaction.blockNumber
    };
    
    // Deploy ReputationSystem
    console.log("\n⭐ Deploying ReputationSystem...");
    const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy(userProfileFactory.address);
    await reputationSystem.deployed();
    
    console.log("✅ ReputationSystem deployed to:", reputationSystem.address);
    console.log("Transaction hash:", reputationSystem.deployTransaction.hash);
    
    deploymentInfo.contracts.ReputationSystem = {
        address: reputationSystem.address,
        transactionHash: reputationSystem.deployTransaction.hash,
        blockNumber: reputationSystem.deployTransaction.blockNumber
    };
    
    // Deploy DALStorage (if not already deployed)
    console.log("\n💾 Checking DALStorage deployment...");
    let dalStorageAddress;
    try {
        const existingDeployment = fs.readFileSync(
            path.join(__dirname, "../deployments/dal_storage_besu.json"), 
            'utf8'
        );
        const existing = JSON.parse(existingDeployment);
        dalStorageAddress = existing.contracts.DALStorage.address;
        console.log("📌 Using existing DALStorage at:", dalStorageAddress);
        
        deploymentInfo.contracts.DALStorage = {
            address: dalStorageAddress,
            note: "Using existing deployment"
        };
    } catch (error) {
        console.log("🔧 Deploying new DALStorage...");
        const DALStorage = await hre.ethers.getContractFactory("DALStorage");
        const dalStorage = await DALStorage.deploy();
        await dalStorage.deployed();
        
        dalStorageAddress = dalStorage.address;
        console.log("✅ DALStorage deployed to:", dalStorageAddress);
        
        deploymentInfo.contracts.DALStorage = {
            address: dalStorageAddress,
            transactionHash: dalStorage.deployTransaction.hash,
            blockNumber: dalStorage.deployTransaction.blockNumber
        };
    }
    
    // Wait for confirmations
    console.log("\n⏳ Waiting for confirmations...");
    await userProfileFactory.deployTransaction.wait(2);
    await reputationSystem.deployTransaction.wait(2);
    
    // Get gas usage
    deploymentInfo.gasUsed.UserProfileFactory = (await hre.ethers.provider.getTransactionReceipt(
        userProfileFactory.deployTransaction.hash
    )).gasUsed.toString();
    
    deploymentInfo.gasUsed.ReputationSystem = (await hre.ethers.provider.getTransactionReceipt(
        reputationSystem.deployTransaction.hash
    )).gasUsed.toString();
    
    // Test the system
    console.log("\n🧪 Testing system integration...");
    
    // Test user registration
    const testUsername = "dal_user_" + Date.now();
    console.log("Registering test user:", testUsername);
    
    const registerTx = await userProfileFactory.registerUser(
        testUsername,
        "DAL Test Organization",
        "TestLand"
    );
    await registerTx.wait();
    
    console.log("✅ User registered successfully!");
    
    // Get user profile data
    const profileData = await userProfileFactory.getUserProfileData(deployer.address);
    console.log("User profile data:");
    console.log("- Profile contract:", profileData[0]);
    console.log("- Username:", profileData[2]);
    console.log("- Organization:", profileData[3]);
    console.log("- Country:", profileData[4]);
    
    // Initialize user reputation
    console.log("\nInitializing user reputation...");
    const initRepTx = await reputationSystem.initializeUserReputation(deployer.address);
    await initRepTx.wait();
    
    console.log("✅ Reputation initialized successfully!");
    
    // Get reputation data
    const reputationData = await reputationSystem.getUserReputation(deployer.address);
    console.log("User reputation data:");
    console.log("- Score:", reputationData[0].toString());
    console.log("- Total tasks:", reputationData[1].toString());
    console.log("- Successful tasks:", reputationData[2].toString());
    console.log("- Level:", reputationData[5]);
    
    // Test reputation update
    console.log("\nTesting reputation update...");
    await reputationSystem.addAuthorizedUpdater(deployer.address);
    const updateTx = await reputationSystem.updateReputation(
        deployer.address,
        25,
        "Test successful task completion"
    );
    await updateTx.wait();
    
    const updatedReputation = await reputationSystem.getUserReputation(deployer.address);
    console.log("Updated reputation score:", updatedReputation[0].toString());
    
    // Save complete deployment information
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `complete_system_${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    // Create a summary file with all contract addresses
    const summary = {
        network: hre.network.name,
        chainId: deploymentInfo.chainId,
        deployedAt: deploymentInfo.deployedAt,
        contracts: {
            UserProfileFactory: deploymentInfo.contracts.UserProfileFactory.address,
            ReputationSystem: deploymentInfo.contracts.ReputationSystem.address,
            DALStorage: deploymentInfo.contracts.DALStorage.address
        },
        integration: {
            userProfileFactory: deploymentInfo.contracts.UserProfileFactory.address,
            reputationSystem: deploymentInfo.contracts.ReputationSystem.address,
            dalStorage: deploymentInfo.contracts.DALStorage.address
        },
        testResults: {
            userRegistration: "✅ SUCCESS",
            reputationInitialization: "✅ SUCCESS",
            reputationUpdate: "✅ SUCCESS"
        }
    };
    
    const summaryFile = path.join(deploymentsDir, `dal_system_summary_${hre.network.name}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log("\n📄 Deployment info saved to:", deploymentFile);
    console.log("📄 Summary saved to:", summaryFile);
    
    console.log("\n🎉 Complete DAL System deployment completed!");
    console.log("📋 Contract Summary:");
    console.log("┌─────────────────────────┬──────────────────────────────────────────────┐");
    console.log("│ Contract                │ Address                                      │");
    console.log("├─────────────────────────┼──────────────────────────────────────────────┤");
    console.log(`│ UserProfileFactory      │ ${deploymentInfo.contracts.UserProfileFactory.address} │`);
    console.log(`│ ReputationSystem        │ ${deploymentInfo.contracts.ReputationSystem.address} │`);
    console.log(`│ DALStorage              │ ${deploymentInfo.contracts.DALStorage.address} │`);
    console.log("└─────────────────────────┴──────────────────────────────────────────────┘");
    
    console.log("\n🔗 Integration Notes:");
    console.log("- ReputationSystem is linked to UserProfileFactory");
    console.log("- All contracts deployed on network:", hre.network.name);
    console.log("- Chain ID:", deploymentInfo.chainId);
    console.log("- Total gas used:", Object.values(deploymentInfo.gasUsed).reduce((a, b) => parseInt(a) + parseInt(b), 0));
    
    console.log("\n🚀 Next Steps:");
    console.log("1. Update your backend service with new contract addresses");
    console.log("2. Test user registration from frontend with MetaMask");
    console.log("3. Implement AL task workflows with reputation updates");
    console.log("4. Set up authorized updaters for reputation system");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 