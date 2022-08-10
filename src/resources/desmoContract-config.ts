export const contractAddress = "0x579afd382E18c9BB5fDDD26f99Dd5aE093Ca5ff9";

export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "desmoHubAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "iexecproxy",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "requestID",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "taskID",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "result",
            "type": "bytes"
          }
        ],
        "indexed": false,
        "internalType": "struct Desmo.QueryResult",
        "name": "result",
        "type": "tuple"
      }
    ],
    "name": "QueryCompleted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "taskID",
        "type": "bytes32"
      }
    ],
    "name": "getQueryResult",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "requestID",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "taskID",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "result",
            "type": "bytes"
          }
        ],
        "internalType": "struct Desmo.QueryResult",
        "name": "result",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestID",
        "type": "bytes32"
      }
    ],
    "name": "getQueryResultByRequestID",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "requestID",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "taskID",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "result",
            "type": "bytes"
          }
        ],
        "internalType": "struct Desmo.QueryResult",
        "name": "result",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "iexecproxy",
    "outputs": [
      {
        "internalType": "contract IexecInterfaceToken",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "m_authorizedApp",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "m_authorizedDataset",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "m_authorizedWorkerpool",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "m_requiredtag",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "m_requiredtrust",
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
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "taskID",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "receiveResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "authorizedApp",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "authorizedDataset",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "authorizedWorkerpool",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "requiredtag",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "requiredtrust",
        "type": "uint256"
      }
    ],
    "name": "updateEnv",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
