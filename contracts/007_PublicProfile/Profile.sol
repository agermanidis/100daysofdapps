pragma solidity ^0.4.0;

contract Profile {
    event NicknameChanged(address, string);
    event PictureChanged(address, string);

    mapping (address => string) nicknames;
    mapping (address => string) pictures;
    
    function setNickname (string _nickname) public {
        nicknames[msg.sender] = _nickname;
        NicknameChanged(msg.sender, _nickname);
    }
    
    function setPicture (string _url) public {
        pictures[msg.sender] = _url;
        PictureChanged(msg.sender, _url);
    }
    
    function setInfo (string _nickname, string _url) public {
        setNickname(_nickname);
        setPicture(_url);
    }
    
    function getInfo (address _addr) public view returns (string, string) {
        return (nicknames[_addr], pictures[_addr]);
    }
}