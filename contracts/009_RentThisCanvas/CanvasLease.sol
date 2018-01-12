pragma solidity ^0.4.0;

library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}


contract Ownable {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() public {
    owner = msg.sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

contract CanvasLease is Ownable {
    using SafeMath for uint256;
    
    address currentRentier;
    uint currentExpiry = 0;
    uint balance = 0;
    
    string public contentHash;
    uint public pricePerHour = 0.01 ether;
    
    function getCurrentRentier () public view returns (address) {
        if (now > currentExpiry) return address(0);
        return currentRentier;
    }
    
    function getCurrentExpiry () public view returns (uint) {
        return currentExpiry;
    }
    
    function isAvailable () public view returns (bool) {
        return getCurrentRentier() == address(0);
    }
    
    function rent (uint hrs) public payable {
        require(isAvailable());
        require(hrs > 0);
        require(msg.value >= pricePerHour * hrs);
        currentRentier = msg.sender;
        currentExpiry = now + hrs * 1 hours;
        balance = balance.add(msg.value);
    }
    
    function setContent (string _contentHash) public {
        require(msg.sender == getCurrentRentier());
        contentHash = _contentHash;
    }
    
    function withdrawRents () public onlyOwner {
        uint toWithdraw = balance;
        balance = 0;
        owner.transfer(toWithdraw);
    }
}