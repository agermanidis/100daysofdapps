pragma solidity ^0.4.0;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  /**
  * @dev Substracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract ERC20Interface {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract WillExecutor {
    using SafeMath for uint;
    
    struct Property {
        address beneficiary;
        ERC20Interface token;
        uint amount;
    }
    
    uint public constant pulseDuration = 30 days;
    
    mapping (address => mapping (address => uint)) allowances;
    mapping (address => Property[]) public properties;
    mapping (address => uint) lastCheckIn;
    
    function addToWill (address _beneficiary, ERC20Interface _tokenAddress, uint _amount) public payable {
        allowances[msg.sender][_tokenAddress] = allowances[msg.sender][_tokenAddress].add(_amount);
        _tokenAddress.approve(address(this), allowances[msg.sender][_tokenAddress]);
        properties[msg.sender].push(Property(
            _beneficiary,
            _tokenAddress,
            _amount
        ));
    }
    
    function clearWill () public {
        delete properties[msg.sender];
    }
    
    function executeWill (address testator) public {
        require(lastCheckIn[testator] < now - pulseDuration);
        for (uint i = 0; i < properties[testator].length; i++) {
            Property storage property = properties[testator][i];
            property.token.transferFrom(testator, property.beneficiary, property.amount);
        }
        delete properties[testator];
    }
    
    function checkIn () public {
        lastCheckIn[msg.sender] = now;
    }
    
    function getLastCheckIn () public view returns (uint) {
        return lastCheckIn[msg.sender];
    }
    
    function numberOfProperties () public view returns (uint) {
        return properties[msg.sender].length;
    }
}
