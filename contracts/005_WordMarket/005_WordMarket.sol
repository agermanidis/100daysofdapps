pragma solidity ^0.4.19;

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

contract ERC721 {
    // Function
    function totalSupply() public view returns (uint256 _totalSupply);
    function balanceOf(address _owner) public view returns (uint256 _balance);
    function ownerOf(uint _tokenId) public view returns (address _owner);
    function approve(address _to, uint _tokenId) public;
    function transferFrom(address _from, address _to, uint _tokenId) public;
    function transfer(address _to, uint _tokenId) public;
    function implementsERC721() public view returns (bool _implementsERC721);

    // Events
    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
}

contract DetailedERC721 is ERC721 {
    function name() public view returns (string _name);
    function symbol() public view returns (string _symbol);
    function tokenMetadata(uint _tokenId) public view returns (string _infoUrl);
    function tokenOfOwnerByIndex(address _owner, uint _index) public view returns (uint _tokenId);
}


contract NonFungibleToken is DetailedERC721 {
    string public name;
    string public symbol;

    uint public numTokensTotal;

    mapping(uint => address) internal tokenIdToOwner;
    mapping(uint => address) internal tokenIdToApprovedAddress;
    mapping(uint => string) internal tokenIdToMetadata;
    mapping(address => uint[]) internal ownerToTokensOwned;
    mapping(uint => uint) internal tokenIdToOwnerArrayIndex;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _tokenId
    );

    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 _tokenId
    );

    modifier onlyExtantToken(uint _tokenId) {
        require(ownerOf(_tokenId) != address(0));
        _;
    }

    function name()
        public
        view
        returns (string _name)
    {
        return name;
    }

    function symbol()
        public
        view
        returns (string _symbol)
    {
        return symbol;
    }

    function totalSupply()
        public
        view
        returns (uint256 _totalSupply)
    {
        return numTokensTotal;
    }

    function balanceOf(address _owner)
        public
        view
        returns (uint _balance)
    {
        return ownerToTokensOwned[_owner].length;
    }

    function ownerOf(uint _tokenId)
        public
        view
        returns (address _owner)
    {
        return _ownerOf(_tokenId);
    }

    function tokenMetadata(uint _tokenId)
        public
        view
        returns (string _infoUrl)
    {
        return tokenIdToMetadata[_tokenId];
    }

    function approve(address _to, uint _tokenId)
        public
        onlyExtantToken(_tokenId)
    {
        require(msg.sender == ownerOf(_tokenId));
        require(msg.sender != _to);

        if (_getApproved(_tokenId) != address(0) ||
                _to != address(0)) {
            _approve(_to, _tokenId);
            Approval(msg.sender, _to, _tokenId);
        }
    }

    function transferFrom(address _from, address _to, uint _tokenId)
        public
        onlyExtantToken(_tokenId)
    {
        require(getApproved(_tokenId) == msg.sender);
        require(ownerOf(_tokenId) == _from);
        require(_to != address(0));

        _clearApprovalAndTransfer(_from, _to, _tokenId);

        Approval(_from, 0, _tokenId);
        Transfer(_from, _to, _tokenId);
    }

    function transfer(address _to, uint _tokenId)
        public
        onlyExtantToken(_tokenId)
    {
        require(ownerOf(_tokenId) == msg.sender);
        require(_to != address(0));

        _clearApprovalAndTransfer(msg.sender, _to, _tokenId);

        Approval(msg.sender, 0, _tokenId);
        Transfer(msg.sender, _to, _tokenId);
    }

    function tokenOfOwnerByIndex(address _owner, uint _index)
        public
        view
        returns (uint _tokenId)
    {
        return _getOwnerTokenByIndex(_owner, _index);
    }

    function getOwnerTokens(address _owner)
        public
        view
        returns (uint[] _tokenIds)
    {
        return _getOwnerTokens(_owner);
    }

    function implementsERC721()
        public
        view
        returns (bool _implementsERC721)
    {
        return true;
    }

    function getApproved(uint _tokenId)
        public
        view
        returns (address _approved)
    {
        return _getApproved(_tokenId);
    }

    function _clearApprovalAndTransfer(address _from, address _to, uint _tokenId)
        internal
    {
        _clearTokenApproval(_tokenId);
        _removeTokenFromOwnersList(_from, _tokenId);
        _setTokenOwner(_tokenId, _to);
        _addTokenToOwnersList(_to, _tokenId);
    }

    function _ownerOf(uint _tokenId)
        internal
        view
        returns (address _owner)
    {
        return tokenIdToOwner[_tokenId];
    }

    function _approve(address _to, uint _tokenId)
        internal
    {
        tokenIdToApprovedAddress[_tokenId] = _to;
    }

    function _getApproved(uint _tokenId)
        internal
        view
        returns (address _approved)
    {
        return tokenIdToApprovedAddress[_tokenId];
    }

    function _getOwnerTokens(address _owner)
        internal
        view
        returns (uint[] _tokens)
    {
        return ownerToTokensOwned[_owner];
    }

    function _getOwnerTokenByIndex(address _owner, uint _index)
        internal
        view
        returns (uint _tokens)
    {
        return ownerToTokensOwned[_owner][_index];
    }

    function _clearTokenApproval(uint _tokenId)
        internal
    {
        tokenIdToApprovedAddress[_tokenId] = address(0);
    }

    function _setTokenOwner(uint _tokenId, address _owner)
        internal
    {
        tokenIdToOwner[_tokenId] = _owner;
    }

    function _addTokenToOwnersList(address _owner, uint _tokenId)
        internal
    {
        ownerToTokensOwned[_owner].push(_tokenId);
        tokenIdToOwnerArrayIndex[_tokenId] =
            ownerToTokensOwned[_owner].length - 1;
    }

    function _removeTokenFromOwnersList(address _owner, uint _tokenId)
        internal
    {
        uint length = ownerToTokensOwned[_owner].length;
        uint index = tokenIdToOwnerArrayIndex[_tokenId];
        uint swapToken = ownerToTokensOwned[_owner][length - 1];

        ownerToTokensOwned[_owner][index] = swapToken;
        tokenIdToOwnerArrayIndex[swapToken] = index;

        delete ownerToTokensOwned[_owner][length - 1];
        ownerToTokensOwned[_owner].length--;
    }

    function _insertTokenMetadata(uint _tokenId, string _metadata)
        internal
    {
        tokenIdToMetadata[_tokenId] = _metadata;
    }
}

