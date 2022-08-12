/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { decryptJsonWallet } from '@ethersproject/json-wallets';
import { ethers } from 'ethers';
import { EnhancedWallet } from 'iexec/dist/common/utils/signers';
import { WalletSigner } from './walletSigner-module';

export class WalletSignerJsonRpc extends WalletSigner {
  protected _provider: ethers.providers.JsonRpcProvider;

  constructor(private rpcUrl: string) {
    super();
    this._provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
  }

  // Public getters:
  public get provider(): ethers.providers.JsonRpcProvider {
    return this._provider;
  }

  public get ethProvider(): EnhancedWallet {
    if (!this._wallet === undefined) {
      throw new Error(
        'ETH provider (Wallet) unavailable. Please sign in before trying again.',
      );
    }
    return this._wallet as EnhancedWallet;
  }

  // Public methods to sign in:
  public signInWithPrivateKey(privateKey: string): void {
    if (this.isConnected) {
      throw new Error('Already signed in!');
    }

    this._wallet = new EnhancedWallet(privateKey, this.provider);
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
    this._wallet = new EnhancedWallet(account.privateKey, this.provider);
    this._isConnected = true;
  }
}
