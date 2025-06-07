// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DALStorage
 * @dev Simple smart contract for storing DAL (Decentralized Active Learning) data
 * This contract handles:
 * - Experiment data storage
 * - Voting results
 * - Model updates
 * - Transaction tracking
 */
contract DALStorage {
    
    // Events
    event DataStored(bytes32 indexed dataId, string dataType, address indexed sender, uint256 timestamp);
    event VotingResultStored(string indexed sessionId, string sampleId, uint8 finalLabel, uint256 voteCount);
    event ModelUpdateStored(string indexed experimentId, string updateType, uint256 timestamp);
    
    // Structs
    struct DALData {
        string dataType;        // "voting_result", "model_update", "experiment_data"
        string jsonData;        // JSON string of the actual data
        address sender;         // Who stored this data
        uint256 timestamp;      // When it was stored
        bool exists;           // Whether this record exists
    }
    
    struct VotingResult {
        string sessionId;
        string sampleId;
        uint8 finalLabel;
        uint256 voteCount;
        bool consensusReached;
        string votesJson;       // JSON array of individual votes
        uint256 timestamp;
        bool exists;
    }
    
    struct ModelUpdate {
        string experimentId;
        string updateType;      // "retrain", "evaluate", "initialize"
        string samplesProcessed; // JSON array of sample IDs
        string performanceMetrics; // JSON object with metrics
        string modelInfo;       // JSON object with model details
        uint256 timestamp;
        bool exists;
    }
    
    // Storage mappings
    mapping(bytes32 => DALData) public dalData;
    mapping(string => VotingResult) public votingResults;
    mapping(bytes32 => ModelUpdate) public modelUpdates;
    
    // Arrays to track all stored items
    bytes32[] public dataIds;
    string[] public votingSessionIds;
    bytes32[] public modelUpdateIds;
    
    // Contract owner
    address public owner;
    
    // Statistics
    uint256 public totalDataEntries;
    uint256 public totalVotingResults;
    uint256 public totalModelUpdates;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        totalDataEntries = 0;
        totalVotingResults = 0;
        totalModelUpdates = 0;
    }
    
    /**
     * @dev Store generic DAL data
     * @param dataType Type of data being stored
     * @param jsonData JSON string containing the data
     * @return dataId Unique identifier for the stored data
     */
    function storeData(string memory dataType, string memory jsonData) 
        public 
        returns (bytes32 dataId) 
    {
        // Generate unique ID
        dataId = keccak256(abi.encodePacked(dataType, jsonData, msg.sender, block.timestamp));
        
        // Store the data
        dalData[dataId] = DALData({
            dataType: dataType,
            jsonData: jsonData,
            sender: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Add to tracking array
        dataIds.push(dataId);
        totalDataEntries++;
        
        // Emit event
        emit DataStored(dataId, dataType, msg.sender, block.timestamp);
        
        return dataId;
    }
    
    /**
     * @dev Store voting result with structured data
     * @param sessionId Unique session identifier
     * @param sampleId Sample that was voted on
     * @param finalLabel The consensus label
     * @param voteCount Number of votes received
     * @param consensusReached Whether consensus was achieved
     * @param votesJson JSON array of individual votes
     */
    function storeVotingResult(
        string memory sessionId,
        string memory sampleId,
        uint8 finalLabel,
        uint256 voteCount,
        bool consensusReached,
        string memory votesJson
    ) public {
        require(!votingResults[sessionId].exists, "Voting result already exists for this session");
        
        votingResults[sessionId] = VotingResult({
            sessionId: sessionId,
            sampleId: sampleId,
            finalLabel: finalLabel,
            voteCount: voteCount,
            consensusReached: consensusReached,
            votesJson: votesJson,
            timestamp: block.timestamp,
            exists: true
        });
        
        votingSessionIds.push(sessionId);
        totalVotingResults++;
        
        emit VotingResultStored(sessionId, sampleId, finalLabel, voteCount);
    }
    
    /**
     * @dev Store model update information
     * @param experimentId Experiment identifier
     * @param updateType Type of update (retrain, evaluate, etc.)
     * @param samplesProcessed JSON array of processed samples
     * @param performanceMetrics JSON object with performance data
     * @param modelInfo JSON object with model information
     */
    function storeModelUpdate(
        string memory experimentId,
        string memory updateType,
        string memory samplesProcessed,
        string memory performanceMetrics,
        string memory modelInfo
    ) public returns (bytes32 updateId) {
        // Generate unique ID
        updateId = keccak256(abi.encodePacked(experimentId, updateType, block.timestamp, msg.sender));
        
        modelUpdates[updateId] = ModelUpdate({
            experimentId: experimentId,
            updateType: updateType,
            samplesProcessed: samplesProcessed,
            performanceMetrics: performanceMetrics,
            modelInfo: modelInfo,
            timestamp: block.timestamp,
            exists: true
        });
        
        modelUpdateIds.push(updateId);
        totalModelUpdates++;
        
        emit ModelUpdateStored(experimentId, updateType, block.timestamp);
        
        return updateId;
    }
    
    /**
     * @dev Retrieve generic data by ID
     * @param dataId The data identifier
     * @return dataType The type of the data
     * @return jsonData The JSON data content
     * @return sender The address that stored the data
     * @return timestamp The timestamp when data was stored
     */
    function getData(bytes32 dataId) 
        public 
        view 
        returns (string memory dataType, string memory jsonData, address sender, uint256 timestamp) 
    {
        require(dalData[dataId].exists, "Data does not exist");
        DALData memory data = dalData[dataId];
        return (data.dataType, data.jsonData, data.sender, data.timestamp);
    }
    
    /**
     * @dev Retrieve voting result by session ID
     * @param sessionId The voting session identifier
     */
    function getVotingResult(string memory sessionId) 
        public 
        view 
        returns (
            string memory sampleId,
            uint8 finalLabel,
            uint256 voteCount,
            bool consensusReached,
            string memory votesJson,
            uint256 timestamp
        ) 
    {
        require(votingResults[sessionId].exists, "Voting result does not exist");
        VotingResult memory result = votingResults[sessionId];
        return (
            result.sampleId,
            result.finalLabel,
            result.voteCount,
            result.consensusReached,
            result.votesJson,
            result.timestamp
        );
    }
    
    /**
     * @dev Retrieve model update by ID
     * @param updateId The model update identifier
     */
    function getModelUpdate(bytes32 updateId) 
        public 
        view 
        returns (
            string memory experimentId,
            string memory updateType,
            string memory samplesProcessed,
            string memory performanceMetrics,
            string memory modelInfo,
            uint256 timestamp
        ) 
    {
        require(modelUpdates[updateId].exists, "Model update does not exist");
        ModelUpdate memory update = modelUpdates[updateId];
        return (
            update.experimentId,
            update.updateType,
            update.samplesProcessed,
            update.performanceMetrics,
            update.modelInfo,
            update.timestamp
        );
    }
    
    /**
     * @dev Get recent data entries
     * @param limit Maximum number of entries to return
     */
    function getRecentData(uint256 limit) 
        public 
        view 
        returns (bytes32[] memory) 
    {
        uint256 totalEntries = dataIds.length;
        uint256 returnSize = limit > totalEntries ? totalEntries : limit;
        
        bytes32[] memory recentIds = new bytes32[](returnSize);
        
        for (uint256 i = 0; i < returnSize; i++) {
            recentIds[i] = dataIds[totalEntries - 1 - i];
        }
        
        return recentIds;
    }
    
    /**
     * @dev Get recent voting sessions
     * @param limit Maximum number of sessions to return
     */
    function getRecentVotingSessions(uint256 limit) 
        public 
        view 
        returns (string[] memory) 
    {
        uint256 totalSessions = votingSessionIds.length;
        uint256 returnSize = limit > totalSessions ? totalSessions : limit;
        
        string[] memory recentSessions = new string[](returnSize);
        
        for (uint256 i = 0; i < returnSize; i++) {
            recentSessions[i] = votingSessionIds[totalSessions - 1 - i];
        }
        
        return recentSessions;
    }
    
    /**
     * @dev Get recent model updates
     * @param limit Maximum number of updates to return
     */
    function getRecentModelUpdates(uint256 limit) 
        public 
        view 
        returns (bytes32[] memory) 
    {
        uint256 totalUpdates = modelUpdateIds.length;
        uint256 returnSize = limit > totalUpdates ? totalUpdates : limit;
        
        bytes32[] memory recentUpdates = new bytes32[](returnSize);
        
        for (uint256 i = 0; i < returnSize; i++) {
            recentUpdates[i] = modelUpdateIds[totalUpdates - 1 - i];
        }
        
        return recentUpdates;
    }
    
    /**
     * @dev Get contract statistics
     */
    function getStats() 
        public 
        view 
        returns (uint256 dataEntries, uint256 votingResults_, uint256 modelUpdates_) 
    {
        return (totalDataEntries, totalVotingResults, totalModelUpdates);
    }
    
    /**
     * @dev Emergency function to update owner (only current owner)
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
} 