/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { decryptJsonWallet } from '@ethersproject/json-wallets';
import { ethers } from 'ethers';
import { EnhancedWallet } from 'iexec/dist/common/utils/signers';
import { WalletSigner } from './walletSigner-module';

export class WalletSignerInfura extends WalletSigner {

  constructor(private rpcUrl: string) {
    super();
    this._provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
  }

  // Public getters:
 
  public get provider(): ethers.providers.Provider {
    return this._provider!;
  }

  // Public methods to sign in:

  public signInWithPrivateKey(privateKey: string): void {
    if (this.isConnected) {
      throw new Error('Already signed in!');
    }

    this._wallet = new EnhancedWallet(privateKey, this.provider);
    this._ethProvider = this._wallet as EnhancedWallet;
    this._isConnected = true;
  }

  public async signInWithJsonWallet(
    encryptedJson: string,
    password: string,
  ): Promise<void> {
    if (this.isConnected) {
      throw new Error('Already signed in!');
    }
    const account: any = await decryptJsonWallet(encryptedJson, password);
    this._wallet = new EnhancedWallet (account.privateKey, this.provider);
    this._ethProvider = this._wallet as EnhancedWallet;
    this._isConnected = true;
  }
}
