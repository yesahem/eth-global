// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24    function readMemories(address agent) external view returns (string[] memory) {
        uint256 memoryCount = agentMemoryData[agent].getMemoryCount();
        MemoryAccessControl.validateReadAccess(msg.sender, agent, MIN_TOKEN_BALANCE, memoryCount);
        
        return agentMemoryData[agent].getMemories();port "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/MemoryAccessControl.sol";
import "./libraries/MemoryStorage.sol";
import "./libraries/MemoryEconomics.sol";

/**
 * @title MemoryLayer
 * @dev Decentralized Memory Layer for AI agents
 * Stores memory references (hashes/CIDs) on-chain with access control based on 0G token balance
 * Uses modular libraries for access control, storage management, and economic operations
 */
contract MemoryLayer is Ownable, ReentrancyGuard {
    using MemoryAccessControl for address;
    using MemoryStorage for MemoryStorage.AgentMemoryData;
    using MemoryEconomics for uint256;

    // Minimum 0G token balance required to read memories (1.5 0G)
    uint256 public constant MIN_TOKEN_BALANCE = 1.5 ether;
    
    // Minimum payment required for access in 0G tokens (alternative to balance check)
    uint256 public constant MIN_PAYMENT = 0.01 ether;
    
    // Mapping from agent address to their memory data
    mapping(address => MemoryStorage.AgentMemoryData) private agentMemoryData;
    
    // Events
    event MemoryWritten(address indexed agent, string memoryHash, uint256 timestamp);
    event MemoryRead(address indexed agent, address indexed reader, uint256 timestamp);
    event PaymentReceived(address indexed payer, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Write a memory hash for the calling agent
     * @param memoryHash The hash/CID of the memory stored in 0G Storage or IPFS
     */
    function writeMemory(string calldata memoryHash) external nonReentrant {
        MemoryAccessControl.validateWriteOperation(msg.sender, memoryHash);
        
        agentMemoryData[msg.sender].addMemory(memoryHash);
        
        emit MemoryWritten(msg.sender, memoryHash, block.timestamp);
    }
    
    /**
     * @dev Read all memories for a specific agent
     * Requires the caller to have at least MIN_TOKEN_BALANCE (1.5 0G tokens)
     * @param agent The address of the agent whose memories to retrieve
     * @return memories Array of memory hashes for the agent
     */
    function readMemory(address agent) external view returns (string[] memory memories) {
        uint256 memoryCount = agentMemoryData[agent].getMemoryCount();
        MemoryAccessControl.validateReadAccess(msg.sender, agent, MIN_TOKEN_BALANCE, memoryCount);
        
        return agentMemoryData[agent].getMemories();
    }
    
    /**
     * @dev Read memories for a specific agent (non-view version that emits event)
     * Requires the caller to have at least MIN_TOKEN_BALANCE (1.5 0G tokens)
     * @param agent The address of the agent whose memories to retrieve
     * @return memories Array of memory hashes for the agent
     */
    function readMemoryWithEvent(address agent) external nonReentrant returns (string[] memory memories) {
        uint256 memoryCount = agentMemoryData[agent].getMemoryCount();
        MemoryAccessControl.validateReadAccess(msg.sender, agent, MIN_TOKEN_BALANCE, memoryCount);
        
        memories = agentMemoryData[agent].getMemories();
        emit MemoryRead(agent, msg.sender, block.timestamp);
        
        return memories;
    }
    
    /**
     * @dev Get the count of memories for an agent
     * @param agent The address of the agent
     * @return count Number of memories stored for the agent
     */
    function getMemoryCount(address agent) external view returns (uint256 count) {
        MemoryAccessControl.validateAgent(agent);
        return agentMemoryData[agent].getMemoryCount();
    }
    
    /**
     * @dev Get a specific memory by index for an agent
     * Requires the caller to have at least MIN_TOKEN_BALANCE (1.5 0G tokens)
     * @param agent The address of the agent
     * @param index The index of the memory to retrieve
     * @return memory The memory hash at the specified index
     */
    function getMemoryByIndex(address agent, uint256 index) external view returns (string memory) {
        uint256 memoryCount = agentMemoryData[agent].getMemoryCount();
        MemoryAccessControl.validateReadAccess(msg.sender, agent, MIN_TOKEN_BALANCE, memoryCount);
        MemoryAccessControl.validateMemoryIndex(agent, index, memoryCount);
        
        return agentMemoryData[agent].getMemoryByIndex(index);
    }
    
    /**
     * @dev Pay for access to memory reading (alternative to 0G token balance requirement)
     * Allows users to pay a fee instead of maintaining minimum 0G token balance
     */
    function payForAccess() external payable nonReentrant {
        uint256 excessAmount = MemoryEconomics.processPayment(MIN_PAYMENT);
        
        emit PaymentReceived(msg.sender, msg.value, block.timestamp);
        
        // Refund excess payment if any
        if (excessAmount > 0) {
            MemoryEconomics.refundExcess(payable(msg.sender), excessAmount);
        }
    }

    /**
     * @dev Get the latest memory for an agent
     * @param agent The address of the agent
     * @return latestMemory The most recent memory hash
     */
    function getLatestMemory(address agent) external view returns (string memory) {
        uint256 memoryCount = agentMemoryData[agent].getMemoryCount();
        MemoryAccessControl.validateReadAccess(msg.sender, agent, MIN_TOKEN_BALANCE, memoryCount);
        
        return agentMemoryData[agent].getLatestMemory();
    }

    /**
     * @dev Get a range of memories for an agent
     * @param agent The address of the agent
     * @param startIndex The starting index (inclusive)
     * @param endIndex The ending index (exclusive)
     * @return memories Array of memory hashes in the specified range
     */
    function getMemoryRange(address agent, uint256 startIndex, uint256 endIndex) 
        external view returns (string[] memory) {
        uint256 memoryCount = agentMemoryData[agent].getMemoryCount();
        MemoryAccessControl.validateReadAccess(msg.sender, agent, MIN_TOKEN_BALANCE, memoryCount);
        
        return agentMemoryData[agent].getMemoryRange(startIndex, endIndex);
    }

    /**
     * @dev Emergency function to clear all memories for an agent (only owner)
     * @param agent The address of the agent whose memories to clear
     */
    function clearMemories(address agent) external onlyOwner {
        MemoryAccessControl.validateAgent(agent);
        agentMemoryData[agent].clearMemories();
    }

    /**
     * @dev Withdraw contract funds (only owner)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        MemoryEconomics.withdrawFunds(payable(owner()), balance);
        
        emit FundsWithdrawn(owner(), balance, block.timestamp);
    }

    /**
     * @dev Check if an agent has any memories
     * @param agent The address of the agent
     * @return hasMemories True if the agent has memories
     */
    function hasMemories(address agent) external view returns (bool) {
        MemoryAccessControl.validateAgent(agent);
        return agentMemoryData[agent].hasMemories();
    }

    /**
     * @dev Get contract balance
     * @return balance The current contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}