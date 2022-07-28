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
  symbolIndex: number | string,
): Promise<boolean> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex,
  );
  return !ethers.BigNumber.from(value).isZero();
}

export async function getNumberVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number | string,
): Promise<number> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex,
  );

  // Warning: this could throw an exception in case of very large numbers!
  return ethers.BigNumber.from(value).toNumber();
}

export async function getStringVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number | string,
): Promise<string> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex,
  );

  try {
    return ethers.utils.parseBytes32String(value);
  } catch (err) {
    return await getLongStr(provider, contractAddress, symbolIndex.toString());
  }
}

export async function getHexVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number | string,
): Promise<string> {
  const value: string = await provider.getStorageAt(
    contractAddress,
    symbolIndex,
  );
  return value;
}

export async function getArray(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number,
  datatype: EthereumDatatypes | EthereumStruct = EthereumDatatypes.boolean,
): Promise<any[]> {
  let value: any[] = [];
  if (Array.isArray(datatype)) {
  } else {
    const arrayAddress = _fromNumberTo32BytesAddress(symbolIndex);

    const arrayLength: number = await getNumberVariable(
      provider,
      contractAddress,
      arrayAddress,
    );
    const rootIndex: string = ethers.utils.keccak256(arrayAddress);
    const elementAddresses = _getArrayElementAddresses(rootIndex, arrayLength);

    value = await Promise.all(
      elementAddresses.map((address) =>
        fnMapping[datatype](provider, contractAddress, address),
      ),
    );
  }
  return value;
}

export async function getMappings(
  provider: ethers.providers.Provider,
  contractAddress: string,
  symbolIndex: number,
  datatype: EthereumDatatypes | EthereumStruct = EthereumDatatypes.boolean,
  keys: string[] = [],
): Promise<any[]> {
  if (keys.length <= 0) {
    return [];
  }

  let value: any[] = [];
  const mappingAddress = _fromNumberTo32BytesAddress(symbolIndex);
  const keyIndexes: string[] = keys.map((k) =>
    _getMappingValueAddressByKey(mappingAddress, k),
  );

  if (Array.isArray(datatype)) {
    //   "t_struct(TDD)11_storage": {
    //     "encoding": "inplace",
    //     "label": "struct DesmoLDHub.TDD",
    //     "members": [
    //         {
    //             "astId": 4,
    //             "contract": "contracts/1_Storage.sol:DesmoLDHub",
    //             "label": "url",
    //             "offset": 0,
    //             "slot": "0",
    //             "type": "t_string_storage"
    //         },
    //         {
    //             "astId": 6,
    //             "contract": "contracts/1_Storage.sol:DesmoLDHub",
    //             "label": "owner",
    //             "offset": 0,
    //             "slot": "1",
    //             "type": "t_address"
    //         },
    //         {
    //             "astId": 8,
    //             "contract": "contracts/1_Storage.sol:DesmoLDHub",
    //             "label": "disabled",
    //             "offset": 20,
    //             "slot": "1",
    //             "type": "t_bool"
    //         },
    //         {
    //             "astId": 10,
    //             "contract": "contracts/1_Storage.sol:DesmoLDHub",
    //             "label": "score",
    //             "offset": 0,
    //             "slot": "2",
    //             "type": "t_uint256"
    //         }
    //     ],
    //     "numberOfBytes": "96"
    // },
    for (const index of keyIndexes) {
      const tddUrl = await getStringVariable(provider, contractAddress, index);
      const rootIndexBigNumber = ethers.BigNumber.from(index);
      const byte32value = await provider.getStorageAt(
        contractAddress,
        rootIndexBigNumber.add(1).toHexString(),
      );
      const address = ethers.BigNumber.from(byte32value)
        .mask(20 * 8)
        .toHexString();
      const enabled = ethers.BigNumber.from(byte32value)
        .and(ethers.BigNumber.from('0xFF').shl(20 * 8))
        .shr(20 * 8)
        .isZero();
      const score = ethers.BigNumber.from(
        await provider.getStorageAt(
          contractAddress,
          rootIndexBigNumber.add(2).toHexString(),
        ),
      ).toNumber();
      value.push({
        url: tddUrl,
        owner: address,
        disabled: !enabled,
        score: score,
      });
    }
    // value = await Promise.all(
    //   keyIndexes.map(async (index) => {
    //     const subAddresses = _getArrayElementAddresses(index, datatype.length);
    //     return Promise.all(
    //       subAddresses.map((address, i) =>
    //         fnMapping[datatype[i]](provider, contractAddress, address),
    //       ),
    //     );
    //   }),
    // );
  } else {
    value = await Promise.all(
      keyIndexes.map((address) =>
        fnMapping[datatype](provider, contractAddress, address),
      ),
    );
  }
  return keyIndexes.concat(value);
}

function _getArrayElementAddresses(
  rootIndex: string,
  arrayLength = 0,
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
  key: string,
): string {
  return ethers.utils.keccak256(ethers.utils.concat([key, mappingAddress]));
}

function _fitInto32BytesHexString(address: string): string {
  const bytesLength = ethers.utils.hexDataLength(address);
  if (bytesLength < 32) {
    address = ethers.utils.hexZeroPad(address, 32);
  } else if (bytesLength > 32) {
    throw new Error(
      `Address too large to fit in a 32 bytes hex representation: ${address} occupies ${bytesLength} bytes (max. 32 bytes).`,
    );
  }
  return address;
}

async function getLongStr(
  provider: ethers.providers.Provider,
  contractAddress: string,
  slot: string,
) {
  const paddedSlot = ethers.utils.hexZeroPad(slot, 32);
  const storageReference = await provider.getStorageAt(
    contractAddress,
    paddedSlot,
  );

  const baseSlot = ethers.utils.keccak256(paddedSlot);
  const sLength = ethers.BigNumber.from(storageReference).shr(1).toNumber();
  const totalSlots = Math.ceil(sLength / 32);

  let storageLocation = ethers.BigNumber.from(baseSlot).toHexString();
  let str = '';

  for (let i = 1; i <= totalSlots; i++) {
    const stringDataPerSlot = await provider.getStorageAt(
      contractAddress,
      storageLocation,
    );
    str = str.concat(ethers.utils.toUtf8String(stringDataPerSlot));
    storageLocation = ethers.BigNumber.from(baseSlot).add(i).toHexString();
  }
  
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00]/g, "");
}
