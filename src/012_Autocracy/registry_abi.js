export default [
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "ownerToCountry",
    outputs: [
      {
        name: "",
        type: "address"
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
        name: "_name",
        type: "string"
      },
      {
        name: "_symbol",
        type: "string"
      },
      {
        name: "_flagHash",
        type: "string"
      },
      {
        name: "_initialAmount",
        type: "uint256"
      }
    ],
    name: "createCountry",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];