/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */
import { ITDDCreatedEvent, ITDDDisabledEvent, ITDDEnabledEvent, ITDDRetrievalEvent, ISentTransaction } from '../types';
import { ethers } from 'ethers';
import { Observable } from 'rxjs';
import { WalletSigner } from './walletSigner-module';
export declare class DesmoHub {
    protected _walletSigner: WalletSigner;
    protected contract: ethers.Contract;
    protected abiInterface: ethers.utils.Interface;
    private TDD_CREATED;
    tddCreated$: Observable<ITDDCreatedEvent>;
    private TDD_DISABLED;
    tddDisabled$: Observable<ITDDDisabledEvent>;
    private TDD_ENABLED;
    tddEnabled$: Observable<ITDDEnabledEvent>;
    private TDD_RETRIEVAL;
    tddRetrieval$: Observable<ITDDRetrievalEvent>;
    private TRANSACTION_SENT;
    transactionSent$: Observable<ISentTransaction>;
    constructor(walletSigner: WalletSigner);
    get provider(): ethers.providers.Provider;
    get wallet(): ethers.Signer;
    private attachListenerForNewEvents;
    startListeners(): Promise<void>;
    stopListeners(): void;
    registerTDD(tddUrl: string): Promise<void>;
    disableTDD(): Promise<void>;
    enableTDD(): Promise<void>;
    getTDD(): Promise<void>;
    getNewRequestID(): Promise<void>;
    getTDDByRequestID(requestKey: string): Promise<void>;
}
//# sourceMappingURL=desmoHub-module.d.ts.map