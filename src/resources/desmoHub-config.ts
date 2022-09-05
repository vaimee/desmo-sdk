export const contractAddress = '0x10fFd14a2dd48Cc0d9eB00e5d2c0957aCB97F3Cd';

export const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "requestID",
        "type": "bytes"
      }
    ],
    "name": "RequestID",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "key",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "url",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "disabled",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      }
    ],
    "name": "TDDCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "key",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "url",
        "type": "string"
      }
    ],
    "name": "TDDDisabled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "key",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "url",
        "type": "string"
      }
    ],
    "name": "TDDEnabled",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "disableTDD",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "enableTDD",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNewRequestID",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "requestID",
        "type": "bytes"
      }
    ],
    "name": "getScoresByRequestID",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTDD",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "disabled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          }
        ],
        "internalType": "struct DesmoHub.TDD",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getTDDByIndex",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "disabled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          }
        ],
        "internalType": "struct DesmoHub.TDD",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "requestID",
        "type": "bytes"
      }
    ],
    "name": "getTDDByRequestID",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTDDStorageLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "url",
        "type": "string"
      }
    ],
    "name": "registerTDD",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "requestID",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "scores",
        "type": "bytes"
      }
    ],
    "name": "updateScores",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]