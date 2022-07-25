/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import {
  contractAddress,
  deploymentOutput,
} from '../resources/desmoContract-config';

import { AppOrder, WorkerpoolOrder } from '../types';

import { ethers } from 'ethers';
import { WalletSigner } from './walletSigner-module';
import { IExec, utils } from 'iexec';

const contractABI = deploymentOutput.output.abi;

export class DesmoContract {
  private _walletSigner: WalletSigner;
  private contract: ethers.Contract;
  private abiInterface: ethers.utils.Interface;

  private iexec: any;
  private readonly appAddress: string;
  private readonly callback: string;
  private readonly category: number;
  private dealId: string;
  private taskId: string;

  constructor(walletSigner: WalletSigner) {

    if (!walletSigner.isConnected) {
      throw new Error('Desmo Contract requires an already signed-in wallet!');
    }

    this._walletSigner = walletSigner;

    this.abiInterface = new ethers.utils.Interface(contractABI);

    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider,
    ).connect(this.wallet);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.iexec = new IExec({ ethProvider: walletSigner.wallet });
    } catch (e) {
      throw new Error('Desmo Contract could not connect with iExec');
    }

    this.appAddress = '0xCA568A116c8003f5A8993759080F6f3fAD53E6Cf';
    this.callback = '0x0f04bC57374f9F8c705636142CEFf953e33a7249';

    this.category = 0;
    this.dealId = '';
    this.taskId = '';
  }

  private async fetchAppOrder(): Promise<AppOrder> {
    const { orders: appOrders } = await this.iexec.orderbook.fetchAppOrderbook(
      this.appAddress,
    );

    const appOrder = appOrders && appOrders[0] && appOrders[0].order;

    if (!appOrder) {
      throw Error(`no apporder found for app ${this.appAddress}`);
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

  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }

  public get wallet(): ethers.Signer {
    return this._walletSigner.wallet;
  }

  public async buyQuery(requestID: string, query: string): Promise<void> {
    try {
      const resultAppOrder: AppOrder = await this.fetchAppOrder();

      const resultWorkerPoolOrder: WorkerpoolOrder =
        await this.fetchWorkerPoolOrder();

      // Check if we can use the address from the wallet.
      const userAddress = await this.iexec.wallet.getAddress();

      const requestOrderToSign = await this.iexec.order.createRequestorder({
        app: this.appAddress,
        appmaxprice: resultAppOrder.appprice,
        workerpoolmaxprice: resultWorkerPoolOrder.workerpoolprice,
        requester: userAddress,
        volume: 1,
        params: requestID + ' | ' + query,
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
    const taskID: string = await this.retrieveTaskID();
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
