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
    private readonly appAddress;
    private readonly callback;
    private readonly category;
    private dealId;
    private taskId;
    constructor(walletSigner: WalletSigner, rpcUrl: string, privateKey: string);
    private fetchAppOrder;
    private fetchWorkerpoolOrder;
    private retrieveTaskID;
    private retrieveCallbackAddress;
    get provider(): ethers.providers.Provider;
    get wallet(): ethers.Wallet;
    buyQuery(params: string): Promise<void>;
    getQueryResult(): Promise<any>;
    verifyCallbackAddress(callbackAddress: string): Promise<any>;
}
//# sourceMappingURL=desmoContract-module.d.ts.map