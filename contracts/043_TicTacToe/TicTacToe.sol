pragma solidity ^0.4.18;

library ECVerify {
    // Duplicate Solidity's ecrecover, but catching the CALL return value
    function safer_ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal returns (bool, address) {
        // We do our own memory management here. Solidity uses memory offset
        // 0x40 to store the current end of memory. We write past it (as
        // writes are memory extensions), but don't update the offset so
        // Solidity will reuse it. The memory used here is only needed for
        // this context.

        // FIXME: inline assembly can't access return values
        bool ret;
        address addr;

        assembly {
            let size := mload(0x40)
            mstore(size, hash)
            mstore(add(size, 32), v)
            mstore(add(size, 64), r)
            mstore(add(size, 96), s)

            // NOTE: we can reuse the request memory because we deal with
            //       the return code
            ret := call(3000, 1, 0, size, 128, size, 32)
            addr := mload(size)
        }

        return (ret, addr);
    }

    function ecrecovery(bytes32 hash, bytes sig) returns (bool, address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (sig.length != 65)
          return (false, 0);

        // The signature format is a compact form of:
        //   {bytes32 r}{bytes32 s}{uint8 v}
        // Compact means, uint8 is not padded to 32 bytes.
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))

            // Here we are loading the last 32 bytes. We exploit the fact that
            // 'mload' will pad with zeroes if we overread.
            // There is no 'mload8' to do this, but that would be nicer.
            v := byte(0, mload(add(sig, 96)))

            // Alternative solution:
            // 'byte' is not working due to the Solidity parser, so lets
            // use the second best option, 'and'
            // v := and(mload(add(sig, 65)), 255)
        }

        // albeit non-transactional signatures are not specified by the YP, one would expect it
        // to match the YP range of [27, 28]
        //
        // geth uses [0, 1] and some clients have followed. This might change, see:
        //  https://github.com/ethereum/go-ethereum/issues/2053
        if (v < 27)
          v += 27;

        if (v != 27 && v != 28)
            return (false, 0);

        return safer_ecrecover(hash, v, r, s);
    }

    function ecverify(bytes32 hash, bytes sig, address signer) returns (bool) {
        bool ret;
        address addr;
        (ret, addr) = ecrecovery(hash, sig);
        return ret == true && addr == signer;
    }
}

contract TicTacToe {
    address public winner;
    address[2] public players;
    
    function TicTacToe () public {
        players[0] = msg.sender;
    }
    
    function join() public {
        require(players[1] == 0x0);
        require(msg.sender != players[0]);
        players[1] = msg.sender;
    }
    
    function win (bytes32 state, bytes sig1, bytes sig2, uint winningMove) public {
        int8 possibleWinner;
        if (msg.sender == players[0]) possibleWinner = 0;
        else if (msg.sender == players[1]) possibleWinner = 1;
        else revert();
        require(ECVerify.ecverify(keccak256(state, address(this)), sig1, players[0]));
        require(ECVerify.ecverify(keccak256(state, address(this)), sig2, players[1]));
        uint lastPlayer = uint(state[9]);
        require (players[lastPlayer] != msg.sender); 
        int8[9] memory positions;
        for (uint i = 0; i < 9; i++) {
            positions[i] = int8(state[i]);
        }
        positions[winningMove] = possibleWinner;
        require(isWinningState(positions));
        winner = msg.sender;
    }
        
    function isWinningState (int8[9] positions) private pure returns (bool) {
        if (positions[0] != 0x0 && positions[0] == positions[1] && positions[1] == positions[2]) {
            return true;
        } else if (positions[3] != 0x0 && positions[3] == positions[4] && positions[4] == positions[5]) {
            return true;
        }  else if (positions[6] != 0x0 && positions[6] == positions[7] && positions[7] == positions[8]) {
            return true;
        } else if (positions[0] != 0x0 && positions[0] == positions[3] && positions[3] == positions[6]) {
            return true;
        } else if (positions[1] != 0x0 && positions[1] == positions[4] && positions[4] == positions[7]) {
            return true;
        } else if (positions[2] != 0x0 && positions[2] == positions[5] && positions[5] == positions[8]) {
            return true;
        } else if (positions[0] != 0x0 && positions[0] == positions[4] && positions[4] == positions[8]) {
            return true;
        } else if (positions[2] != 0x0 && positions[2] == positions[4] && positions[4] == positions[6]) {
            return true;
        }
    }
}