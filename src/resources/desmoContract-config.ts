export const contractAddress = "0x833B43976bdB19C60525F214AC707b044e17cAA2";

export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "desmoHubAddress",
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
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "_calldata",
        "type": "bytes"
      }
    ],
    "name": "QueryResult",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "desmoHub",
    "outputs": [
      {
        "internalType": "contract DesmoLDHub",
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
        "name": "_oracleId",
        "type": "bytes32"
      }
    ],
    "name": "getRaw",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "bytesValue",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_calldata",
        "type": "bytes"
      }
    ],
    "name": "receiveResult",
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
      }
    ],
    "name": "viewScores",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
