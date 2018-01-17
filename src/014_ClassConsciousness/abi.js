export default [
  {
    constant: true,
    inputs: [],
    name: "numberOfBroadcasts",
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
        name: "b",
        type: "uint256"
      }
    ],
    name: "getClass",
    outputs: [
      {
        name: "",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "pure",
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
    name: "broadcasts",
    outputs: [
      {
        name: "author",
        type: "address"
      },
      {
        name: "timestamp",
        type: "uint256"
      },
      {
        name: "content",
        type: "string"
      },
      {
        name: "class",
        type: "uint8"
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
        name: "content",
        type: "string"
      }
    ],
    name: "broadcast",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];