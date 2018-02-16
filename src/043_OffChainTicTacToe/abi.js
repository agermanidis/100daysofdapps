export default [
	{
		"constant": false,
		"inputs": [
			{
				"name": "gameId",
				"type": "string"
			},
			{
				"name": "state",
				"type": "bytes32"
			},
			{
				"name": "sig1",
				"type": "bytes"
			},
			{
				"name": "sig2",
				"type": "bytes"
			},
			{
				"name": "winningMove",
				"type": "uint256"
			}
		],
		"name": "win",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "hash",
				"type": "bytes32"
			},
			{
				"name": "sig",
				"type": "bytes"
			},
			{
				"name": "signer",
				"type": "address"
			}
		],
		"name": "ecverify",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "gameId",
				"type": "string"
			}
		],
		"name": "newGame",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "gameId",
				"type": "string"
			}
		],
		"name": "getPlayer1",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "gameId",
				"type": "string"
			}
		],
		"name": "getPlayer2",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "gameId",
				"type": "string"
			}
		],
		"name": "getWinner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "gameId",
				"type": "string"
			}
		],
		"name": "join",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "hash",
				"type": "bytes32"
			},
			{
				"name": "sig",
				"type": "bytes"
			}
		],
		"name": "ecrecovery",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			},
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
];