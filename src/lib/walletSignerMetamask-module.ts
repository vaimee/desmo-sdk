/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { decryptJsonWallet } from '@ethersproject/json-wallets';
import { ethers } from 'ethers';
import { EnhancedWallet } from 'iexec/dist/common/utils/signers';
import { ExternalProvider } from '@ethersproject/providers';
import { WalletSigner } from './walletSigner-module';

export class WalletSignerMetamask extends WalletSigner {

    constructor(private _window_ethereum: ExternalProvider) {
        super();
        this._provider = new ethers.providers.Web3Provider(_window_ethereum, 'any');
    }

    // Public getters:

    public get provider(): ethers.providers.Web3Provider {
        return this._provider as ethers.providers.Web3Provider;
    }

    public get window_ethereum(): ExternalProvider {
        if (!this.isConnected) {
            throw new Error(
                'window_ethereum unavailable. Please sign in before trying again.',
            );
        }
        return this._window_ethereum;
    }
    public get signer(): ethers.Signer {
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
    public async connect(): Promise<void> {
        if (this.isConnected) {
            throw new Error('Already connected!');
        }
        await this.provider.send('eth_requestAccounts', []);
        this._wallet = this.provider.getSigner();
        this._ethProvider = this._window_ethereum
        this._isConnected = true;
    }
}
