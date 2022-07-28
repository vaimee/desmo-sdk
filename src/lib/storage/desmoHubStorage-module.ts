import { contractAddress } from '$/resources/desmoHub-config';
import { ITDD } from '$/types';
import { ethers } from 'ethers';
import {
  getArrayAddresses,
  getHexVariable,
  getMappingAddresses,
  getNumberVariable,
  getStringVariable,
  verify32BytesAddress,
} from '$/lib/storage/storage-utils';

export class DesmoHubStorage {
  constructor(private desmoHubProvider: ethers.providers.Provider) {}

  public async getTddSubsetSize(): Promise<number> {
    const slotAddress: string = verify32BytesAddress('0x00');
    return await getNumberVariable(this.desmoHubProvider, contractAddress, slotAddress);
  }

  public async getTddCounter(): Promise<number> {
    const slotAddress: string = verify32BytesAddress('0x01');
    return await getNumberVariable(this.desmoHubProvider, contractAddress, slotAddress);
  }

  public async getRegisteredAddresses(): Promise<string[]> {
    const slotAddress: string = verify32BytesAddress('0x02');
    const elementAddresses: string[] = await getArrayAddresses(
      this.desmoHubProvider,
      contractAddress,
      slotAddress,
    );

    const result: string[] = new Array<string>(elementAddresses.length);

    await Promise.all(
      elementAddresses.map(async (address: string, index: number) => {
        result[index] = await getHexVariable(
          this.desmoHubProvider,
          contractAddress,
          address,
        );
      }),
    );

    return result;
  }

  public async getTddStoragerLength(): Promise<number> {
    const slotAddress: string = verify32BytesAddress('0x03');
    return await getNumberVariable(this.desmoHubProvider, contractAddress, slotAddress);
  }

  public async getTddStorager(keys: string[]): Promise<Map<string, ITDD>> {
    const slotAddress: string = verify32BytesAddress('0x04');
    const tddAddresses: Map<string, string> = await getMappingAddresses(slotAddress, keys);

    const result: Map<string, ITDD> = new Map<string, ITDD>();
    
    await Promise.all(
        keys.map(async (key: string) => {
            const tddStructBaseAddress = ethers.BigNumber.from(tddAddresses.get(key)!);

            const urlAddress = verify32BytesAddress(tddStructBaseAddress.toHexString());
            const tddUrl = await getStringVariable(this.desmoHubProvider, contractAddress, urlAddress);

            const ownerDisabledAddress = verify32BytesAddress(tddStructBaseAddress.add(1).toHexString());
            const byte32value = await this.desmoHubProvider.getStorageAt(
              contractAddress,
              ownerDisabledAddress,
            );
            const tddOwner = ethers.BigNumber.from(byte32value)
              .mask(20 * 8)
              .toHexString();
            const tddDisabled = !(ethers.BigNumber.from(byte32value)
              .and(ethers.BigNumber.from('0xFF').shl(20 * 8))
              .shr(20 * 8)
              .isZero());

            const scoreAddress = verify32BytesAddress(tddStructBaseAddress.add(2).toHexString());
            const tddScore = ethers.BigNumber.from(
              await this.desmoHubProvider.getStorageAt(
                contractAddress,
                scoreAddress,
              ),
            ).toNumber();

            result.set(key, {
                url: tddUrl,
                owner: tddOwner,
                disabled: tddDisabled,
                score: tddScore
            } as ITDD);
      }),
    );

    return result;
  }

  public async getSelectedTDDs(keys: string[]): Promise<Map<string, string[]>> {
    const slotAddress: string = verify32BytesAddress('0x05');
    const subsetAddresses: Map<string, string> = await getMappingAddresses(slotAddress, keys);

    const result: Map<string, string[]> = new Map<string, string[]>();
    
    await Promise.all(
        keys.map(async (key: string) => {
            const tddListBaseAddress = ethers.BigNumber.from(subsetAddresses.get(key)!);

            const subsetAddress: string = verify32BytesAddress(tddListBaseAddress.toHexString());
            const elementAddresses: string[] = await getArrayAddresses(
              this.desmoHubProvider,
              contractAddress,
              subsetAddress,
            );
        
            const tddList: string[] = new Array<string>(elementAddresses.length);
        
            await Promise.all(
              elementAddresses.map(async (address: string, index: number) => {
                tddList[index] = await getStringVariable(
                  this.desmoHubProvider,
                  contractAddress,
                  address,
                );
              }),
            );

            result.set(key, tddList);
      }),
    );

    return result;
  }
}

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
