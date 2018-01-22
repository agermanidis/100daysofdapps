export default [
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "reports",
    outputs: [
      {
        name: "author",
        type: "address"
      },
      {
        name: "contentHash",
        type: "string"
      },
      {
        name: "isPositive",
        type: "bool"
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
        name: "addr",
        type: "address"
      }
    ],
    name: "numberOfReports",
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
        name: "_addr",
        type: "address"
      },
      {
        name: "_contentHash",
        type: "string"
      },
      {
        name: "_isPositive",
        type: "bool"
      }
    ],
    name: "addReport",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];
