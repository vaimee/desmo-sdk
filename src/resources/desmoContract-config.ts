export const contractAddress = "0x7F1402C8b7220d4439335aCe702472cc65e7dDf1";

export const deploymentOutput = {
  compiler: {
    version: '0.8.7+commit.e28d00a7',
  },
  language: 'Solidity',
  output: {
    abi: [
      {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'key',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
        ],
        name: 'TDDCreated',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'key',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
        ],
        name: 'TDDDisabled',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'key',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
        ],
        name: 'TDDEnabled',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'key',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            indexed: false,
            internalType: 'bool',
            name: 'disabled',
            type: 'bool',
          },
        ],
        name: 'TDDRetrieval',
        type: 'event',
      },
      {
        inputs: [],
        name: 'disableTDD',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'enableTDD',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'getNewRequestID',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'getTDD',
        outputs: [
          {
            components: [
              {
                internalType: 'string',
                name: 'url',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'owner',
                type: 'address',
              },
              {
                internalType: 'bool',
                name: 'disabled',
                type: 'bool',
              },
            ],
            internalType: 'struct DesmoLDHub.TDD',
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'key',
            type: 'uint256',
          },
        ],
        name: 'getTDDByRequestID',
        outputs: [
          {
            internalType: 'string[]',
            name: '',
            type: 'string[]',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            components: [
              {
                internalType: 'string',
                name: 'url',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'owner',
                type: 'address',
              },
              {
                internalType: 'bool',
                name: 'disabled',
                type: 'bool',
              },
            ],
            internalType: 'struct DesmoLDHub.TDD',
            name: 'tdd',
            type: 'tuple',
          },
        ],
        name: 'registerTDD',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
        ],
        name: 'viewSelected',
        outputs: [],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    devdoc: {
      kind: 'dev',
      methods: {},
      version: 1,
    },
    userdoc: {
      kind: 'user',
      methods: {},
      version: 1,
    },
  },
  settings: {
    compilationTarget: {
      'github/vaimee/desmo-contracts/contracts/DesmoLdHub.sol': 'DesmoLDHub',
    },
    evmVersion: 'london',
    libraries: {},
    metadata: {
      bytecodeHash: 'ipfs',
    },
    optimizer: {
      enabled: false,
      runs: 200,
    },
    remappings: [],
  },
  sources: {
    'github/vaimee/desmo-contracts/contracts/DesmoLdHub.sol': {
      keccak256:
        '0xcfcf6d06f33d3c5d849515c6bc77ae3d8d22981a6b7df5adefa3daa9fec5bcaa',
      urls: [
        'bzz-raw://3314124ac1b87fd8c28333aac1c1834b12cd4d600a5394643e3c3ddccda101db',
        'dweb:/ipfs/QmZCzotBtuSjGvgTULQdwS3wSmxPJLDmvZckxms79Sthet',
      ],
    },
    'hardhat/console.sol': {
      keccak256:
        '0x72b6a1d297cd3b033d7c2e4a7e7864934bb767db6453623f1c3082c6534547f4',
      license: 'MIT',
      urls: [
        'bzz-raw://a8cb8681076e765c214e0d51cac989325f6b98e315eaae06ee0cbd5a9f084763',
        'dweb:/ipfs/QmNWGHi4zmjxQTYN3NMGnJd49jBT5dE4bxTdWEaDuJrC6N',
      ],
    },
  },
  version: 1,
};
