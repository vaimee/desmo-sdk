import { abi as contractABI } from '@vaimee/desmo-contracts/artifacts/contracts/Desmo.sol/Desmo.json';
import {
  Desmo as DesmoContract,
  RequestCreatedEvent,
} from '@vaimee/desmo-contracts/typechain/Desmo';
import { desmo as contractAddress } from '@vaimee/desmo-contracts/deployed.json';
import { QueryResultTypes } from './utils/decoder';
import {
  AppOrder,
  DesmoTransaction,
  IQueryState,
  TaskStatus,
  WorkerpoolOrder,
} from '../types/desmo-types';

import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner/walletSigner-module';
import { IExec } from 'iexec';
import { decodeQueryResult } from './utils/decoder';
import { Observable, Subject } from 'rxjs';

export type Query = {
  prefixList: { abbreviation: string; completeURI: string }[] | undefined;
  property: { identifier: string; unit: string; datatype: QueryResultTypes };
  staticFilter: string | undefined;
};

export class Desmo {
  private _walletSigner: WalletSigner;
  private _isConnected: boolean;
  private contract: DesmoContract;
  private abiInterface: ethers.utils.Interface;

  private iexec?: IExec;
  private readonly callback: string = contractAddress;
  private readonly category: number;
  private dealId: string;

  private QUERY_STATE: Subject<IQueryState>;

  /**
   *
   * @param walletSigner
   */
  constructor(walletSigner: WalletSigner) {
    this.abiInterface = new ethers.utils.Interface(contractABI);

    this._walletSigner = walletSigner;

    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider
    ) as DesmoContract;

    this._isConnected = walletSigner.isConnected;

    if (this.isConnected) {
      this.contract = this.contract.connect(this.wallet);

      try {
        this.iexec = new IExec({ ethProvider: this._walletSigner.ethProvider });
      } catch (e) {
        throw new Error('Desmo Contract could not connect with iExec');
      }
    }

    this.category = 0;
    this.dealId = '';

