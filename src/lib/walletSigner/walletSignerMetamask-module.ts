/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner-module';

export class WalletSignerMetamask extends WalletSigner {
  private _provider: ethers.providers.Web3Provider;

  constructor(
    private _windowEthereum: {
      selectedAddress: string;
    } & ethers.providers.ExternalProvider,
  ) {
    super();
    /**
     * By specifying the correct chainID (133 for Viviani), the provider will emit an error
     * when trying to interact with a different network:
     */
    this._provider = new ethers.providers.Web3Provider(_windowEthereum, 133);
    this._isConnected = this._windowEthereum.selectedAddress !== null;
    if (this.isConnected) {
      this._wallet = this.provider.getSigner();
    }
  }

  // Public getters:
  public get provider(): ethers.providers.Web3Provider {
    return this._provider;
  }

  public get ethProvider(): ethers.providers.ExternalProvider {
    return this._windowEthereum as ethers.providers.ExternalProvider;
  }

  // Public methods to sign in:
  public async connect(): Promise<void> {
    if (this.isConnected) {
      throw new Error('Already connected!');
    }
    try {
      await this.provider.send('eth_requestAccounts', []);
      this._wallet = this.provider.getSigner();
      this._isConnected = true;
    } catch (error: any) {
      this._isConnected = false;
      if ('code' in error && error.code === 4001) {
        // User chose not to sign-in!
        throw new Error(
          'You may need to sign-in in order to get full access to the Dapp features!',
        );
      } else {
        throw error;
      }
    }
  }
}
