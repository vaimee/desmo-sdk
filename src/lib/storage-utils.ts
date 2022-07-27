import { ethers } from 'ethers';
// https://medium.com/@dariusdev/how-to-read-ethereum-contract-storage-44252c8af925
// https://betterprogramming.pub/solidity-storage-variables-with-ethers-js-ca3c7e2c2a64
// https://github.com/vaimee/desmo-contracts/blob/main/contracts/DesmoLdHub.sol

export enum EthereumDatatypes {
  boolean = 0,
  number = 1,
  string = 2,
  hex = 3,
}

// A future version of this library shall handle this recursive definition (that supports structs inside structs):
// export type EthereumStruct = (EthereumDatatypes | EthereumStruct)[];
export type EthereumStruct = EthereumDatatypes[];

// eslint-disable-next-line @typescript-eslint/ban-types
const fnMapping: Function[] = [
  getBooleanVariable,
  getNumberVariable,
  getStringVariable,
  getHexVariable,
];

export async function getBooleanVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number | string
): Promise<boolean> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex
  );
  return !ethers.BigNumber.from(value).isZero();
}

export async function getNumberVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number | string
): Promise<number> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex
  );

  // Warning: this could throw an exception in case of very large numbers!
  return ethers.BigNumber.from(value).toNumber();
}

export async function getStringVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number | string
): Promise<string> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex
  );

  return ethers.utils.parseBytes32String(value);
}

export async function getHexVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number | string
): Promise<string> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex
  );

  return value;
}

export async function getArray(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number,
  datatype: EthereumDatatypes | EthereumStruct = EthereumDatatypes.boolean
): Promise<any[]> {
  let value: any[] = [];
  if (Array.isArray(datatype)) {
  } else {
    const arrayAddress = _fromNumberTo32BytesAddress(symbolIndex);

    const arrayLength: number = await getNumberVariable(
      provider,
      contractAddress,
      arrayAddress
    );
    const rootIndex: string = ethers.utils.keccak256(arrayAddress);
    const elementAddresses = _getArrayElementAddresses(rootIndex, arrayLength);

    value = await Promise.all(
      elementAddresses.map((address) =>
        fnMapping[datatype](provider, contractAddress, address)
      )
    );
  }
  return value;
}

export async function getMappings(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number,
  datatype: EthereumDatatypes | EthereumStruct = EthereumDatatypes.boolean,
  keys: string[] = []
): Promise<any[]> {
  if (keys.length <= 0) {
    return [];
  }

  let value: any[] = [];
  const mappingAddress = _fromNumberTo32BytesAddress(symbolIndex);
  const keyIndexes: string[] = keys.map((k) =>
    _getMappingValueAddressByKey(mappingAddress, k)
  );

  if (Array.isArray(datatype)) {
    value = await Promise.all(
      keyIndexes.map(async (index) => {
        const subAddresses = _getArrayElementAddresses(index, datatype.length);
        return Promise.all(
          subAddresses.map((address, i) =>
            fnMapping[datatype[i]](provider, contractAddress, address)
          )
        );
      })
    );
  } else {
    value = await Promise.all(
      keyIndexes.map((address) =>
        fnMapping[datatype](provider, contractAddress, address)
      )
    );
  }
  return keyIndexes.concat(value);
}

function _getArrayElementAddresses(
  rootIndex: string,
  arrayLength = 0
): string[] {
  const addresses: string[] = [];
  const rootIndexBigNumber = ethers.BigNumber.from(rootIndex);
  for (let i = 0; i < arrayLength; ++i) {
    const currentAddress = rootIndexBigNumber.add(i).toHexString();
    addresses.push(currentAddress);
  }
  return addresses;
}

function _fromNumberTo32BytesAddress(n: number): string {
  return _fitInto32BytesHexString(ethers.BigNumber.from(n).toHexString());
}

function _getMappingValueAddressByKey(
  mappingAddress: string,
  key: string
): string {
  console.log(key);
  console.log(mappingAddress);
  return ethers.utils.keccak256(ethers.utils.concat([key, mappingAddress]));
}

function _fitInto32BytesHexString(address: string): string {
  const bytesLength = ethers.utils.hexDataLength(address);
  if (bytesLength < 32) {
    address = ethers.utils.hexZeroPad(address, 32);
  } else if (bytesLength > 32) {
    throw new Error(
      `Address too large to fit in a 32 bytes hex representation: ${address} occupies ${bytesLength} bytes (max. 32 bytes).`
    );
  }
  return address;
}
