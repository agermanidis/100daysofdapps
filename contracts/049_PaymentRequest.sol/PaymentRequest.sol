pragma solidity ^0.4.18;

contract PaymentRequest {
    struct Request {
        address requester;
        address requestee;
        uint amount;
        string message;
        bool fulfilled;
    }
    
    Request[] public requests;
    mapping (address => uint) public balances;
    
    function request(address fromAddress, uint amount, string message) public {
        Request memory req = Request({
            requestee: fromAddress,
            requester: msg.sender, 
            amount: amount,
            message: message,
            fulfilled: false
        });
        requests.push(req);
    }
    
    function getIncomingRequest (uint idx) public view returns (uint, address, uint, string) {
        uint count = 0;
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].requestee == msg.sender && !requests[i].fulfilled) {
                if (count == idx) {
                    Request storage req = requests[i];
                    return (i, req.requester, req.amount, req.message);
                }
                count += 1;
            }

        }
    }
    
    function numberOfIncomingRequests () public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].requestee == msg.sender && !requests[i].fulfilled) {
                count += 1;
            }
        }
        return count;
    }

    function getOutgoingRequest (uint idx) public view returns (uint, address, uint, string) {
        uint count = 0;
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].requester == msg.sender && !requests[i].fulfilled) {
                if (count == idx) {
                    Request storage req = requests[i];
                    return (i, req.requestee, req.amount, req.message);
                }
                count += 1;
            }

        }
    }
    
    function numberOfOutgoingRequests () public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].requester == msg.sender && !requests[i].fulfilled) {
                count += 1;
            }
        }
        return count;
    }
    
    function fulfill (uint requestId) public payable {
        Request storage req = requests[requestId];
        require(req.requestee == msg.sender);
        require(msg.value == req.amount);
        req.fulfilled = true;
        balances[req.requestee] += msg.value;
    }
    
    function withdraw () public {
        uint toWithdraw = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(toWithdraw);
    }
}