/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { ethers } from 'ethers';
import {utils} from "iexec";

export class WalletSigner {
  private _provider: ethers.providers.Provider;
  private _wallet?: ethers.Wallet;
  private _isConnected: boolean;

  constructor(private rpcUrl: string) {
    this._provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
    // Here `_wallet` is intentionally left `undefined`.
    this._isConnected = false;
  }

  // Public getters:

  public get provider(): ethers.providers.Provider {
    return this._provider;
  }

  public get wallet(): ethers.Wallet {
    if (!this.isConnected) {
      throw new Error(
        'Wallet unavailable. Please sign in before trying again.',
      );
    }
    return this._wallet!;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  // Public methods to sign in:

  public signInWithPrivateKey(privateKey: string): void {
    if (this.isConnected) {
      throw new Error('Already signed in!');
    }

    this._wallet = new ethers.Wallet(privateKey, this.provider);

    this._isConnected = true;
  }

  public async signInWithJsonWallet(
    encryptedJson: string,
    password: string,
  ): Promise<void> {
    if (this.isConnected) {
      throw new Error('Already signed in!');
    }

    this._wallet = await ethers.Wallet.fromEncryptedJson(
      encryptedJson,
      password,
    );

    this._isConnected = true;
  }
}
