export const contractAddress = '0x7E5A884Dc406e919b8D3450997E950e1148BF4B1';

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
        "internalType": "struct DesmoLDHub.TDD",
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