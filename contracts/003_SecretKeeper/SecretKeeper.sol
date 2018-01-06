pragma solidity ^0.4.19;

contract SecretKeeper {
    struct Secret {
        bytes32 hash;
        string secret;
        address keeper;
        uint time;
    }
    
    mapping (bytes32 => bool) hashExists;
    mapping (bytes32 => Secret) hashToSecret;
    bytes32[] hashes;

    function addSecret (bytes32 hash) public {
        require(hash != sha256("")); // secret cannot be empty string
        bytes32 userHash = sha256(msg.sender, hash); // double-hashing with user address
        require(!hashExists[userHash]);
        Secret memory secret = Secret(hash, "", msg.sender, now);
        hashExists[userHash] = true;
        hashToSecret[userHash] = secret;
        hashes.push(userHash);
    }
    
    function revealSecret (string unhashed) public {
        bytes32 h = sha256(msg.sender, sha256(unhashed));
        require(hashExists[h]);
        Secret storage secret = hashToSecret[h];
        secret.secret = unhashed;
    }
    
    function getSecretByIndex (uint index) public view returns (bytes32, string, address, uint) {
        require(index < hashes.length);
        Secret storage secret = hashToSecret[hashes[index]];
        return (secret.hash, secret.secret, secret.keeper, secret.time);
    }
    
    function numberOfSecrets () public view returns (uint) {
        return hashes.length;
    }
}