export default [
	{
		"constant": true,
		"inputs": [
			{
				"name": "proposalId",
				"type": "string"
			},
			{
				"name": "addr",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"name": "",
				"type": "bool"
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
				"name": "proposalId",
				"type": "string"
			}
		],
		"name": "getScores",
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
				"name": "proposalId",
				"type": "string"
			}
		],
		"name": "getProposal",
		"outputs": [
			{
				"name": "author",
				"type": "address"
			},
			{
				"name": "content",
				"type": "string"
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
				"name": "proposalId",
				"type": "string"
			},
			{
				"name": "contentHash",
				"type": "string"
			},
			{
				"name": "numberOfOptions",
				"type": "uint256"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "proposalId",
				"type": "string"
			},
			{
				"name": "optionId",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
];