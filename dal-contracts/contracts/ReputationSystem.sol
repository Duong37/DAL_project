// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserProfileFactory.sol";

/**
 * @title ReputationSystem
 * @dev Manages user reputation scores for the DAL platform
 * This contract tracks user performance in active learning tasks
 */
contract ReputationSystem {
    
    // Events
    event ReputationUpdated(
        address indexed user, 
        int256 change, 
        uint256 newScore, 
        string reason,
        uint256 timestamp
    );
    event ReputationThresholdUpdated(string threshold, uint256 newValue);
    event SystemPaused(bool isPaused);
    
    // Structs
    struct ReputationRecord {
        uint256 score;              // Current reputation score
        uint256 totalTasks;         // Total tasks completed
        uint256 successfulTasks;    // Successfully completed tasks
        uint256 lastActivity;       // Last activity timestamp
        bool isActive;              // Whether user is active
    }
    
    struct ReputationChange {
        int256 change;              // Score change (positive or negative)
        string reason;              // Reason for the change
        uint256 timestamp;          // When the change occurred
        address changedBy;          // Who made the change (for auditing)
    }
    
    // State variables
    address public owner;
    address public userProfileFactory;      // Reference to UserProfileFactory
    bool public isPaused;
    uint256 public totalActiveUsers;
    
    // Reputation thresholds
    uint256 public noviceThreshold = 100;
    uint256 public intermediateThreshold = 500;
    uint256 public expertThreshold = 1000;
    uint256 public masterThreshold = 2000;
    
    // Default scores
    uint256 public constant INITIAL_SCORE = 100;
    int256 public constant GOOD_LABEL_REWARD = 10;
    int256 public constant BAD_LABEL_PENALTY = -5;
    int256 public constant CONSENSUS_BONUS = 5;
    int256 public constant QUALITY_BONUS = 15;
    
    // Mappings
    mapping(address => ReputationRecord) public reputations;
    mapping(address => ReputationChange[]) public reputationHistory;
    mapping(address => bool) public authorizedUpdaters;  // Addresses that can update reputation
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedUpdaters[msg.sender], 
            "Not authorized to update reputation"
        );
        _;
    }
    
    modifier whenNotPaused() {
        require(!isPaused, "System is paused");
        _;
    }
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    modifier userMustBeRegistered(address _user) {
        if (userProfileFactory != address(0)) {
            UserProfileFactory factory = UserProfileFactory(userProfileFactory);
            require(factory.isUserRegistered(_user), "User not registered");
        }
        _;
    }
    
    /**
     * @dev Constructor
     * @param _userProfileFactory Address of the UserProfileFactory contract
     */
    constructor(address _userProfileFactory) {
        owner = msg.sender;
        userProfileFactory = _userProfileFactory;
        isPaused = false;
        totalActiveUsers = 0;
    }
    
    /**
     * @dev Initialize reputation for a new user
     * @param _user User address
     */
    function initializeUserReputation(address _user) 
        external 
        whenNotPaused 
        userMustBeRegistered(_user) 
    {
        require(reputations[_user].score == 0, "User already initialized");
        
        reputations[_user] = ReputationRecord({
            score: INITIAL_SCORE,
            totalTasks: 0,
            successfulTasks: 0,
            lastActivity: block.timestamp,
            isActive: true
        });
        
        totalActiveUsers++;
        
        // Record the initialization
        reputationHistory[_user].push(ReputationChange({
            change: int256(INITIAL_SCORE),
            reason: "Account initialization",
            timestamp: block.timestamp,
            changedBy: msg.sender
        }));
        
        emit ReputationUpdated(_user, int256(INITIAL_SCORE), INITIAL_SCORE, "Account initialization", block.timestamp);
    }
    
    /**
     * @dev Update user reputation based on task performance
     * @param _user User address
     * @param _change Reputation change (positive or negative)
     * @param _reason Reason for the change
     */
    function updateReputation(
        address _user, 
        int256 _change, 
        string memory _reason
    ) 
        public 
        onlyAuthorized 
        whenNotPaused 
        userMustBeRegistered(_user)
    {
        require(reputations[_user].score > 0, "User not initialized");
        require(bytes(_reason).length > 0, "Reason cannot be empty");
        
        ReputationRecord storage record = reputations[_user];
        
        // Calculate new score (prevent underflow)
        uint256 newScore;
        if (_change < 0 && uint256(-_change) > record.score) {
            newScore = 0;
        } else if (_change < 0) {
            newScore = record.score - uint256(-_change);
        } else {
            newScore = record.score + uint256(_change);
        }
        
        record.score = newScore;
        record.lastActivity = block.timestamp;
        
        // Update task counters if this is a task completion
        if (bytes(_reason)[0] == 'T') { // Task-related updates start with 'T'
            record.totalTasks++;
            if (_change > 0) {
                record.successfulTasks++;
            }
        }
        
        // Record the change
        reputationHistory[_user].push(ReputationChange({
            change: _change,
            reason: _reason,
            timestamp: block.timestamp,
            changedBy: msg.sender
        }));
        
        emit ReputationUpdated(_user, _change, newScore, _reason, block.timestamp);
    }
    
    /**
     * @dev Batch update reputation for multiple users
     * @param _users Array of user addresses
     * @param _changes Array of reputation changes
     * @param _reason Reason for the changes
     */
    function batchUpdateReputation(
        address[] memory _users,
        int256[] memory _changes,
        string memory _reason
    ) 
        external 
        onlyAuthorized 
        whenNotPaused 
    {
        require(_users.length == _changes.length, "Arrays length mismatch");
        require(_users.length <= 50, "Too many users in batch");
        
        for (uint256 i = 0; i < _users.length; i++) {
            updateReputation(_users[i], _changes[i], _reason);
        }
    }
    
    /**
     * @dev Get user reputation information
     * @param _user User address
     * @return score Current reputation score
     * @return totalTasks Total tasks completed
     * @return successfulTasks Successfully completed tasks
     * @return lastActivity Last activity timestamp
     * @return isActive Whether user is active
     * @return level User's reputation level
     */
    function getUserReputation(address _user) 
        external 
        view 
        returns (
            uint256 score,
            uint256 totalTasks,
            uint256 successfulTasks,
            uint256 lastActivity,
            bool isActive,
            string memory level
        ) 
    {
        ReputationRecord memory record = reputations[_user];
        return (
            record.score,
            record.totalTasks,
            record.successfulTasks,
            record.lastActivity,
            record.isActive,
            getReputationLevel(record.score)
        );
    }
    
    /**
     * @dev Get reputation level based on score
     * @param _score Reputation score
     * @return level Reputation level string
     */
    function getReputationLevel(uint256 _score) public view returns (string memory level) {
        if (_score >= masterThreshold) {
            return "Master";
        } else if (_score >= expertThreshold) {
            return "Expert";
        } else if (_score >= intermediateThreshold) {
            return "Intermediate";
        } else if (_score >= noviceThreshold) {
            return "Novice";
        } else {
            return "Beginner";
        }
    }
    
    /**
     * @dev Get user's reputation history
     * @param _user User address
     * @param _start Start index
     * @param _limit Number of records to return
     * @return changes Array of reputation changes
     * @return hasMore Whether there are more records
     */
    function getReputationHistory(address _user, uint256 _start, uint256 _limit) 
        external 
        view 
        returns (ReputationChange[] memory changes, bool hasMore) 
    {
        ReputationChange[] storage history = reputationHistory[_user];
        require(_start < history.length, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > history.length) {
            end = history.length;
        }
        
        changes = new ReputationChange[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            changes[i - _start] = history[i];
        }
        
        hasMore = end < history.length;
        return (changes, hasMore);
    }
    
    /**
     * @dev Get top users by reputation
     * @param _limit Number of top users to return
     * @return users Array of user addresses
     * @return scores Array of corresponding scores
     */
    function getTopUsers(uint256 _limit) 
        external 
        view 
        returns (address[] memory users, uint256[] memory scores) 
    {
        // Note: This is a simple implementation. For production, consider using 
        // a more efficient data structure for ranking
        require(_limit <= 100, "Limit too high");
        
        // This is a placeholder - in a real implementation you'd want to maintain
        // a sorted list or use a more efficient ranking system
        users = new address[](_limit);
        scores = new uint256[](_limit);
        
        // For now, return empty arrays - this would need to be implemented
        // with proper sorting logic based on your specific requirements
        return (users, scores);
    }
    
    // Owner-only functions
    
    /**
     * @dev Add authorized updater
     * @param _updater Address to authorize
     */
    function addAuthorizedUpdater(address _updater) external onlyOwner validAddress(_updater) {
        authorizedUpdaters[_updater] = true;
    }
    
    /**
     * @dev Remove authorized updater
     * @param _updater Address to remove authorization
     */
    function removeAuthorizedUpdater(address _updater) external onlyOwner {
        authorizedUpdaters[_updater] = false;
    }
    
    /**
     * @dev Update reputation thresholds
     * @param _novice Novice threshold
     * @param _intermediate Intermediate threshold
     * @param _expert Expert threshold
     * @param _master Master threshold
     */
    function updateThresholds(
        uint256 _novice,
        uint256 _intermediate,
        uint256 _expert,
        uint256 _master
    ) external onlyOwner {
        require(_novice < _intermediate && _intermediate < _expert && _expert < _master, 
                "Thresholds must be in ascending order");
        
        noviceThreshold = _novice;
        intermediateThreshold = _intermediate;
        expertThreshold = _expert;
        masterThreshold = _master;
        
        emit ReputationThresholdUpdated("All", block.timestamp);
    }
    
    /**
     * @dev Pause/unpause the system
     * @param _paused True to pause, false to unpause
     */
    function setPaused(bool _paused) external onlyOwner {
        isPaused = _paused;
        emit SystemPaused(_paused);
    }
    
    /**
     * @dev Transfer ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner validAddress(_newOwner) {
        owner = _newOwner;
    }
} 