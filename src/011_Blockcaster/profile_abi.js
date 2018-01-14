export default [
  {
    constant: false,
    inputs: [
      {
        name: "_nickname",
        type: "string"
      }
    ],
    name: "setNickname",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_url",
        type: "string"
      }
    ],
    name: "setPicture",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_nickname",
        type: "string"
      },
      {
        name: "_url",
        type: "string"
      }
    ],
    name: "setInfo",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_addr",
        type: "address"
      }
    ],
    name: "getInfo",
    outputs: [
      {
        name: "",
        type: "string"
      },
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];