/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { contractAddress, abi as contractABI } from '../resources/desmo-config';

import { AppOrder, TaskStatus, WorkerpoolOrder } from '../types/desmo-types';

import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner/walletSigner-module';
import { IExec } from 'iexec';


export class Desmo {
  private _walletSigner: WalletSigner;
  private _isConnected: boolean;
  private contract: ethers.Contract;
  private abiInterface: ethers.utils.Interface;

  private iexec: any;
  private readonly callback: string = contractAddress;
  private readonly category: number;
  private dealId: string;
  private taskId: string;

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
      this.provider,
    );

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
    this.taskId = '';
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
        'The provided wallet signer must be connected before calling this method!',
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

  private async fetchAppOrder(appAddress: string): Promise<AppOrder> {
    const { orders: appOrders } = await this.iexec.orderbook.fetchAppOrderbook(
      appAddress,
    );

    const appOrder = appOrders && appOrders[0] && appOrders[0].order;

    if (!appOrder) {
      throw Error(`no apporder found for app ${appAddress}`);
    } else {
      return appOrder;
    }
  }

  private async fetchWorkerPoolOrder(): Promise<WorkerpoolOrder> {
    const { orders: workerpoolOrders } =
      await this.iexec.orderbook.fetchWorkerpoolOrderbook({
        category: this.category,
      });

    const workerpoolOrder =
      workerpoolOrders && workerpoolOrders[0] && workerpoolOrders[0].order;

    if (!workerpoolOrder) {
      throw Error(`no workerpoolorder found for category ${this.category}`);
    } else {
      return workerpoolOrder;
    }
  }

  private async retrieveTaskID(): Promise<string> {
    const deal = await this.iexec.deal.show(this.dealId);
    return (this.taskId = deal.tasks['0']);
  }

  private async retrieveCallbackAddress(): Promise<string> {
    const deal = await this.iexec.deal.show(this.dealId);
    //console.log(deal);
    return deal.callback;
  }
/**
 * This method is used to submit a query 
 * 
 * @param requestID 
 * @param query example-> {'prefixList':[{'abbreviation':'desmo','completeURI':'https://desmo.vaimee.it/'},{'abbreviation':'qudt','completeURI':'http://qudt.org/schema/qudt/'},{'abbreviation':'xsd','completeURI':'http://www.w3.org/2001/XMLSchema/'},{'abbreviation':'monas','completeURI':'https://pod.dasibreaker.vaimee.it/monas/'}],'property':{'identifier':'value','unit':'qudt:DEG_C','datatype':1},'staticFilter':'$[?(@["type"]=="Sensor")]'}'
 * @param appAddress 
 */
  public async buyQuery(
    requestID: ethers.Bytes,
    query: string,
    appAddress: string,
  ): Promise<void> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }

    try {
      const resultAppOrder: AppOrder = await this.fetchAppOrder(appAddress);

      const resultWorkerPoolOrder: WorkerpoolOrder =
        await this.fetchWorkerPoolOrder();

      // Check if we can use the address from the wallet.
      const userAddress = await this.iexec.wallet.getAddress();

      const requestOrderToSign = await this.iexec.order.createRequestorder({
        app: appAddress,
        appmaxprice: resultAppOrder.appprice,
        workerpoolmaxprice: resultWorkerPoolOrder.workerpoolprice,
        requester: userAddress,
        volume: 1,
        params: requestID.toString() + ' ' + query,
        category: this.category,
        callback: this.callback,
      });

      const requestOrder = await this.iexec.order.signRequestorder(
        requestOrderToSign,
      );

      const res = await this.iexec.order.matchOrders({
        apporder: resultAppOrder,
        requestorder: requestOrder,
        workerpoolorder: resultWorkerPoolOrder,
      });

      this.dealId = res.dealid;
    } catch (err) {
      console.log(err);
    }
  }
/**
 * 
 * @returns the result of the query 
 */
  public async getQueryResult(): Promise<{
    requestId: string;
    taskId: string;
    result: string;
  }> {
    const myIexec = this.iexec as IExec;
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new Promise( (resolve, reject) => {
      (function loop(): void {
        setTimeout(async () => {
          const taskId = await self.retrieveTaskID();
          const taskDetail = await myIexec.task.show(taskId);
          console.log(`The status of the task ${taskId} is ${taskDetail.statusName}`);
          if (taskDetail.statusName === TaskStatus.COMPLETED) {
            const tx = await self.contract.receiveResult(taskId, '0x00');
            await tx.wait();
            const result = await self.contract.getQueryResult(taskId);
            // TODO: Decode the result
            resolve({ requestId: '', taskId, result });
          } else {
            loop();
          }
        }, 1000)
      })();
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
        'This method requires the wallet signer to be already signed-in!',
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
      throw Error(`Error to retrieve result: ${e}`);
    }
  }
}
