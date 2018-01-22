export default [
	{
		"constant": true,
		"inputs": [],
		"name": "numberOfRiddles",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
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
				"name": "riddle",
				"type": "string"
			},
			{
				"name": "sealedAnswer",
				"type": "bytes32"
			}
		],
		"name": "addRiddle",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "riddleId",
				"type": "uint256"
			},
			{
				"name": "answer",
				"type": "string"
			}
		],
		"name": "answerRiddle",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "riddles",
		"outputs": [
			{
				"name": "submitter",
				"type": "address"
			},
			{
				"name": "riddle",
				"type": "string"
			},
			{
				"name": "sealedAnswer",
				"type": "bytes32"
			},
			{
				"name": "unsealedAnswer",
				"type": "string"
			},
			{
				"name": "prize",
				"type": "uint256"
			},
			{
				"name": "winner",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];