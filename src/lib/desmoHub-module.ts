/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import {
  ITDDCreatedEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
  ITDDRetrievalEvent,
  ISentTransaction,
  OperationType,
  IRequestIDEvent,
  ITDDSubsetEvent,
} from '../types';
import { ethers } from 'ethers';
import { contractAddress, deploymentOutput } from '../resources/desmoHub-config';
import { Observable, Subject } from 'rxjs';
import { WalletSigner } from './walletSigner-module';

const contractABI = deploymentOutput.output.abi;

export class DesmoHub {
  private isListening: boolean;
  private _walletSigner: WalletSigner;
  private contract: ethers.Contract;
  private abiInterface: ethers.utils.Interface;

  private TDD_CREATED: Subject<ITDDCreatedEvent>;
  tddCreated$: Observable<ITDDCreatedEvent>;

  private TDD_DISABLED: Subject<ITDDDisabledEvent>;
  tddDisabled$: Observable<ITDDDisabledEvent>;

  private TDD_ENABLED: Subject<ITDDEnabledEvent>;
  tddEnabled$: Observable<ITDDEnabledEvent>;

  private TDD_RETRIEVAL: Subject<ITDDRetrievalEvent>;
  tddRetrieval$: Observable<ITDDRetrievalEvent>;

  private REQUEST_ID: Subject<IRequestIDEvent>;
  requestID$: Observable<IRequestIDEvent>;

  private TDD_SUBSET: Subject<ITDDSubsetEvent>;
  tddSubset$: Observable<ITDDSubsetEvent>;

  private TRANSACTION_SENT: Subject<ISentTransaction>;
  transactionSent$: Observable<ISentTransaction>;

  constructor(walletSigner: WalletSigner) {
    if (!walletSigner.isConnected) {
      throw new Error('DesmoHub requires an already signed-in wallet!');
    }

    this.isListening = false;

    this._walletSigner = walletSigner;

    this.abiInterface = new ethers.utils.Interface(contractABI);

    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider,
    ).connect(this.wallet);

    // Observables setup:
    this.TDD_CREATED = new Subject<ITDDCreatedEvent>();
    this.tddCreated$ = this.TDD_CREATED.asObservable();

    this.TDD_DISABLED = new Subject<ITDDDisabledEvent>();
    this.tddDisabled$ = this.TDD_DISABLED.asObservable();

    this.TDD_ENABLED = new Subject<ITDDEnabledEvent>();
    this.tddEnabled$ = this.TDD_ENABLED.asObservable();

    this.TDD_RETRIEVAL = new Subject<ITDDRetrievalEvent>();
    this.tddRetrieval$ = this.TDD_RETRIEVAL.asObservable();

    this.REQUEST_ID = new Subject<IRequestIDEvent>();
    this.requestID$ = this.REQUEST_ID.asObservable();

    this.TDD_SUBSET = new Subject<ITDDSubsetEvent>();
    this.tddSubset$ = this.TDD_SUBSET.asObservable();

    this.TRANSACTION_SENT = new Subject<ISentTransaction>();
    this.transactionSent$ = this.TRANSACTION_SENT.asObservable();
  }

  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }

  public get wallet(): ethers.Signer {
    return this._walletSigner.wallet;
  }

  private attachListenerForNewEvents(eventFilter: any, listener: any) {
    // The following is a workaround that will stop to be required when ethers.js v6 will be released:
    // (see https://github.com/ethers-io/ethers.js/issues/2310)
    this.provider.once('block', () => {
      this.provider.on(eventFilter, listener);
    });
  }

  public async startListeners() {
    if (this.isListening) {
      return;
    }
    this.isListening = true;

    const ownerAddress: string = await this.wallet.getAddress();

    const filterCreated = this.contract.filters.TDDCreated(ownerAddress);
    this.attachListenerForNewEvents(filterCreated, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_CREATED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
        disabled: parsedEvent.args.disabled,
        score: parsedEvent.args.score,
      });
    });

    const filterDisabled = this.contract.filters.TDDDisabled(ownerAddress);
    this.attachListenerForNewEvents(filterDisabled, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_DISABLED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
      });
    });

    const filterEnabled = this.contract.filters.TDDEnabled(ownerAddress);
    this.attachListenerForNewEvents(filterEnabled, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_ENABLED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
      });
    });

    const filterRetrieval = this.contract.filters.TDDRetrieval(ownerAddress);
    this.attachListenerForNewEvents(filterRetrieval, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_RETRIEVAL.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
        disabled: parsedEvent.args.disabled,
        score: parsedEvent.args.score,
      });
    });

    const filterRequestID = this.contract.filters.RequestID();
    this.attachListenerForNewEvents(filterRequestID, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.REQUEST_ID.next({
        requestID: parsedEvent.args.requestID,
      });
    });

    const filterTDDSubset = this.contract.filters.TDDSubset();
    this.attachListenerForNewEvents(filterTDDSubset, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);

      this.TDD_SUBSET.next({
        subset: parsedEvent.args.TDDSubset,
      });
    });
  }

  public stopListeners() {
    if (!this.isListening) {
      return;
    }
    this.isListening = false;

    this.provider.removeAllListeners();
  }

  public async registerTDD(tddUrl: string, disabled = false, score = 0): Promise<void> {
    const ownerAddress: string = await this.wallet.getAddress();

    const tx = await this.contract.registerTDD({
      url: tddUrl,
      owner: ownerAddress,
      disabled: disabled,
      score: score
    });
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.registerTDD,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }

  public async disableTDD(): Promise<void> {
    const tx = await this.contract.disableTDD();
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.disableTDD,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }

  public async enableTDD(): Promise<void> {
    const tx = await this.contract.enableTDD();
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.enableTDD,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }

  public async getTDD(): Promise<void> {
    const tx = await this.contract.getTDD();
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.getTDD,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }

  public async getNewRequestID(): Promise<void> {
    const tx = await this.contract.getNewRequestID();
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.getNewRequestID,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }

  public async getTDDByRequestID(requestKey: string): Promise<void> {
    const tx = await this.contract.getTDDByRequestID(requestKey);
    this.TRANSACTION_SENT.next({
      invokedOperation: OperationType.getTDDByRequestID,
      hash: tx.hash,
      sent: new Date(Date.now()),
    });
  }
}
