export default [
  {
    constant: true,
    inputs: [],
    name: "numberOfProposals",
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
        name: "_proposalId",
        type: "uint256"
      }
    ],
    name: "getProposal",
    outputs: [
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
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
    name: "currentColor",
    outputs: [
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
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
    constant: false,
    inputs: [
      {
        name: "_r",
        type: "uint256"
      },
      {
        name: "_g",
        type: "uint256"
      },
      {
        name: "_b",
        type: "uint256"
      }
    ],
    name: "propose",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_proposalId",
        type: "uint256"
      },
      {
        name: "_supportsProposal",
        type: "bool"
      }
    ],
    name: "vote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];