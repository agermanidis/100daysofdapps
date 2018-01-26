export default [
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "todos",
    outputs: [
      {
        name: "author",
        type: "address"
      },
      {
        name: "description",
        type: "string"
      },
      {
        name: "bounty",
        type: "uint256"
      },
      {
        name: "assignee",
        type: "address"
      },
      {
        name: "completed",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "numberOfTodos",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "todoId",
        type: "uint256"
      }
    ],
    name: "numberOfComments",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "todoId",
        type: "uint256"
      },
      {
        name: "assignee",
        type: "address"
      }
    ],
    name: "assign",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "todoId",
        type: "uint256"
      },
      {
        name: "description",
        type: "string"
      }
    ],
    name: "createComment",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "description",
        type: "string"
      }
    ],
    name: "createTodo",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "todoId",
        type: "uint256"
      }
    ],
    name: "markComplete",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];