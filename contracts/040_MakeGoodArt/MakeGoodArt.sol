pragma solidity ^0.4.18;

contract MakeGoodArt {
    struct Signatory {
        address addr;
        string name;
        uint time;
    }
    Signatory[] public signatories;
    mapping (address => bool) public hasSigned;
    
    function iWillMakeGoodArt (string name) public {
        require(!hasSigned[msg.sender]);
        signatories.push(Signatory(msg.sender, name, now));
        hasSigned[msg.sender] = true;
    }
    
    function numberOfSignatories () public view returns (uint) {
        return signatories.length;
    }
}