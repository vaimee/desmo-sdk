/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */
import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner-module';
export declare class DesmoContract {
    private _walletSigner;
    private contract;
    private abiInterface;
    private iexec;
    constructor(walletSigner: WalletSigner, rpcUrl: string, privateKey: string);
    get provider(): ethers.providers.Provider;
    get wallet(): ethers.Wallet;
    buyQuery(params: string): Promise<void>;
    getQueryResult(): Promise<void>;
    verifyDealContractAddress(): Promise<void>;
}
//# sourceMappingURL=desmoContract-module.d.ts.map