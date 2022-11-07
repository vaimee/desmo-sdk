import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner-module';

/**
 * This class extends the WalletSigner class and describe a signer that uses Metamask.
 */
export class WalletSignerMetamask extends WalletSigner {
  private _provider: ethers.providers.Web3Provider;

  /**
   *
   * @param _windowEthereum the window.ethereum injected by Metamask
   */
  constructor(
    private _windowEthereum: {
      selectedAddress: string;
    } & ethers.providers.ExternalProvider
  ) {
    super();
    /**
     * By specifying the correct chainID (133 for Viviani), the provider will emit an error
     * when trying to interact with a different network:
     */
    this._provider = new ethers.providers.Web3Provider(_windowEthereum, 134);
    this._isConnected = this._windowEthereum.selectedAddress !== null;
    if (this.isConnected) {
      this._wallet = this.provider.getSigner();
    }
  }

  // Public getters:
  /**
   * @returns the provider of the wallet signer.
   */
  public get provider(): ethers.providers.Web3Provider {
    return this._provider;
  }

  public get ethProvider(): ethers.providers.ExternalProvider {
    return this._windowEthereum as ethers.providers.ExternalProvider;
  }

  // Public methods to sign in:
  /**
   * Method to sign in using Metamask.
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      throw new Error('Already connected!');
    }
    try {
      await this.provider.send('eth_requestAccounts', []);
      this._wallet = this.provider.getSigner();
      this._isConnected = true;
    } catch (e: unknown) {
      this._isConnected = false;

      const error = e as { code?: number };
      if (error.code === 4001) {
        // User chose not to sign-in!
        throw new Error(
          'You may need to sign-in in order to get full access to the Dapp features!'
        );
      } else {
        throw error;
      }
    }
  }
}
