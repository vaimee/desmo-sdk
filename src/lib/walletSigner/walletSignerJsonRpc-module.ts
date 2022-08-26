/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { ethers } from 'ethers';
import { EnhancedWallet } from 'iexec/dist/common/utils/signers';
import { WalletSigner } from './walletSigner-module';

/**
 * This class extends the WalletSigner class and describe a signer that uses an RPC provider. 
 */
export class WalletSignerJsonRpc extends WalletSigner {
  private _provider: ethers.providers.JsonRpcProvider;

  /**
   * 
   * @param rpcUrl The url of the RPC provider.
   */
  constructor(private rpcUrl: string) {
    super();
    this._provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
  }

  /**
   * @returns the provider of the wallet signer.
   */
  public get provider(): ethers.providers.JsonRpcProvider {
    return this._provider;
  }

  /**
   * The ethProvider is used just for compatibility with IExec
   * @returns an EnhancedWallet extension of the Wallet class.
   */
  public get ethProvider(): EnhancedWallet {
    if (!this._wallet === undefined) {
      throw new Error(
        'ETH provider (Wallet) unavailable. Please sign in before trying again.',
      );
    }
    return this._wallet as EnhancedWallet;
  }

  /**
   * Method to sign in the wallet with a private key.
   * @param privateKey The private key of the wallet.
   */
  public signInWithPrivateKey(privateKey: string): void {
    if (this.isConnected) {
      throw new Error('Already signed in!');
    }

    this._wallet = new EnhancedWallet(privateKey, this.provider);
    this._isConnected = true;
  }
/**
 * 
 * @param encryptedJson 
 * @param password 
 */
  public async signInWithJsonWallet(
    encryptedJson: string,
    password: string,
  ): Promise<void> {
    if (this.isConnected) {
      throw new Error('Already signed in!');
    }
    const account: ethers.Wallet = await ethers.Wallet.fromEncryptedJson(
      encryptedJson,
      password,
    );
    this._wallet = new EnhancedWallet(account.privateKey, this.provider);
    this._isConnected = true;
  }
}
