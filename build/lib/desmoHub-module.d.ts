/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
*/
import { ITDDCreatedEvent, ITDDDisabledEvent, ITDDEnabledEvent, ITDDRetrievalEvent, ISentTransaction } from '../types/index';
import { Observable } from 'rxjs';
export declare class DesmoHub {
    private rpcUrl;
    private provider;
    private contract;
    private abiInterface;
    private walletSigner?;
    private isConnected;
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
    constructor(rpcUrl: string);
    signInWithPrivateKey(privateKey: string): void;
    signInWithJsonWallet(encryptedJson: string, password: string): Promise<void>;
    private attachListenerForNewEvents;
    startListeners(): void;
    stopListeners(): void;
    registerTDD(tddUrl: string): Promise<void>;
    disableTDD(): Promise<void>;
    enableTDD(): Promise<void>;
    getTDD(): Promise<void>;
}
//# sourceMappingURL=desmoHub-module.d.ts.map