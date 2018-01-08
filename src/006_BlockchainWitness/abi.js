export default [
  {
    constant: false,
    inputs: [
      {
        name: "hash",
        type: "bytes32"
      }
    ],
    name: "verify",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "hash",
        type: "bytes32"
      }
    ],
    name: "getInfo",
    outputs: [
      {
        name: "",
        type: "address"
      },
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
        name: "",
        type: "uint256"
      }
    ],
    name: "items",
    outputs: [
      {
        name: "hash",
        type: "bytes32"
      },
      {
        name: "owner",
        type: "address"
      },
      {
        name: "timestamp",
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
        name: "hash",
        type: "bytes32"
      }
    ],
    name: "isVerified",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];
