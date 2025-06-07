# DAL (Decentralized Active Learning) System Guide

## Overview

The DAL system is a comprehensive decentralized platform for collaborative active learning with user authentication, reputation management, and blockchain-based data storage. This guide covers the complete smart contract system and integration instructions.

## Deployed Contracts

### Network: Besu IBFT (Chain ID: 1337)

| Contract | Address | Purpose |
|----------|---------|---------|
| **UserProfileFactory** | `0x9ab7CA8a88F8e351f9b0eEEA5777929210199295` | User registration and profile management |
| **ReputationSystem** | `0x43D1F9096674B5722D359B6402381816d5B22F28` | User reputation and performance tracking |
| **DALStorage** | `0x4245CF4518CB2C280f5e9c6a03c90C147F80B4d9` | Active learning data and experiment storage |

## System Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   UserProfile       │    │   ReputationSystem   │    │     DALStorage      │
│   Factory           │◄───┤                      │    │                     │
│                     │    │                      │    │                     │
│ • User Registration │    │ • Reputation Scores  │    │ • Experiment Data   │
│ • Profile Contracts │    │ • Performance Track  │    │ • Voting Results    │
│ • Username Registry │    │ • Level System       │    │ • Model Updates     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## Contract Features

### 1. UserProfileFactory

**Purpose**: Manages user registration and deploys individual UserProfile contracts

**Key Features**:
- ✅ MetaMask wallet-based registration
- ✅ Unique username enforcement
- ✅ Individual profile contracts per user
- ✅ Metadata storage (username, organization, country)
- ✅ User enumeration and search
- ✅ Emergency pause functionality

**Main Functions**:
```solidity
// Register a new user
function registerUser(string username, string organization, string country) external

// Check if user is registered
function isUserRegistered(address userAddress) external view returns (bool)

// Get user's profile contract
function getUserProfile(address userAddress) external view returns (address)

// Get complete profile data
function getUserProfileData(address userAddress) external view returns (...)
```

### 2. ReputationSystem

**Purpose**: Tracks user performance and assigns reputation scores

**Key Features**:
- ✅ Score-based reputation system
- ✅ Performance tracking (successful/total tasks)
- ✅ Reputation levels (Beginner → Novice → Intermediate → Expert → Master)
- ✅ Historical tracking of all reputation changes
- ✅ Batch updates for multiple users
- ✅ Authorized updater system

**Reputation Levels**:
- **Beginner**: 0-99 points
- **Novice**: 100-499 points  
- **Intermediate**: 500-999 points
- **Expert**: 1000-1999 points
- **Master**: 2000+ points

**Main Functions**:
```solidity
// Initialize user reputation (100 points)
function initializeUserReputation(address user) external

// Update reputation (+/- points with reason)
function updateReputation(address user, int256 change, string reason) public

// Get user reputation info
function getUserReputation(address user) external view returns (...)

// Get reputation history
function getReputationHistory(address user, uint256 start, uint256 limit) external view
```

### 3. UserProfile (Individual Contracts)

**Purpose**: Individual smart contracts deployed for each registered user

**Key Features**:
- ✅ User-owned and controlled
- ✅ Updatable metadata
- ✅ Access control (only owner can update)
- ✅ JSON export functionality
- ✅ Audit trail with timestamps

**Main Functions**:
```solidity
// Update profile fields
function updateUsername(string newUsername) external
function updateOrganization(string newOrganization) external  
function updateCountry(string newCountry) external

// Get profile data
function getProfile() external view returns (...)
function getProfileJSON() external view returns (string)
```

## Integration Guide

### Frontend Integration (MetaMask)

#### 1. User Registration

```javascript
// Connect to UserProfileFactory contract
const factoryContract = new ethers.Contract(
    "0x9ab7CA8a88F8e351f9b0eEEA5777929210199295",
    factoryABI,
    signer
);

// Check if user is already registered
const isRegistered = await factoryContract.isUserRegistered(userAddress);

if (!isRegistered) {
    // Register new user
    const tx = await factoryContract.registerUser(
        "john_doe",
        "MIT",
        "USA"
    );
    await tx.wait();
    console.log("User registered successfully!");
}
```

#### 2. Reputation Management

```javascript
// Connect to ReputationSystem contract
const reputationContract = new ethers.Contract(
    "0x43D1F9096674B5722D359B6402381816d5B22F28",
    reputationABI,
    signer
);

// Initialize reputation for new user
await reputationContract.initializeUserReputation(userAddress);

// Get user reputation
const reputation = await reputationContract.getUserReputation(userAddress);
console.log(`Score: ${reputation.score}, Level: ${reputation.level}`);
```

### Backend Integration

#### 1. Update dal-backend BlockchainService

Add the new contracts to your `BlockchainService`:

```python
class BlockchainService:
    def __init__(self):
        # ... existing code ...
        
        # Load new contract ABIs and addresses
        self.user_factory_contract = self.load_contract(
            "UserProfileFactory",
            "0x9ab7CA8a88F8e351f9b0eEEA5777929210199295"
        )
        
        self.reputation_contract = self.load_contract(
            "ReputationSystem", 
            "0x43D1F9096674B5722D359B6402381816d5B22F28"
        )
    
    def register_user(self, user_address: str, username: str, 
                      organization: str, country: str) -> str:
        """Register a new user"""
        try:
            tx = self.user_factory_contract.functions.registerUser(
                username, organization, country
            ).build_transaction({
                'from': user_address,
                'gas': 2000000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(user_address),
            })
            return tx
        except Exception as e:
            raise Exception(f"User registration failed: {str(e)}")
    
    def get_user_reputation(self, user_address: str) -> dict:
        """Get user reputation data"""
        try:
            result = self.reputation_contract.functions.getUserReputation(
                user_address
            ).call()
            
            return {
                'score': result[0],
                'total_tasks': result[1], 
                'successful_tasks': result[2],
                'last_activity': result[3],
                'is_active': result[4],
                'level': result[5]
            }
        except Exception as e:
            raise Exception(f"Failed to get reputation: {str(e)}")
```

#### 2. Add API Endpoints

```python
# In your FastAPI app
@app.post("/users/register")
async def register_user(
    username: str,
    organization: str, 
    country: str,
    user_address: str
):
    try:
        tx = blockchain_service.register_user(
            user_address, username, organization, country
        )
        return {"transaction": tx, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/users/{address}/reputation")
async def get_user_reputation(address: str):
    try:
        reputation = blockchain_service.get_user_reputation(address)
        return {"reputation": reputation, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
```

## Security Best Practices

### Smart Contract Security

1. **Access Control**: 
   - Only profile owners can update their data
   - Only authorized addresses can update reputation
   - Factory owner can pause in emergencies

2. **Input Validation**:
   - String length limits (100 chars max)
   - Non-empty string requirements
   - Address validation

3. **Reputation Protection**:
   - Prevents reputation underflow
   - Tracks all changes with audit trail
   - Requires reasons for all updates

### Frontend Security

1. **MetaMask Integration**:
   - Always verify network (Chain ID 1337)
   - Validate contract addresses
   - Handle transaction failures gracefully

2. **User Verification**:
   - Check registration status before operations
   - Verify transaction confirmations
   - Implement proper error handling

## Usage Examples

### Complete User Onboarding Flow

```javascript
// 1. Connect MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();

// 2. Check network
const network = await provider.getNetwork();
if (network.chainId !== 1337) {
    throw new Error("Please connect to Besu network (Chain ID: 1337)");
}

// 3. Check if user exists
const userAddress = await signer.getAddress();
const isRegistered = await factoryContract.isUserRegistered(userAddress);

if (!isRegistered) {
    // 4. Register user
    const registerTx = await factoryContract.registerUser(
        "alice_researcher",
        "Stanford University", 
        "USA"
    );
    await registerTx.wait();
    
    // 5. Initialize reputation
    const reputationTx = await reputationContract.initializeUserReputation(userAddress);
    await reputationTx.wait();
    
    console.log("User onboarded successfully!");
}

// 6. Get user data
const profileData = await factoryContract.getUserProfileData(userAddress);
const reputationData = await reputationContract.getUserReputation(userAddress);

console.log("Profile:", profileData);
console.log("Reputation:", reputationData);
```

### Reputation Update Flow

```javascript
// When user completes a task successfully
await reputationContract.updateReputation(
    userAddress,
    15, // +15 points
    "Task completed successfully with high accuracy"
);

// When user provides poor quality labels
await reputationContract.updateReputation(
    userAddress, 
    -5, // -5 points
    "Task completed with low accuracy"
);
```

## Testing

### Run Tests

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy_complete_system.js --network localhost
```

### Integration Testing

The deployment script automatically tests:
- ✅ User registration
- ✅ Reputation initialization  
- ✅ Reputation updates
- ✅ Data retrieval

## Future Enhancements

### Phase 2: AL-Specific Features

1. **Smart Contract Factory** for custom AL rules
2. **Voting System** with consensus mechanisms
3. **Governance Tokens** for platform participation
4. **Staking Mechanisms** for quality assurance

### Phase 3: Advanced Features

1. **Cross-chain compatibility**
2. **Advanced reputation algorithms**
3. **Automated quality assessment**
4. **Decentralized governance**

## Support & Documentation

- **Smart Contracts**: `/contracts/` directory
- **Deployment Info**: `/deployments/` directory  
- **ABIs**: Available in `/artifacts/contracts/` after compilation
- **Network**: Besu IBFT (localhost:8545-8548)

## Troubleshooting

### Common Issues

1. **"User not registered"**: Ensure user has called `registerUser()` first
2. **"Not authorized to update reputation"**: Add address to authorized updaters
3. **"Factory is paused"**: Contact system administrator
4. **Transaction failures**: Check gas limits and network connectivity

### Network Configuration

```javascript
// Add Besu network to MetaMask
Network Name: DAL Besu Network
RPC URL: http://localhost:8545
Chain ID: 1337
Currency Symbol: ETH
```

## Conclusion

The DAL system provides a complete foundation for decentralized active learning with:

- 🎯 **User Management**: Secure, wallet-based registration
- ⭐ **Reputation System**: Performance-based scoring and levels  
- 💾 **Data Storage**: Blockchain-based experiment and results storage
- 🔒 **Security**: Access control and audit trails
- 🔧 **Extensibility**: Modular design for future enhancements

The system is now ready for integration with your frontend application and can serve as the foundation for building the complete DAL platform with all the features you outlined. 