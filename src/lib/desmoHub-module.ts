/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import {
  ITDDCreatedEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
  ISentTransaction,
  OperationType,
  IRequestIDEvent,
  ITDD,
} from '../types/desmoHub-types';
import { ethers } from 'ethers';
import { contractAddress, abi as contractABI } from '../resources/desmoHub-config';
import { Observable, Subject } from 'rxjs';
import { WalletSigner } from './walletSigner/walletSigner-module';


/**
 * This class is the main entrypoint to interact with the DesmoHub contract. 
 * It is responsible for calling all the functions of the contract and returning the results.
 */
export class DesmoHub {
  private _isListening: boolean;
  private _walletSigner: WalletSigner;
  private _isConnected: boolean;
  private contract: ethers.Contract;
  private abiInterface: ethers.utils.Interface;

  private TDD_CREATED: Subject<ITDDCreatedEvent>;
  tddCreated$: Observable<ITDDCreatedEvent>;

  private TDD_DISABLED: Subject<ITDDDisabledEvent>;
  tddDisabled$: Observable<ITDDDisabledEvent>;

  private TDD_ENABLED: Subject<ITDDEnabledEvent>;
  tddEnabled$: Observable<ITDDEnabledEvent>;

  private REQUEST_ID: Subject<IRequestIDEvent>;
  requestID$: Observable<IRequestIDEvent>;

  private TRANSACTION_SENT: Subject<ISentTransaction>;
  transactionSent$: Observable<ISentTransaction>;

  constructor(walletSigner: WalletSigner) {
    this._isListening = false;

    this.abiInterface = new ethers.utils.Interface(contractABI);

    this._walletSigner = walletSigner;

    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider,
    );

    this._isConnected = walletSigner.isConnected;

    if (this.isConnected) {
      this.contract = this.contract.connect(this.wallet);
    }

    // Observables setup:
    this.TDD_CREATED = new Subject<ITDDCreatedEvent>();
    this.tddCreated$ = this.TDD_CREATED.asObservable();

    this.TDD_DISABLED = new Subject<ITDDDisabledEvent>();
    this.tddDisabled$ = this.TDD_DISABLED.asObservable();

    this.TDD_ENABLED = new Subject<ITDDEnabledEvent>();
    this.tddEnabled$ = this.TDD_ENABLED.asObservable();

    this.REQUEST_ID = new Subject<IRequestIDEvent>();
    this.requestID$ = this.REQUEST_ID.asObservable();

    this.TRANSACTION_SENT = new Subject<ISentTransaction>();
    this.transactionSent$ = this.TRANSACTION_SENT.asObservable();
  }
/**
 * This method is used to connect the wallet signer to the DesmoHub contract.
 */
  public connect(): void {
    if (this.isConnected) {
      throw new Error('The provided wallet signer is already connected!');
    }
    if (!this._walletSigner.isConnected) {
      throw new Error(
        'The provided wallet signer must be connected before calling this method!',
      );
    }

    this.contract = this.contract.connect(this.wallet);
    this._isConnected = true;
  }
/**
 * @returns the provider used by the wallet signer.
 */
  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }
/**
 * @returns the wallet 
 */
  public get wallet(): ethers.Signer {
    return this._walletSigner.wallet;
  }

  /**
   * @returns whether the wallet signer is connected to the DesmoHub contract.
   */
  public get isConnected(): boolean {
    return this._isConnected;
  }
/**
 * @returns whether the desmoHub is listening for events.
 */
  public get isListening(): boolean {
    return this._isListening;
  }

  private attachListenerForNewEvents(
    eventFilter: ethers.EventFilter,
    listener: ethers.providers.Listener,
  ): void {
    // The following is a workaround that will stop to be required when ethers.js v6 will be released:
    // (see https://github.com/ethers-io/ethers.js/issues/2310)
    this.provider.once('block', () => {
      this.provider.on(eventFilter, listener);
    });
  }
