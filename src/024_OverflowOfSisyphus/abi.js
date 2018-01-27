export default [
  {
    constant: true,
    inputs: [],
    name: "rockPosition",
    outputs: [
      {
        name: "",
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
        name: "pushAmount",
        type: "uint8"
      }
    ],
    name: "pushRock",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];