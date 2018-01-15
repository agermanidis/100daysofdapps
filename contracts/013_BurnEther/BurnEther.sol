pragma solidity ^0.4.19;

contract Throwaway {
    function () public payable {
    }
    
    function destroy() public {
        selfdestruct(address(this));
    } 
}

contract BurnEther {
    uint public valueDestroyed;
    event BurnEvent(address, string, uint);
    
    function burn (string reason) public payable {
        Throwaway throwaway = new Throwaway();
        throwaway.transfer(msg.value);
        throwaway.destroy();
        valueDestroyed += msg.value;
        BurnEvent(msg.sender, reason, msg.value);
    }
}