/**
 * This method start the listeners.
 * It is possible to get the result of a transction by subscribing to the following observables:
 * - transactionSent$
 * - tddCreated$
 * - tddDisabled$
 * - tddEnabled$
 * - requestID$
 * 
 */
  public async startListeners(): Promise<void> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }

    if (this.isListening) {
      throw new Error('Listeners are already active!');
    }
    this._isListening = true;

    const ownerAddress: string = await this.wallet.getAddress();

    const filterCreated = this.contract.filters.TDDCreated(ownerAddress);
    this.attachListenerForNewEvents(filterCreated, (event: ethers.Event) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_CREATED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
        disabled: parsedEvent.args.disabled,
        score: parsedEvent.args.score,
      });
    });

    const filterDisabled = this.contract.filters.TDDDisabled(ownerAddress);
    this.attachListenerForNewEvents(filterDisabled, (event: ethers.Event) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_DISABLED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
      });
    });

    const filterEnabled = this.contract.filters.TDDEnabled(ownerAddress);
    this.attachListenerForNewEvents(filterEnabled, (event: ethers.Event) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_ENABLED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
      });
    });

    const filterRequestID = this.contract.filters.RequestID();
    this.attachListenerForNewEvents(filterRequestID, (event: ethers.Event) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.REQUEST_ID.next({
        requestID: parsedEvent.args.requestID,
      });
    });
  }
/**
 * This method stop the listerners.
 */
  public stopListeners(): void {
    if (!this.isListening) {
      throw new Error('Listeners are already stopped!');
    }
    this._isListening = false;

    this.provider.removeAllListeners();
  }
/**
 * This method is used to call the homonym function on the smart contract that register a new TDD.
 * It produce an event when the transaction is sent.
 * It is possible to get the result of the transaction by subscribing to the tddCreated$ observable, after having activated the listeners.
 * 
 * @param tddUrl the url of the TDD to be created.
 */
  public async registerTDD(tddUrl: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }

    const tx = await this.contract.registerTDD(tddUrl);
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.registerTDD,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }
/**
 * This method is used to call the homonym function on the smart contract that disable a TDD.
 * It produce an event when the transaction is sent.
 * It is possible to get the result of the transaction by subscribing to the tddDisabled$ observable, after having activated the listeners.
 */
  public async disableTDD(): Promise<void> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }

    const tx = await this.contract.disableTDD();
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.disableTDD,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }
/**
 * This method is used to call the homonym function on the smart contract that enable a TDD.
 * It produce an event when the transaction is sent.
 * It is possible to get the result of the transaction by subscribing to the tddEnabled$ observable, after having activated the listeners.
 */
  public async enableTDD(): Promise<void> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }

    const tx = await this.contract.enableTDD();
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.enableTDD,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }
/**
 * This method is used to call the homonym function on the smart contract to get a new Request id.
 * It produce an event when the transaction is sent.
 * It is possible to get the result of the transaction by subscribing to the requestID$ observable, after having activated the listeners.
 */
  public async getNewRequestID(): Promise<void> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }

    const tx = await this.contract.getNewRequestID();
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.getNewRequestID,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }
/**
 * 
 * @returns the length of the TDD storage.
 */
  public async getTDDStorageLength(): Promise<ethers.BigNumber> {
    return await this.contract.getTDDStorageLength();
  }
/**
 * Get the scores relative to a request id.
 * 
 * @param requestID 
 * @returns 
 */
  public async getScoresByRequestID(
    requestID: ethers.Bytes,
  ): Promise<ethers.Bytes> {
    return await this.contract.getScoresByRequestID(requestID);
  }
/**
 * Get TDD by request id.
 * 
 * @param requestID 
 * @returns 
 */
  public async getTDDByRequestID(requestID: ethers.Bytes): Promise<string[]> {
    return await this.contract.getTDDByRequestID(requestID);
  }

  /**
   * 
   * @returns the TDD of the current user.
   */
  public async getTDD(): Promise<ITDD> {
    const { url, owner, disabled, score }: ITDD = await this.contract.getTDD();
    return { url, owner, disabled, score } as ITDD;
  }
}
