export default [
	{
		"constant": true,
		"inputs": [],
		"name": "numberOfGoals",
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
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "goals",
		"outputs": [
			{
				"name": "content",
				"type": "string"
			},
			{
				"name": "setter",
				"type": "address"
			},
			{
				"name": "verifier",
				"type": "address"
			},
			{
				"name": "bounty",
				"type": "uint256"
			},
			{
				"name": "verified",
				"type": "bool"
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
				"name": "verifier",
				"type": "address"
			},
			{
				"name": "content",
				"type": "string"
			}
		],
		"name": "setGoal",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "goalId",
				"type": "uint256"
			}
		],
		"name": "verifyGoal",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
];