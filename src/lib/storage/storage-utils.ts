import { ethers } from 'ethers';
// https://medium.com/@dariusdev/how-to-read-ethereum-contract-storage-44252c8af925
// https://betterprogramming.pub/solidity-storage-variables-with-ethers-js-ca3c7e2c2a64
// https://github.com/vaimee/desmo-contracts/blob/main/contracts/DesmoLdHub.sol

export function verify32BytesAddress(address: string): string {
  const bytesLength: number = ethers.utils.hexDataLength(address);

  if (bytesLength < 32) {
    address = ethers.utils.hexZeroPad(address, 32);
  } else if (bytesLength > 32) {
    throw new Error(
      `Address too large to fit in a 32 bytes hex representation: ${address} occupies ${bytesLength} bytes (max. 32 bytes).`,
    );
  }
  return address;
}

export async function getBooleanVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  slotAddress: string,
): Promise<boolean> {
  const paddedSlotAddress: string = verify32BytesAddress(slotAddress);
  const value: string = await provider.getStorageAt(
    contractAddress,
    paddedSlotAddress,
  );
  return !ethers.BigNumber.from(value).isZero();
}

export async function getNumberVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  slotAddress: string,
): Promise<number> {
  const paddedSlotAddress: string = verify32BytesAddress(slotAddress);
  const value: string = await provider.getStorageAt(
    contractAddress,
    paddedSlotAddress,
  );
  // Warning: this could throw an exception in case of very large numbers!
  return ethers.BigNumber.from(value).toNumber();
}

export async function getStringVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  slotAddress: string,
): Promise<string> {
  const paddedSlotAddress: string = verify32BytesAddress(slotAddress);
  const value: string = await provider.getStorageAt(
    contractAddress,
    paddedSlotAddress,
  );

  try {
    return ethers.utils.parseBytes32String(value);
  } catch (err) {
    return await _getLongStr(
      provider,
      contractAddress,
      paddedSlotAddress,
      value,
    );
  }
}

export async function getHexVariable(
  provider: ethers.providers.Provider,
  contractAddress: string,
  slotAddress: string,
): Promise<string> {
  const paddedSlotAddress: string = verify32BytesAddress(slotAddress);
  const value: string = await provider.getStorageAt(
    contractAddress,
    paddedSlotAddress,
  );
  return value;
}

export async function getArrayAddresses(
  provider: ethers.providers.Provider,
  contractAddress: string,
  slotAddress: string,
): Promise<string[]> {
  const arrayAddress: string = verify32BytesAddress(slotAddress);

  const arrayLength: number = await getNumberVariable(
    provider,
    contractAddress,
    arrayAddress,
  );
  const rootIndex: string = ethers.utils.keccak256(arrayAddress);
  const elementAddresses: string[] = _getContiguousSlots(
    rootIndex,
    arrayLength,
  );

  return elementAddresses;
}

export async function getMappingAddresses(
  slotAddress: string,
  keys: string[] = [],
): Promise<Map<string, string>> {
  const mappingAddress: string = verify32BytesAddress(slotAddress);
  const result: Map<string, string> = new Map<string, string>();
  for (const key of keys) {
    result.set(key, _getMappingValueAddressByKey(mappingAddress, key))
  }

  return result;
}

function _getContiguousSlots(index: string, numberOfSlots = 0): string[] {
  const slots: string[] = [];
  const rootIndex: ethers.BigNumber = ethers.BigNumber.from(index);

  for (let i = 0; i < numberOfSlots; ++i) {
    const currentAddress = rootIndex.add(i).toHexString();
    slots.push(currentAddress);
  }

  return slots;
}

function _getMappingValueAddressByKey(
  mappingAddress: string,
  key: string,
): string {
  return ethers.utils.keccak256(ethers.utils.concat([key, mappingAddress]));
}

/* "Long string" data structure:
 * memory placement:  [root slot] --> [base slot][base+1 slot]...[base+n slot]
 *   memory content: (str. length)   (              str. content              )
 */
async function _getLongStr(
  provider: ethers.providers.Provider,
  contractAddress: string,
  rootSlotAddress: string,
  rootSlotValue: string,
) {
  const baseSlotAddress: string = ethers.utils.keccak256(rootSlotAddress);
  const stringLength: number = ethers.BigNumber.from(rootSlotValue)
    .shr(1)
    .toNumber();
  const totalSlots: number = Math.ceil(stringLength / 32);
  const slots: string[] = _getContiguousSlots(baseSlotAddress, totalSlots);

  let str = '';
  for (const slotAddress of slots) {
    const paddedSlotAddress = verify32BytesAddress(slotAddress);
    const stringDataPerSlot = await provider.getStorageAt(
      contractAddress,
      paddedSlotAddress,
    );
    str = str.concat(ethers.utils.toUtf8String(stringDataPerSlot));
  }

  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00]/g, '');
}