    this.QUERY_STATE = new Subject<IQueryState>();
  }

  /**
   * connect the desmo contract to the wallet
   */
  public connect(): void {
    if (this.isConnected) {
      throw new Error('The provided wallet signer is already connected!');
    }
    if (!this._walletSigner.isConnected) {
      throw new Error(
        'The provided wallet signer must be connected before calling this method!'
      );
    }

    this.contract = this.contract.connect(this.wallet);

    try {
      this.iexec = new IExec({ ethProvider: this._walletSigner.ethProvider });
    } catch (e) {
      throw new Error('Desmo Contract could not connect with iExec');
    }

    this._isConnected = true;
  }

  /**
   * @returns the provider used by the wallet signer
   */
  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }

  /**
   * @returns the wallet used by the current user
   */
  public get wallet(): ethers.Signer {
    return this._walletSigner.wallet;
  }

  /**
   * @returns whether the wallet signer is connected to the contract
   */
  public get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * @returns an observable that emits whenever the status of a task gets updated
   */
  public get queryState(): Observable<IQueryState> {
    return this.QUERY_STATE.asObservable();
  }

  private async fetchAppOrder(appAddress: string): Promise<AppOrder> {
    if (this.iexec === undefined) {
      throw new Error('A connection to iExec is required!');
    }
    const { orders: appOrders } = await this.iexec.orderbook.fetchAppOrderbook(
      appAddress
    );

    if (appOrders.length < 1) {
      throw new Error(`no apporder found for app ${appAddress}`);
    } else {
      return appOrders[0].order as AppOrder;
    }
  }

  private async fetchWorkerPoolOrder(): Promise<WorkerpoolOrder> {
    if (this.iexec === undefined) {
      throw new Error('A connection to iExec is required!');
    }
    const { orders: workerpoolOrders } =
      await this.iexec.orderbook.fetchWorkerpoolOrderbook({
        category: this.category,
        // https://explorer.iex.ec/bellecour/workerpool/0xeb14dc854a8873e419183c81a657d025ec70276b
        // production workerpool. Other workerpools cause errors or long waiting times
        workerpool: '0xeb14dc854a8873e419183c81a657d025ec70276b',
      });

    if (workerpoolOrders.length < 1) {
      throw new Error(`no workerpoolorder found for category ${this.category}`);
    } else {
      return workerpoolOrders[0].order as WorkerpoolOrder;
    }
  }

  private async retrieveTaskID(): Promise<string> {
    if (this.iexec === undefined) {
      throw new Error('A connection to iExec is required!');
    }
    const { tasks } = await this.iexec.deal.show(this.dealId);
    return tasks[0];
  }

  private async retrieveCallbackAddress(): Promise<string> {
    if (this.iexec === undefined) {
      throw new Error('A connection to iExec is required!');
    }
    const deal = await this.iexec.deal.show(this.dealId);
    //console.log(deal);
    return deal.callback;
  }

  /**
   * This method is used to call the homonym function on the smart contract to get a new Request id.
   * It produce an event when the transaction is sent.
   * It is possible to get the result of the transaction by subscribing to the requestID$ observable, after having activated the listeners.
   */
  public async generateNewRequestID(): Promise<string> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!'
      );
    }
    const tx = await this.contract.generateNewRequestID({ gasLimit: 1000000 });
    const receipt = await tx.wait();

    if (receipt.blockNumber === undefined) {
      throw new Error('The transaction was not mined!');
    }

    const events = receipt.events;

    if (events === undefined) {
      throw new Error('The transaction is malformed; No events found!');
    }

    const event = receipt.events?.find(
      (event) => event.event === 'RequestCreated'
    ) as RequestCreatedEvent | undefined;

    if (event === undefined) {
      throw new Error('The transaction is malformed; No RequestCreated event!');
    }

    return event.args.requestID;
  }

  /**
   * Get the scores relative to a request id.
   *
   * @param requestID
   * @returns
   */
  public async getResultByRequestID(request: ethers.Bytes): Promise<{
    requestID: string;
    taskID: string;
    scores: string[];
    result: string;
  }> {
    const { result, scores, taskID, requestID } =
      await this.contract.getQueryResultByRequestID(request);
    return { result, scores, taskID, requestID };
  }

  /**
   * Get TDD by request id.
   *
   * @param requestID
   * @returns
   */
  public async getTDDByRequestID(requestID: ethers.Bytes): Promise<string[]> {
    const events = await this.contract.queryFilter(
      this.contract.filters.RequestCreated(requestID)
    );

    const event = events.pop() as RequestCreatedEvent | undefined;

    if (event === undefined) {
      throw new Error('No request found with the provided requestID!');
    }

    return event.args.request.selectedTDDsURLs;
  }

  /**
   * This method is used to submit a query
   *
   * @param requestID
   * @param query
   * @param appAddress
   *
   * @example
   * ```ts
// Sign in with a RPC provider and a private key
const walletSigner: WalletSignerJsonRpc = new WalletSignerJsonRpc(chainURL);
walletSigner.signInWithPrivateKey(privateKEY);
// Otherwise Sign in with MetaMask
// const walletSigner = new WalletSignerMetamask(window.ethereum);
const desmohub: DesmoHub = new DesmoHub(walletSigner);
const desmoContract = new DesmoContract(walletSigner);
const eventPromise = firstValueFrom(desmoHub.requestID$);
await desmoHub.getNewRequestID();
const event = await eventPromise;
    const query = {
      prefixList: [
        { abbreviation: 'desmo', completeURI: 'https://desmo.vaimee.it/' },
        { abbreviation: 'qudt', completeURI: 'http://qudt.org/schema/qudt/' },
        {
          abbreviation: 'xsd',
          completeURI: 'http://www.w3.org/2001/XMLSchema/',
        },
        {
          abbreviation: 'monas',
          completeURI: 'https://pod.dasibreaker.vaimee.it/monas/',
        },
      ],
      property: { identifier: 'value', unit: 'qudt:DEG_C', datatype: 1 },
      staticFilter: '$[?(@["type"]=="Sensor")]',
    };
await desmoContract.buyQuery(
  event.requestID,
  JSON.stringify(query),
  iExecDAppAddress,
);
``` 
   *
   */
  public async buyQuery(
    requestID: string,
    query: Query,
    appAddress: string
  ): Promise<void> {
    if (this.iexec === undefined) {
      throw new Error('A connection to iExec is required!');
    }

    const resultAppOrder: AppOrder = await this.fetchAppOrder(appAddress);

    const resultWorkerPoolOrder: WorkerpoolOrder =
      await this.fetchWorkerPoolOrder();

    // Check if we can use the address from the wallet.
    const userAddress = await this.iexec.wallet.getAddress();
    const prefixes = query.prefixList
      ? `${query.prefixList
          .map(
            ({ abbreviation, completeURI }) =>
              `--prefixList ${abbreviation}:${completeURI}`
          )
          .join(' ')}`
      : '';
    const staticFilter = query.staticFilter
      ? `--encodedStaticFilter ${Buffer.from(
          query.staticFilter,
          'utf-8'
        ).toString('base64')}`
      : '';
    const requestOrderToSign = await this.iexec.order.createRequestorder({
      app: appAddress,
      appmaxprice: resultAppOrder.appprice,
      workerpoolmaxprice: resultWorkerPoolOrder.workerpoolprice,
      requester: userAddress,
      volume: 1,
      params: {
        // eslint-disable-next-line camelcase
        iexec_args: `${requestID} ${query.property.identifier} ${query.property.unit} ${query.property.datatype} ${prefixes} ${staticFilter}`,
      },
      category: this.category,
      // TODO: understand why the callback is needed and why the typing is wrong
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      callback: this.callback,
    });

    const requestOrder = await this.iexec.order.signRequestorder(
      requestOrderToSign
    );

    const res = await this.iexec.order.matchOrders({
      apporder: resultAppOrder,
      requestorder: requestOrder,
      workerpoolorder: resultWorkerPoolOrder,
    });

    this.dealId = res.dealid;
  }

  /**
   *
   * @returns the result of the query
   */
  public async getQueryResult(): Promise<{
    requestID: string;
    taskID: string;
    result: number | string;
    type: QueryResultTypes;
  }> {
    if (this.iexec === undefined) {
      throw new Error('A connection to iExec is required!');
    }
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!'
      );
    }

    const taskID = await this.retrieveTaskID();

    const taskObservable = await this.iexec.task.obsTask(taskID, {
      dealid: this.dealId,
    });

    const completedFilter = this.contract.filters.QueryCompleted(taskID);
    const failedFilter = this.contract.filters.QueryFailed(taskID);

    return new Promise((resolve, reject) => {
      taskObservable.subscribe({
        next: async ({ message }) => {
          this.QUERY_STATE.next({ taskID, state: message });
          switch (message) {
            case TaskStatus.TASK_COMPLETED:
              // Task completed everything ok
              break;
            case TaskStatus.TASK_FAILED:
            case TaskStatus.TASK_TIMEDOUT:
              reject(`Task execution failed. Reason: ${message}.`);
              break;
          }
        },
        error: (e) => reject(e),
        complete: () => undefined,
      });

      this.contract.on(completedFilter, (requestID, queryResult) => {
        const { value, type } = decodeQueryResult(queryResult.result);
        resolve({ requestID, taskID, result: value, type });
      });

      this.contract.on(failedFilter, () => {
        reject(new Error('Query execution failed'));
      });
    });
  }

  // TODO access a different source with the address
  /**
   *
   * @param callbackAddress
   * @returns
   */
  public async verifyCallbackAddress(callbackAddress: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!'
      );
    }

    try {
      const registeredAddress: string = await this.retrieveCallbackAddress();
      console.log('Address: ');
      console.log(registeredAddress);
      if (registeredAddress === callbackAddress) {
        return registeredAddress;
      } else {
        throw new Error('Callback address not match');
      }
    } catch (e) {
      console.log(e);
      throw new Error(`Error to retrieve result: ${e}`);
    }
  }

  /**
   * @param fromBlock the initial block number from which to extract transaction logs
   * @param toBlock the final block number from which to extract transaction logs (if not specified, the latest block number)
   * @returns an array containing the requested transaction descriptions.
   */
  public async listTransactions(
    fromBlock = 0,
    toBlock?: number
  ): Promise<DesmoTransaction[]> {
    const currentBlock = await this.provider.getBlockNumber();

    // Make sure that `fromBlock` and `toBlock` are integer numbers:
    fromBlock = Math.floor(fromBlock ?? 0);
    toBlock = Math.floor(toBlock ?? 0);

    // Apply limits to `fromBlock` and `toBlock` indexes:
    fromBlock = Math.max(fromBlock, 0);
    toBlock = Math.min(toBlock, currentBlock);

    if (fromBlock >= currentBlock) {
      throw new Error(
        `fromBlock (${fromBlock}) must be lower than the current block number (${currentBlock}).`
      );
    }
    if (fromBlock > toBlock) {
      throw new Error(
        `fromBlock (${fromBlock}) must be lower than toBlock (${toBlock}).`
      );
    }

    /**
     * Summarizing, here we should have:
     * 0 <= fromBlock < currentBlock
     * 0 <= toBlock <= currentBlock
     */
    const queryFilter = this.contract.filters.QueryCompleted();
    const events = await this.contract.queryFilter(
      queryFilter,
      fromBlock,
      toBlock !== 0 ? toBlock : 'latest'
    );
    return events.map((event) => {
      return {
        transaction: event.transactionHash,
        requestID: event.args[1].requestID,
        taskID: event.args[1].taskID,
        result: event.args[1].result,
      };
    });
  }
}
