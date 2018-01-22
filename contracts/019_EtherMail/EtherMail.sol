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

contract Ethermail {
    using SafeMath for uint;
    
    struct Message {
        uint id;
        string content;
        address from;
        address to;
        uint timestamp;
        uint bounty;
        bool isReply;
        uint replyTo;
        bool hasReply;
        uint replyId;
    }
    
    mapping (address => uint[]) inboxes;
    mapping (address => uint[]) outboxes;
    mapping (address => uint) balances;
    
    Message[] public messages;
    
    function sendMessage (address _to, string content) public payable {
        Message memory message = Message(
            messages.length,
            content, 
            msg.sender, 
            _to, 
            now, 
            msg.value,
            false,
            0,
            false,
            0
        );
        uint msgId = messages.push(message) - 1;
        inboxes[_to].push(msgId);
        outboxes[msg.sender].push(msgId);
    }
    
    function sendReply (uint _messageId, string content) public payable {
        require(_messageId < messages.length);
        Message storage original = messages[_messageId];
        require(original.to == msg.sender);
        require(!original.hasReply);
        address recipient = original.from;
        Message memory reply = Message(
            messages.length,
            content, 
            msg.sender, 
            recipient, 
            now, 
            msg.value,
            true,
            _messageId,
            false,
            0
        );
        uint replyId = messages.push(reply) - 1;
        inboxes[recipient].push(replyId);
        outboxes[msg.sender].push(replyId);
        original.hasReply = true;
        original.replyId = replyId;
        balances[msg.sender] = balances[msg.sender].add(original.bounty);
    }
    
    function withdrawBounties () public {
        uint toWithdraw = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(toWithdraw);
    }
    
    function getInboxIds () public view returns (uint[]) {
        return inboxes[msg.sender];
    }
    
    function getOutboxIds () public view returns (uint[]) {
        return outboxes[msg.sender];
    }
    
    function getBalance () public view returns (uint) { 
        return balances[msg.sender];
    }
}