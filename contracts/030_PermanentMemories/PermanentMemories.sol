pragma solidity ^0.4.0;

contract PermanentMemories {
    struct Memory {
        address submitter;
        string content;
    }
    
    Memory[] public memories;
    
    function numberOfMemories () public view returns (uint) {
        return memories.length;
    }
    
    function createMemory (string memoryHash) public {
        memories.push(Memory(msg.sender, memoryHash));
    }
}