export default [
  {
    constant: true,
    inputs: [],
    name: "valueDestroyed",
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
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "",
        type: "address"
      },
      {
        indexed: false,
        name: "",
        type: "string"
      },
      {
        indexed: false,
        name: "",
        type: "uint256"
      }
    ],
    name: "BurnEvent",
    type: "event"
  },
  {
    constant: false,
    inputs: [
      {
        name: "reason",
        type: "string"
      }
    ],
    name: "burn",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  }
];