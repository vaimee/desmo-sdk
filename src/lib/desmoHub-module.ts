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

  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }

  public get wallet(): ethers.Signer {
    return this._walletSigner.wallet;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

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

  public stopListeners(): void {
    if (!this.isListening) {
      throw new Error('Listeners are already stopped!');
    }
    this._isListening = false;

    this.provider.removeAllListeners();
  }

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

  public async getTDDStorageLength(): Promise<ethers.BigNumber> {
    return await this.contract.getTDDStorageLength();
  }

  public async getScoresByRequestID(
    requestID: ethers.Bytes,
  ): Promise<ethers.Bytes> {
    return await this.contract.getScoresByRequestID(requestID);
  }

  public async getTDDByRequestID(requestID: ethers.Bytes): Promise<string[]> {
    return await this.contract.getTDDByRequestID(requestID);
  }

  public async getTDD(): Promise<ITDD> {
    const { url, owner, disabled, score }: ITDD = await this.contract.getTDD();
    return { url, owner, disabled, score } as ITDD;
  }
}
