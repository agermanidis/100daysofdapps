pragma solidity ^0.4.19;

contract ClassConsciousness {
    enum SocialClass { Lower, Middle, Upper }
    
    struct Broadcast {
        address author;
        uint timestamp;
        string content;
        SocialClass class;
    }
    
    Broadcast[] public broadcasts;
    
    function getClass (uint b) public pure returns (SocialClass) {
        if (b < 2 ether) {
            return SocialClass.Lower;
        } else if (b < 10 ether) {
            return SocialClass.Middle;
        } else {
            return SocialClass.Upper;
        }
    }
    
    function broadcast (string content) public {
        broadcasts.push(Broadcast(msg.sender, now, content, getClass(msg.sender.balance)));
    }
    
    function numberOfBroadcasts () public view returns (uint) {
        return broadcasts.length;
    }

}