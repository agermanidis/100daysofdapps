pragma solidity ^0.4.10;

contract Calendar {
    struct Slot {
        uint start;
        uint end;
        string contentHash;
        address taker;
    }
    
    address public owner;
    uint public pricePerSecond = 0.00003 ether;
    uint public minimumTime = 15 minutes;
    
    Slot[] public slots;

    function Calendar () public {
        owner = msg.sender;
    }
    
    function pricePerHour () public view returns (uint) {
        return pricePerSecond * 1 hours;
    }
    
    function bookTime (uint start, uint end, string contentHash) public payable {
        require(minimumTime > (end - start));
        uint duration = end - start;
        uint price = pricePerSecond * duration;
        require(msg.value >= price);
        require(isSlotAvailable(start, end));
        slots.push(Slot(start, end, contentHash, msg.sender));
    }
    
    function makeUnavailable (uint start, uint end) public {
        require(msg.sender == owner);
        slots.push(Slot(start, end, "", msg.sender));
    }
    
    function numberOfSlots () public view returns (uint) {
        return slots.length;
    }
    
    function withdraw () public {
        require(msg.sender == owner);
        msg.sender.transfer(this.balance);
    }
    
    function isSlotAvailable (uint start, uint end) public view returns (bool) {
        for (uint i = 0; i < slots.length; i++) {
            Slot storage slot = slots[i];
            if (start > slot.start && start < slot.end) return false;
            if (end > slot.start && end < slot.end) return false;
        }
        return true;
    }
}