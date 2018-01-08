pragma solidity ^0.4.19;

contract TimestampedMedia {
    struct Item {
        bytes32 hash;
        address owner;
        uint timestamp;
    }
    
    mapping (bytes32 => Item) verified;
    Item[] public items;
    
    function verify (bytes32 hash) public payable {
        require(!isVerified(hash));
        Item memory item = Item(hash, msg.sender, now);
        verified[hash] = item;
        items.push(item);
    }
    
    function getInfo (bytes32 hash) public view returns (address, uint) {
        require(isVerified(hash));
        return (verified[hash].owner, verified[hash].timestamp);
    }
    
    function isVerified (bytes32 hash) public view returns (bool) { 
        return verified[hash].owner != address(0);
    }
}
