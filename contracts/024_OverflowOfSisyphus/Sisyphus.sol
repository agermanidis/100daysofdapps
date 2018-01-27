pragma solidity ^0.4.16;

contract Sisyphus {
    uint8 public rockPosition;
    
    function pushRock (uint8 pushAmount) public {
        rockPosition += pushAmount;
    } 
}