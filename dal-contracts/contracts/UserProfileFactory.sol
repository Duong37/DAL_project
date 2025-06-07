// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserProfile.sol";

/**
 * @title UserProfileFactory
 * @dev Factory contract for deploying and managing UserProfile contracts
 * This contract maintains a registry of all user profiles and prevents duplicate registrations
 */
contract UserProfileFactory {
    
    // Events
    event UserRegistered(
        address indexed userAddress, 
        address indexed profileContract, 
        string username, 
        uint256 timestamp
    );
    event FactoryPaused(bool isPaused);
    
    // State variables
    address public owner;                                    // Factory owner (can pause/unpause)
    bool public isPaused;                                   // Emergency pause functionality
    uint256 public totalUsers;                             // Total number of registered users
    
    // Mappings
    mapping(address => address) public userProfiles;       // user address => profile contract address
    mapping(address => bool) public isRegistered;          // user address => registration status
    mapping(string => bool) public usernameTaken;          // username => taken status
    
    // Arrays for enumeration
    address[] public allUsers;                             // Array of all registered user addresses
    address[] public allProfileContracts;                 // Array of all deployed profile contracts
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only factory owner can perform this action");
        _;
    }
    
    modifier whenNotPaused() {
        require(!isPaused, "Factory is paused");
        _;
    }
    
    modifier notAlreadyRegistered() {
        require(!isRegistered[msg.sender], "Address already registered");
        _;
    }
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    modifier validString(string memory _str) {
        require(bytes(_str).length > 0, "String cannot be empty");
        require(bytes(_str).length <= 100, "String too long (max 100 characters)");
        _;
    }
    
    modifier uniqueUsername(string memory _username) {
        require(!usernameTaken[_username], "Username already taken");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() {
        owner = msg.sender;
        isPaused = false;
        totalUsers = 0;
    }
    
    /**
     * @dev Register a new user and deploy their profile contract
     * @param _username Desired username (must be unique)
     * @param _organization User's organization/institution
     * @param _country User's country
     * @return profileAddress Address of the deployed UserProfile contract
     */
    function registerUser(
        string memory _username,
        string memory _organization,
        string memory _country
    ) 
        external 
        whenNotPaused 
        notAlreadyRegistered 
        validString(_username)
        validString(_organization)
        validString(_country)
        uniqueUsername(_username)
        returns (address profileAddress) 
    {
        // Deploy new UserProfile contract
        UserProfile newProfile = new UserProfile(
            msg.sender,
            _username,
            _organization,
            _country
        );
        
        profileAddress = address(newProfile);
        
        // Update mappings and arrays
        userProfiles[msg.sender] = profileAddress;
        isRegistered[msg.sender] = true;
        usernameTaken[_username] = true;
        allUsers.push(msg.sender);
        allProfileContracts.push(profileAddress);
        totalUsers++;
        
        emit UserRegistered(msg.sender, profileAddress, _username, block.timestamp);
        
        return profileAddress;
    }
    
    /**
     * @dev Get a user's profile contract address
     * @param _userAddress User's wallet address
     * @return Profile contract address (zero address if not registered)
     */
    function getUserProfile(address _userAddress) external view returns (address) {
        return userProfiles[_userAddress];
    }
    
    /**
     * @dev Check if a user is registered
     * @param _userAddress User's wallet address
     * @return True if user is registered
     */
    function isUserRegistered(address _userAddress) external view returns (bool) {
        return isRegistered[_userAddress];
    }
    
    /**
     * @dev Check if a username is available
     * @param _username Username to check
     * @return True if username is available
     */
    function isUsernameAvailable(string memory _username) external view returns (bool) {
        return !usernameTaken[_username];
    }
    
    /**
     * @dev Get user profile data by address
     * @param _userAddress User's wallet address
     * @return profileContract Address of the user's profile contract
     * @return publicAddress User's public wallet address
     * @return username User's username
     * @return organization User's organization
     * @return country User's country
     * @return createdAt Profile creation timestamp
     * @return lastUpdated Last update timestamp
     */
    function getUserProfileData(address _userAddress) 
        external 
        view 
        returns (
            address profileContract,
            address publicAddress,
            string memory username,
            string memory organization,
            string memory country,
            uint256 createdAt,
            uint256 lastUpdated
        ) 
    {
        address profileAddr = userProfiles[_userAddress];
        if (profileAddr == address(0)) {
            return (address(0), address(0), "", "", "", 0, 0);
        }
        
        UserProfile profile = UserProfile(profileAddr);
        (publicAddress, username, organization, country, createdAt, lastUpdated) = profile.getProfile();
        
        return (profileAddr, publicAddress, username, organization, country, createdAt, lastUpdated);
    }
    
    /**
     * @dev Get all registered users (paginated)
     * @param _start Start index
     * @param _limit Number of users to return
     * @return users Array of user addresses
     * @return hasMore True if there are more users beyond this page
     */
    function getAllUsers(uint256 _start, uint256 _limit) 
        external 
        view 
        returns (address[] memory users, bool hasMore) 
    {
        require(_start < totalUsers, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > totalUsers) {
            end = totalUsers;
        }
        
        users = new address[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            users[i - _start] = allUsers[i];
        }
        
        hasMore = end < totalUsers;
        return (users, hasMore);
    }
    
    /**
     * @dev Get all profile contracts (paginated)
     * @param _start Start index
     * @param _limit Number of contracts to return
     * @return contracts Array of profile contract addresses
     * @return hasMore True if there are more contracts beyond this page
     */
    function getAllProfileContracts(uint256 _start, uint256 _limit) 
        external 
        view 
        returns (address[] memory contracts, bool hasMore) 
    {
        require(_start < totalUsers, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > totalUsers) {
            end = totalUsers;
        }
        
        contracts = new address[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            contracts[i - _start] = allProfileContracts[i];
        }
        
        hasMore = end < totalUsers;
        return (contracts, hasMore);
    }
    
    /**
     * @dev Get factory statistics
     * @return totalUsers Total number of registered users
     * @return factoryOwner Factory owner address
     * @return factoryPaused Whether factory is paused
     */
    function getFactoryStats() 
        external 
        view 
        returns (uint256 totalUsers, address factoryOwner, bool factoryPaused) 
    {
        return (totalUsers, owner, isPaused);
    }
    
    // Owner-only functions
    
    /**
     * @dev Pause/unpause the factory (emergency function)
     * @param _paused True to pause, false to unpause
     */
    function setPaused(bool _paused) external onlyOwner {
        isPaused = _paused;
        emit FactoryPaused(_paused);
    }
    
    /**
     * @dev Transfer factory ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner validAddress(_newOwner) {
        owner = _newOwner;
    }
    
    /**
     * @dev Emergency function to manually mark a username as available
     * @param _username Username to free up
     */
    function emergencyFreeUsername(string memory _username) external onlyOwner {
        usernameTaken[_username] = false;
    }
} 