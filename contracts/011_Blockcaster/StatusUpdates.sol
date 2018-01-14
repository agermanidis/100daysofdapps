pragma solidity ^0.4.0;

contract StatusUpdates {
    event StatusUpdated(address, string);
    
    struct Status {
        address author;
        uint timestamp;
        string content;
    }
    
    mapping (address => string) public status;
    Status[] public statuses;
    
    function setStatus (string _status) public {
        status[msg.sender] = _status;
        statuses.push(Status(msg.sender, now, _status));
        StatusUpdated(msg.sender, _status);
    }
    
    function numberOfStatuses () public view returns (uint) {
        return statuses.length;
    }
}