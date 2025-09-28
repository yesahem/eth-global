// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MemoryAccessControl
 * @dev Library for handling access control and validation logic for memory operations
 */
library MemoryAccessControl {
    // Custom errors
    error InsufficientTokenBalance(address reader, uint256 balance, uint256 required);
    error EmptyMemoryHash();
    error NoMemoriesFound(address agent);
    error MemoryIndexOutOfBounds(address agent, uint256 index, uint256 length);
    error InvalidAgent();

    /**
     * @dev Validates if the caller has sufficient 0G token balance
     * @param caller The address to check balance for
     * @param minBalance The minimum required balance in 0G tokens
     */
    function validateTokenBalance(address caller, uint256 minBalance) internal view {
        uint256 callerBalance = caller.balance;
        if (callerBalance < minBalance) {
            revert InsufficientTokenBalance(caller, callerBalance, minBalance);
        }
    }

    /**
     * @dev Validates that a memory hash is not empty
     * @param memoryHash The memory hash to validate
     */
    function validateMemoryHash(string calldata memoryHash) internal pure {
        if (bytes(memoryHash).length == 0) {
            revert EmptyMemoryHash();
        }
    }

    /**
     * @dev Validates that an agent has memories
     * @param agent The agent address to check
     * @param memoryCount The number of memories for the agent
     */
    function validateHasMemories(address agent, uint256 memoryCount) internal pure {
        if (memoryCount == 0) {
            revert NoMemoriesFound(agent);
        }
    }

    /**
     * @dev Validates that a memory index is within bounds
     * @param agent The agent address
     * @param index The index to validate
     * @param memoryCount The total number of memories
     */
    function validateMemoryIndex(
        address agent, 
        uint256 index, 
        uint256 memoryCount
    ) internal pure {
        if (index >= memoryCount) {
            revert MemoryIndexOutOfBounds(agent, index, memoryCount);
        }
    }

    /**
     * @dev Validates that an agent address is not zero
     * @param agent The agent address to validate
     */
    function validateAgent(address agent) internal pure {
        if (agent == address(0)) {
            revert InvalidAgent();
        }
    }

    /**
     * @dev Comprehensive access validation for reading operations
     * @param caller The address requesting access
     * @param agent The agent whose memories are being accessed
     * @param minBalance The minimum 0G token balance required
     * @param memoryCount The number of memories the agent has
     */
    function validateReadAccess(
        address caller,
        address agent,
        uint256 minBalance,
        uint256 memoryCount
    ) internal view {
        validateAgent(agent);
        validateTokenBalance(caller, minBalance);
        validateHasMemories(agent, memoryCount);
    }

    /**
     * @dev Validates write operation parameters
     * @param agent The agent address
     * @param memoryHash The memory hash to write
     */
    function validateWriteOperation(
        address agent,
        string calldata memoryHash
    ) internal pure {
        validateAgent(agent);
        validateMemoryHash(memoryHash);
    }
}