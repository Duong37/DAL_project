// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserProfile
 * @dev Individual user profile contract deployed for each registered user
 * This contract stores user metadata and is owned by the registering user
 */
contract UserProfile {
    
    // Events
    event ProfileUpdated(address indexed user, string field, string newValue);
    event ProfileCreated(address indexed user, string username, string organization, string country);
    
    // State variables
    address public owner;           // The wallet address that owns this profile
    address public publicAddress;   // The user's public wallet address (same as owner)
    string public username;         // User's chosen username
    string public organization;     // User's organization/institution
    string public country;         // User's country
    uint256 public createdAt;      // Timestamp when profile was created
    uint256 public lastUpdated;    // Timestamp when profile was last updated
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only profile owner can perform this action");
        _;
    }
    
    modifier validString(string memory _str) {
        require(bytes(_str).length > 0, "String cannot be empty");
        require(bytes(_str).length <= 100, "String too long (max 100 characters)");
        _;
    }
    
    /**
     * @dev Constructor called by the factory when deploying a new profile
     * @param _owner The wallet address that will own this profile
     * @param _username Initial username
     * @param _organization Initial organization
     * @param _country Initial country
     */
    constructor(
        address _owner,
        string memory _username,
        string memory _organization,
        string memory _country
    ) 
        validString(_username)
        validString(_organization)
        validString(_country)
    {
        require(_owner != address(0), "Owner address cannot be zero");
        
        owner = _owner;
        publicAddress = _owner;
        username = _username;
        organization = _organization;
        country = _country;
        createdAt = block.timestamp;
        lastUpdated = block.timestamp;
        
        emit ProfileCreated(_owner, _username, _organization, _country);
    }
    
    /**
     * @dev Update the username
     * @param _newUsername New username
     */
    function updateUsername(string memory _newUsername) 
        external 
        onlyOwner 
        validString(_newUsername) 
    {
        username = _newUsername;
        lastUpdated = block.timestamp;
        emit ProfileUpdated(owner, "username", _newUsername);
    }
    
    /**
     * @dev Update the organization
     * @param _newOrganization New organization
     */
    function updateOrganization(string memory _newOrganization) 
        external 
        onlyOwner 
        validString(_newOrganization) 
    {
        organization = _newOrganization;
        lastUpdated = block.timestamp;
        emit ProfileUpdated(owner, "organization", _newOrganization);
    }
    
    /**
     * @dev Update the country
     * @param _newCountry New country
     */
    function updateCountry(string memory _newCountry) 
        external 
        onlyOwner 
        validString(_newCountry) 
    {
        country = _newCountry;
        lastUpdated = block.timestamp;
        emit ProfileUpdated(owner, "country", _newCountry);
    }
    
    /**
     * @dev Get all profile information
     * @return _publicAddress The user's public address
     * @return _username The user's username
     * @return _organization The user's organization
     * @return _country The user's country
     * @return _createdAt Profile creation timestamp
     * @return _lastUpdated Last update timestamp
     */
    function getProfile() 
        external 
        view 
        returns (
            address _publicAddress,
            string memory _username,
            string memory _organization,
            string memory _country,
            uint256 _createdAt,
            uint256 _lastUpdated
        ) 
    {
        return (
            publicAddress,
            username,
            organization,
            country,
            createdAt,
            lastUpdated
        );
    }
    
    /**
     * @dev Get profile metadata as JSON-like string for off-chain systems
     * @return JSON-formatted string with profile data
     */
    function getProfileJSON() external view returns (string memory) {
        return string(abi.encodePacked(
            '{"publicAddress":"', addressToString(publicAddress),
            '","username":"', username,
            '","organization":"', organization,
            '","country":"', country,
            '","createdAt":', uint2str(createdAt),
            ',"lastUpdated":', uint2str(lastUpdated),
            '}'
        ));
    }
    
    /**
     * @dev Check if this profile is owned by a specific address
     * @param _address Address to check
     * @return True if the address owns this profile
     */
    function isOwnedBy(address _address) external view returns (bool) {
        return owner == _address;
    }
    
    // Utility functions
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
    
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
} 