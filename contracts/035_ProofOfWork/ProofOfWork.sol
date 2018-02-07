pragma solidity ^0.4.18;

import "github.com/Arachnid/solidity-stringutils/strings.sol";

contract ProofOfWork {
    using strings for *;
    
    address public currentWinner;
    string public sentence;
    uint public difficulty;
    
    function ProofOfWork () public {
        currentWinner = msg.sender;
    }
    
    function setChallenge (string _sentence, uint _difficulty) public {
        require(msg.sender == currentWinner);
        sentence = _sentence;
        difficulty = _difficulty;
    }
    
    function submitWork (string nonce) public {
        string memory s = sentence.toSlice().concat(nonce.toSlice());
        bytes32 hashed = sha256(s);
        for (uint i = 0; i < difficulty; i++) {
            require(int8(hashed[i]) / 2 ** 4 == 0);
        }
        currentWinner = msg.sender;
    }
}