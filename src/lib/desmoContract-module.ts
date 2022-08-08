/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { contractAddress, abi } from '../resources/desmoContract-config';

import { AppOrder, WorkerpoolOrder } from '../types';

import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner/walletSigner-module';
import { IExec } from 'iexec';

const contractABI = abi;

export class DesmoContract {
  private _walletSigner: WalletSigner;
  private _isConnected: boolean;
  private contract: ethers.Contract;
  private abiInterface: ethers.utils.Interface;

  private iexec: any;
  private readonly callback: string = contractAddress;
  private readonly category: number;
  private dealId: string;
  private taskId: string;

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

  public connect() {
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

  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }

  public get wallet(): ethers.Signer {
    return this._walletSigner.wallet;
  }

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
        params: requestID.toString() + ' | ' + query,
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

  // TODO decode the result
  public async getQueryResult(): Promise<any> {
    if (!this.isConnected) {
      throw new Error(
        'This method requires the wallet signer to be already signed-in!',
      );
    }

    const taskID: string = await this.retrieveTaskID();
    try {
      const result: string = await this.iexec.task.show(taskID);
      console.log(`Query result: ${result}`);
      return result;
    } catch (e) {
      console.log(e);
      throw Error(`Error to retrieve result: ${e}`);
    }
  }

  // TODO access a different source with the address
  public async verifyCallbackAddress(callbackAddress: string): Promise<any> {
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
