export const contractAddress = '0xA739B8bb068B058d2eab49D1475d513Cf981db3B';

export const deploymentOutput = {
  compiler: {
    version: "0.8.7+commit.e28d00a7"
  },
  language: "Solidity",
  output: {
    abi: [
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "bytes",
            name: "requestID",
            type: "bytes"
          }
        ],
        name: "RequestID",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "key",
            type: "address"
          },
          {
            indexed: false,
            internalType: "string",
            name: "url",
            type: "string"
          },
          {
            indexed: false,
            internalType: "bool",
            name: "disabled",
            type: "bool"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "score",
            type: "uint256"
          }
        ],
        name: "TDDCreated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "key",
            type: "address"
          },
          {
            indexed: false,
            internalType: "string",
            name: "url",
            type: "string"
          }
        ],
        name: "TDDDisabled",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "key",
            type: "address"
          },
          {
            indexed: false,
            internalType: "string",
            name: "url",
            type: "string"
          }
        ],
        name: "TDDEnabled",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "key",
            type: "address"
          },
          {
            indexed: false,
            internalType: "string",
            name: "url",
            type: "string"
          },
          {
            indexed: false,
            internalType: "bool",
            name: "disabled",
            type: "bool"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "score",
            type: "uint256"
          }
        ],
        name: "TDDRetrieval",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes",
            name: "key",
            type: "bytes"
          },
          {
            indexed: false,
            internalType: "string[]",
            name: "TDDSubset",
            type: "string[]"
          }
        ],
        name: "TDDSubset",
        type: "event"
      },
      {
        inputs: [],
        name: "disableTDD",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "enableTDD",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "getNewRequestID",
        outputs: [
          {
            internalType: "bytes",
            name: "",
            type: "bytes"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "bytes",
            name: "requestID",
            type: "bytes"
          }
        ],
        name: "getScoresByRequestID",
        outputs: [
          {
            internalType: "bytes",
            name: "",
            type: "bytes"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "getTDD",
        outputs: [
          {
            components: [
              {
                internalType: "string",
                name: "url",
                type: "string"
              },
              {
                internalType: "address",
                name: "owner",
                type: "address"
              },
              {
                internalType: "bool",
                name: "disabled",
                type: "bool"
              },
              {
                internalType: "uint256",
                name: "score",
                type: "uint256"
              }
            ],
            internalType: "struct DesmoLDHub.TDD",
            name: "",
            type: "tuple"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "bytes",
            name: "requestID",
            type: "bytes"
          }
        ],
        name: "getTDDByRequestID",
        outputs: [
          {
            internalType: "string[]",
            name: "",
            type: "string[]"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "bytes",
            name: "requestID",
            type: "bytes"
          }
        ],
        name: "getTDDByRequestIDWithView",
        outputs: [
          {
            internalType: "string[]",
            name: "",
            type: "string[]"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "getTDDStoragerLenght",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            components: [
              {
                internalType: "string",
                name: "url",
                type: "string"
              },
              {
                internalType: "address",
                name: "owner",
                type: "address"
              },
              {
                internalType: "bool",
                name: "disabled",
                type: "bool"
              },
              {
                internalType: "uint256",
                name: "score",
                type: "uint256"
              }
            ],
            internalType: "struct DesmoLDHub.TDD",
            name: "tdd",
            type: "tuple"
          }
        ],
        name: "registerTDD",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "url",
            type: "string"
          }
        ],
        name: "registerTDDExplicitParam",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "bytes",
            name: "requestID",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "scores",
            type: "bytes"
          }
        ],
        name: "updateScores",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "bytes",
            name: "id",
            type: "bytes"
          }
        ],
        name: "viewSelected",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    devdoc: {
      kind: "dev",
      methods: {},
      version: 1
    },
    userdoc: {
      kind: "user",
      methods: {},
      version: 1
    }
  },
  settings: {
    compilationTarget: {
      "contracts/DesmoLDHub.sol": "DesmoLDHub"
},
evmVersion: "london",
    libraries: {},
metadata: {
  bytecodeHash: "ipfs"
},
optimizer: {
  enabled: false,
      runs: 200
},
remappings: []
},
  sources: {
    "contracts/DesmoLDHub.sol": {
      keccak256: "0x460cf92e8ea437c9f9039ec9e1a2ab5c117910b7a291a0bb28d210599db8c304",
          urls: [
        "bzz-raw://49fe035ecd21948c52da5a78e13e2c7c7018284719d213a1822e26bdbe8c482e",
        "dweb:/ipfs/Qmddi5M7ETEVGJuS15n5D3hC26tn1c2TyATRXKbKaQxZUj"
      ]
    },
    "hardhat/console.sol": {
      keccak256: "0x72b6a1d297cd3b033d7c2e4a7e7864934bb767db6453623f1c3082c6534547f4",
          license: "MIT",
          urls: [
        "bzz-raw://a8cb8681076e765c214e0d51cac989325f6b98e315eaae06ee0cbd5a9f084763",
        "dweb:/ipfs/QmNWGHi4zmjxQTYN3NMGnJd49jBT5dE4bxTdWEaDuJrC6N"
      ]
    }
  },
  version: 1
};
