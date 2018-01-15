pragma solidity ^0.4.16;

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

contract Autocracy  {
    using SafeMath for uint;
    
    uint256 constant private MAX_UINT256 = 2**256 - 1;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    string public name;               
    uint8 public decimals = 18;
    string public symbol;
    uint public _totalSupply;

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        uint256 allowance = allowed[_from][msg.sender];
        require(balances[_from] >= _value && allowance >= _value);
        balances[_to] += _value;
        balances[_from] -= _value;
        if (allowance < MAX_UINT256) {
            allowed[_from][msg.sender] -= _value;
        }
        Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
    
    event Transfer(address indexed _from, address indexed _to, uint256 _value); 
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    modifier onlyAutocrat() {
        require(msg.sender == autocrat);
        _;
    }

    modifier onlyCitizen() {
        require(isCitizen[msg.sender]);
        _;
    }
    
    struct CitizenshipApplication {
        address applicant;
        string applicationHash;
    }
    address[] public citizens;
    mapping (address => bool) public isCitizen;
    
    struct Job {
        string descriptionHash;
        uint salary;
        uint lastPayment;
        address employee;
    }
    Job[] public jobs;
    mapping (address => uint) employeeToJob;
    
    address public autocrat;
    string public flagHash;

    function Autocracy (
        address _autocrat,
        string _name,
        string _symbol,
        string _flagHash,
        uint _initialAmount) public {
            
        name = _name;
        symbol = _symbol;
        flagHash = _flagHash;
        _totalSupply = _initialAmount;
        autocrat = _autocrat;
        balances[autocrat] = _totalSupply;
        citizens.push(autocrat);
        isCitizen[autocrat] = true;
        jobs.push(Job("", 0, 0, 0)); // create empty job
    }
    
    function addCitizen (address _addr) public onlyAutocrat {
        citizens.push(_addr);
        isCitizen[_addr] = true;
    }
    
    function createJob (string _jobDescription, uint _salary) public onlyAutocrat {
        jobs.push(Job(_jobDescription, _salary, now, address(0)));
    }
    
    function getJob (uint _jobId) public onlyCitizen {
        require(_jobId != 0);
        require(jobs[_jobId].employee == address(0));
        require(employeeToJob[msg.sender] == 0);
        jobs[_jobId].employee = msg.sender;
    }
    
    function quitJob () public onlyCitizen {
        uint currentJobId = employeeToJob[msg.sender];
        jobs[currentJobId].employee = address(0);
        employeeToJob[msg.sender] = 0;
    }
    
    function changeRuler (address _newAutocrat) public onlyAutocrat {
        autocrat = _newAutocrat;
    }
    
    function mintCoins (uint _amount) public onlyAutocrat {
        _totalSupply = _totalSupply.add(_amount);
        balances[autocrat] = balances[autocrat].add(_amount);
    }
    
    function collectTaxesFrom (address addr, uint taxationRatePct) private {
        uint tax = balances[addr].mul(taxationRatePct).div(100);
        balances[addr] = balances[addr].sub(tax);
        balances[autocrat] = balances[autocrat].add(tax);
    }
    
    function collectTaxesFromEveryone (uint taxationRatePct) onlyAutocrat public {
        require(msg.sender == autocrat);
        for (uint i = 0; i < citizens.length; i++) {
            if (citizens[i] == autocrat) continue;
            collectTaxesFrom(citizens[i], taxationRatePct);
        }
    }
    
    function numberOfCitizens () public view returns (uint) {
        return citizens.length;
    }
    
    function numberOfJobs () public view returns (uint) {
        return jobs.length - 1;
    }
    
    function totalSupply() public view returns (uint) {
        return _totalSupply;
    }
}

contract CountryFactory {
    mapping (address => address) public ownerToCountry;
    
    function createCountry (
        string _name,
        string _symbol,
        string _flagHash,
        uint _initialAmount) public {
            address country = new Autocracy(
                msg.sender, 
                _name, 
                _symbol, 
                _flagHash,
                _initialAmount
            );
            ownerToCountry[msg.sender] = country;
    }
}