contract WordToken is NonFungibleToken {
    using SafeMath for uint;
    
    string public name = "WordToken";
    string public symbol = "WT";
    
    uint public numTokensTotal = 0;
    
    mapping (uint => uint) public salePrice;
    mapping (uint => bool) public isForSale;
    mapping (uint => string) public idToString;
    
    uint[] public tokens;
    
    function validateWord (string s) public pure returns (bool) {
        bytes memory h = bytes(s);
        for (uint i = 0; i < h.length; i++) {
            if (h[i] < 65 || h[i] > 122) return false;
        }
        return true;
    }

    function stringToId (string s) public pure returns (uint) {
        return uint(keccak256(s));
    }
    
    function getStringById (uint _tokenId) public view returns (string) {
        return idToString[_tokenId];
    }
    
    function tokenExists (string s) public view returns (bool) {
       return ownerOf(stringToId(s)) != address(0);
    }
    
    function createToken (string s) public {
        require(validateWord(s)); // no space allowed
        uint _tokenId = stringToId(s);
        require(tokenIdToOwner[_tokenId] == address(0));
        _setTokenOwner(_tokenId, msg.sender);
        _addTokenToOwnersList(msg.sender, _tokenId);
        numTokensTotal = numTokensTotal.add(1);
        idToString[_tokenId] = s;
        tokens.push(_tokenId);
    }
    
    function setSalePrice (string s, uint price) public {
        uint _tokenId = stringToId(s);
        require(ownerOf(_tokenId) == msg.sender);
        salePrice[_tokenId] = price;
        isForSale[_tokenId] = true;
    }
    
    function endSale (string s) public {
        uint _tokenId = stringToId(s);
        require(ownerOf(_tokenId) == msg.sender);
        isForSale[_tokenId] = false;
    }
    
    function buyToken (string s) public payable {
        uint _tokenId = stringToId(s);
        require(ownerOf(_tokenId) != msg.sender);
        require(isForSale[_tokenId]);
        require(msg.value >= salePrice[_tokenId]);
        _removeTokenFromOwnersList(ownerOf(_tokenId), _tokenId);
        _setTokenOwner(_tokenId, msg.sender);
        _addTokenToOwnersList(msg.sender, _tokenId);
    }
    
    function isTokenForSale (string s) public view returns (bool) {
        uint _tokenId = stringToId(s);
        return isForSale[_tokenId];
    }
    
    function getBalance () public view returns (uint) {
        return balanceOf(msg.sender);
    }
    
    function getTokenByIndex (uint index) public view returns (uint, string) {
        return (tokens[index], idToString[tokens[index]]);
    }
    
    function () public payable {
    }
}