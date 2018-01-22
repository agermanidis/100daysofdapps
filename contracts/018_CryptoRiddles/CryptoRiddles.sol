pragma solidity ^0.4.19;

contract CryptoRiddles {
    struct Riddle {
        address submitter;
        string riddle;
        bytes32 sealedAnswer;
        string unsealedAnswer;
        uint prize;
        address winner;
    }
    
    Riddle[] public riddles;
    
    function addRiddle (string riddle, bytes32 sealedAnswer) public payable {
        require(sealedAnswer != sha256(""));
        riddles.push(Riddle(
            msg.sender,
            riddle, 
            sealedAnswer, 
            "",
            msg.value, 
            address(0)
        ));
    }
    
    function answerRiddle (uint riddleId, string answer) public {
        Riddle storage riddle = riddles[riddleId];
        require(riddle.winner == address(0));
        require(riddle.sealedAnswer == sha256(answer));
        riddle.winner = msg.sender;
        riddle.unsealedAnswer = answer;
        msg.sender.transfer(riddle.prize);
    }
    
    function numberOfRiddles () public view returns (uint) {
        return riddles.length;
    }
}