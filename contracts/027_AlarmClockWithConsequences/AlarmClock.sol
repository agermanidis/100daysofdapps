pragma solidity ^0.4.18;

contract AlarmClock {
    mapping (address => uint) public alarmTime;
    mapping (address => bool) public alarmActive;
    
    function stopAlarm () public returns (bool) {
        require(alarmActive[msg.sender]);
        alarmActive[msg.sender] = false;
        if (now < alarmTime[msg.sender] + 10 minutes)
            msg.sender.transfer(0.1 ether);
    }
    
    function setAlarm (uint time) public payable {
        require(msg.value == 0.1 ether);
        alarmActive[msg.sender] = true;
        alarmTime[msg.sender] = time;
    }
}