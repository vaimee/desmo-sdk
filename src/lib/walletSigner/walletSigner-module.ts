import { ethers } from 'ethers';
import { EnhancedWallet } from 'iexec/dist/common/utils/signers';
import { ExternalProvider } from '@ethersproject/providers';

/**
 * This class is an abstract class that describe a general wallet signer.
 */
export abstract class WalletSigner {
  protected _wallet?: ethers.Signer;
  protected _isConnected: boolean;

  constructor() {
    this._isConnected = false;
  }

  // Public getters:
  public abstract get provider(): ethers.providers.Provider;
  public abstract get ethProvider(): EnhancedWallet | ExternalProvider;

  /**
   * @returns the wallet you are signed in with.
   */
  public get wallet(): ethers.Signer {
    if (this._wallet === undefined) {
      throw new Error(
        'Wallet unavailable. Please sign in before trying again.',
      );
    }
    return this._wallet;
  }

  /**
   * @returns true if you are signed in.
   */
  public get isConnected(): boolean {
    return this._isConnected;
  }
}
