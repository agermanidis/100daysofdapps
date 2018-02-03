pragma solidity ^0.4.18;

contract GoalTracker {
    struct Goal {
        string content;
        address setter;
        address verifier;
        uint bounty;
        bool verified;
    }
    
    Goal[] public goals;
    
    function setGoal (address verifier, string content) public payable {
        goals.push(Goal(content, msg.sender, verifier, msg.value, false));
    }
    
    function numberOfGoals () public view returns (uint) { 
        return goals.length;
    }
    
    function verifyGoal (uint goalId) public {
        require(!goals[goalId].verified);
        require(msg.sender == goals[goalId].verifier);
        goals[goalId].verified = true;
        goals[goalId].setter.transfer(goals[goalId].bounty);
    }
}