pragma solidity ^0.4.0;

contract TributeGod {
    struct Tribute {
        uint amount;
        uint timestamp;
    } 
    
    mapping (address => Tribute) lastTribute;
    
    // returns e^(mood)
    function getMood () public view returns (uint) {
        Tribute storage t = lastTribute[msg.sender];
        if (t.timestamp == 0) return 0;
        uint timeAgo = now - t.timestamp;
        return max(0, (10 minutes - timeAgo) * (t.amount / 1 ether));
    }
    
     function max(uint a, uint b) private pure returns (uint) {
        return a > b ? a : b;
    }
    
    function payTribute () public payable {
        lastTribute[msg.sender] = Tribute(msg.value, now);
    }
}