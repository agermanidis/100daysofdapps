pragma solidity ^0.4.0;

contract WikiPage {
    struct Revision {
        string ipfsHash;
        uint timestamp;
        address author;
        bool isRevert;
    }
    
    Revision[] public revisions;
    
    function addRevision (string _ipfsHash) public {
        revisions.push(Revision(_ipfsHash, now, msg.sender, false));
    }
    
    function revertTo (uint index) public {
        revisions.push(Revision(revisions[index].ipfsHash, now, msg.sender, true));
    }
    
    function numberOfRevisions () public view returns (uint) {
        return revisions.length;
    }
    
    function getCurrentRevisionHash () public view returns (string) {
        return revisions[revisions.length - 1].ipfsHash;
    }
}