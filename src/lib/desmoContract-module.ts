/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { ethers } from 'ethers';
import {
  contractAddress,
  deploymentOutput,
} from '../resources/desmoContract-config';
import { WalletSigner } from './walletSigner-module';

const contractABI = deploymentOutput.output.abi;

export class DesmoContract {
  private _walletSigner: WalletSigner;
  private contract: ethers.Contract;
  private abiInterface: ethers.utils.Interface;

  constructor(walletSigner: WalletSigner) {
    if (!walletSigner.isConnected) {
      throw new Error('DesmoContract requires an already signed-in wallet!');
    }

    this._walletSigner = walletSigner;

    this.abiInterface = new ethers.utils.Interface(contractABI);
    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider,
    ).connect(this.wallet);
  }

  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }

  public get wallet(): ethers.Wallet {
    return this._walletSigner.wallet;
  }
}
