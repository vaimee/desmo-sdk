/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner-module';

export class WalletSignerMetamask extends WalletSigner {
  protected _provider: ethers.providers.Web3Provider;

  constructor(private _window_ethereum: any) {
    super();
    this._provider = new ethers.providers.Web3Provider(_window_ethereum, 'any');
    this._isConnected = this._window_ethereum.selectedAddress !== null;
    if (this.isConnected) {
      this._wallet = this.provider.getSigner();
    }
  }

  // Public getters:
  public get provider(): ethers.providers.Web3Provider {
    return this._provider;
  }

  public get ethProvider(): ethers.providers.ExternalProvider {
    return this._window_ethereum as ethers.providers.ExternalProvider;
  }

  // Public methods to sign in:
  public async connect(): Promise<void> {
    if (this.isConnected) {
      throw new Error('Already connected!');
    }
    await this.provider.send('eth_requestAccounts', []);
    this._wallet = this.provider.getSigner();
    this._isConnected = true;
  }
}
