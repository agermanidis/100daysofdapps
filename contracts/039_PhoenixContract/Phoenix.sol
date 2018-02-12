pragma solidity ^0.4.18;

contract PhoenixTracker {
    Phoenix public current;
    
    function setAddress (Phoenix addr) public {
        current = addr;
    }
    function createNew () public {
        current = new Phoenix(this);
    }
}

contract Phoenix {
    PhoenixTracker tracker;
    
    function Phoenix (PhoenixTracker _tracker) public {
        tracker = _tracker;
    }
    
    function regenerate () public {
        tracker.createNew();
        selfdestruct(0);
    }
}