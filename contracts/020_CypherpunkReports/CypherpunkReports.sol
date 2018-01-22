pragma solidity ^0.4.16;

contract CypherpunkReports {
    struct Report {
        address author;
        string contentHash;
        bool isPositive;
        uint timestamp;
    }
    
    mapping (address => Report[]) public reports;
    
    function numberOfReports (address addr) public view returns (uint) {
        return reports[addr].length;
    }
    
    function addReport (address _addr, string _contentHash, bool _isPositive) public {
        reports[_addr].push(Report(msg.sender, _contentHash, _isPositive, now));
    }
}