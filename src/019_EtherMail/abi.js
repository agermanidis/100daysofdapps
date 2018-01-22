export default [
	{
		"constant": true,
		"inputs": [],
		"name": "getInboxIds",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
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
				"name": "",
				"type": "uint256"
			}
		],
		"name": "messages",
		"outputs": [
			{
				"name": "id",
				"type": "uint256"
			},
			{
				"name": "content",
				"type": "string"
			},
			{
				"name": "from",
				"type": "address"
			},
			{
				"name": "to",
				"type": "address"
			},
			{
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"name": "bounty",
				"type": "uint256"
			},
			{
				"name": "isReply",
				"type": "bool"
			},
			{
				"name": "replyTo",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getBalance",
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
		"inputs": [],
		"name": "withdrawBounties",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_messageId",
				"type": "uint256"
			},
			{
				"name": "content",
				"type": "string"
			}
		],
		"name": "sendReply",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getOutboxIds",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
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
				"name": "_to",
				"type": "address"
			},
			{
				"name": "content",
				"type": "string"
			}
		],
		"name": "sendMessage",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	}
];