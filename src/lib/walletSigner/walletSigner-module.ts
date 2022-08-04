/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

 import { ethers } from 'ethers';
 import { EnhancedWallet } from 'iexec/dist/common/utils/signers';
 import { ExternalProvider } from '@ethersproject/providers';

 export abstract class WalletSigner {
   protected _wallet?: ethers.Signer;
   protected _isConnected: boolean;

   constructor() {
     this._isConnected = false;
   }

   // Public getters:
   public abstract get provider(): ethers.providers.Provider;
   public abstract get ethProvider(): EnhancedWallet | ExternalProvider;

   public get wallet(): ethers.Signer {
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

 }
