// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MemoryStorage
 * @dev Library for handling memory storage operations and data structures
 */
library MemoryStorage {
    /**
     * @dev Storage structure for agent memories
     */
    struct AgentMemoryData {
        string[] memories;
        uint256 count;
    }

    /**
     * @dev Adds a memory hash to an agent's memory list
     * @param agentData The agent's memory data structure
     * @param memoryHash The memory hash to add
     */
    function addMemory(
        AgentMemoryData storage agentData,
        string calldata memoryHash
    ) internal {
        agentData.memories.push(memoryHash);
        agentData.count++;
    }

    /**
     * @dev Gets all memories for an agent
     * @param agentData The agent's memory data structure
     * @return memories Array of memory hashes
     */
    function getMemories(
        AgentMemoryData storage agentData
    ) internal view returns (string[] memory memories) {
        return agentData.memories;
    }

    /**
     * @dev Gets a specific memory by index
     * @param agentData The agent's memory data structure
     * @param index The index of the memory to retrieve
     * @return memory The memory hash at the specified index
     */
    function getMemoryByIndex(
        AgentMemoryData storage agentData,
        uint256 index
    ) internal view returns (string memory) {
        return agentData.memories[index];
    }

    /**
     * @dev Gets the count of memories for an agent
     * @param agentData The agent's memory data structure
     * @return count The number of memories
     */
    function getMemoryCount(
        AgentMemoryData storage agentData
    ) internal view returns (uint256 count) {
        return agentData.count;
    }

    /**
     * @dev Clears all memories for an agent
     * @param agentData The agent's memory data structure
     */
    function clearMemories(AgentMemoryData storage agentData) internal {
        delete agentData.memories;
        agentData.count = 0;
    }

    /**
     * @dev Checks if an agent has any memories
     * @param agentData The agent's memory data structure
     * @return hasMemories True if the agent has memories, false otherwise
     */
    function hasMemories(
        AgentMemoryData storage agentData
    ) internal view returns (bool) {
        return agentData.count > 0;
    }

    /**
     * @dev Gets the latest memory hash for an agent
     * @param agentData The agent's memory data structure
     * @return latestMemory The most recently added memory hash
     */
    function getLatestMemory(
        AgentMemoryData storage agentData
    ) internal view returns (string memory latestMemory) {
        require(agentData.count > 0, "No memories found");
        return agentData.memories[agentData.count - 1];
    }

    /**
     * @dev Gets a range of memories for an agent
     * @param agentData The agent's memory data structure
     * @param startIndex The starting index (inclusive)
     * @param endIndex The ending index (exclusive)
     * @return memories Array of memory hashes in the specified range
     */
    function getMemoryRange(
        AgentMemoryData storage agentData,
        uint256 startIndex,
        uint256 endIndex
    ) internal view returns (string[] memory memories) {
        require(startIndex < agentData.count, "Start index out of bounds");
        require(endIndex <= agentData.count, "End index out of bounds");
        require(startIndex < endIndex, "Invalid range");

        uint256 rangeLength = endIndex - startIndex;
        memories = new string[](rangeLength);

        for (uint256 i = 0; i < rangeLength; i++) {
            memories[i] = agentData.memories[startIndex + i];
        }

        return memories;
    }
}