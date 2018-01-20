pragma solidity ^0.4.0;

contract PersonalAdvisor {
    enum TransactionState { Pending, Approved, Rejected, Canceled }
    
    struct Transaction {
        address sender;
        address recipient;
        uint value;
        string reason;
        TransactionState state;
    }
    
    address public advisor;
    
    Transaction[] public transactions;
    
    function PersonalAdvisor () public {
        advisor = msg.sender;
    }
    
    function request (address recipient, string reason) public payable {
        transactions.push(Transaction(
            msg.sender, 
            recipient, 
            msg.value, 
            reason, 
            TransactionState.Pending
        ));
    }
    
    function approve (uint transactionId) public {
        require(msg.sender == advisor);
        require(transactions[transactionId].state == TransactionState.Pending);
        Transaction storage t = transactions[transactionId];
        t.state = TransactionState.Approved;
        t.recipient.transfer(t.value);
    }
    
    function reject (uint transactionId) public {
        require(msg.sender == advisor);
        require(transactions[transactionId].state == TransactionState.Pending);
        Transaction storage t = transactions[transactionId];
        t.state = TransactionState.Rejected;
        t.sender.transfer(t.value);
    }
    
    function cancel (uint transactionId) public {
        Transaction storage t = transactions[transactionId];
        require(t.sender == msg.sender);
        require(transactions[transactionId].state == TransactionState.Pending);
        t.state = TransactionState.Rejected;
        t.sender.transfer(t.value);
    }
    
    function numberOfTransactions () public view returns (uint) {
        return transactions.length;
    }
}
