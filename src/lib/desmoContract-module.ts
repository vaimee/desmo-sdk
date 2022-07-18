/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */

import { ethers } from 'ethers';
const { IExec, utils, getSignerFromPrivateKey } = require('iexec');

import {
  contractAddress,
  deploymentOutput,
} from '../resources/desmoContract-config';
import { WalletSigner } from './walletSigner-module';

const contractABI = deploymentOutput.output.abi;

export class DesmoContract {
  private _walletSigner: WalletSigner;
  private contract: ethers.Contract;
  private abiInterface: ethers.utils.Interface;
  private iexec: any;

  constructor(walletSigner: WalletSigner, rpcUrl: string, privateKey: string) {
    if (!walletSigner.isConnected) {
      throw new Error('DesmoContract requires an already signed-in wallet!');
    }

    this._walletSigner = walletSigner;

    this.abiInterface = new ethers.utils.Interface(contractABI);

    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider,
    ).connect(this.wallet);

    this.iexec = new IExec({ ethProvider: utils.getSignerFromPrivateKey(rpcUrl, privateKey) });

  }

  public get provider(): ethers.providers.Provider {
    return this._walletSigner.provider;
  }

  public get wallet(): ethers.Wallet {
    return this._walletSigner.wallet;
  }

  public async buyQuery(params: string){
    // Must trigger the iExec platform to run our app
    const appAddress = "0x306cd828d80d2344e9572f54994d2abb1d9f5f39";
    const category = 0;
    const callback = "0x5e79D4ddc6a6F5D80816ABA102767a15E6685b3e";
    try{
        const { orders: appOrders } = await this.iexec.orderbook.fetchAppOrderbook(
            appAddress
        );

        console.log(appOrders);

        const appOrder = appOrders && appOrders[0] && appOrders[0].order;
        if (!appOrder) throw Error(`no apporder found for app ${appAddress}`);

        const {
            orders: workerpoolOrders
        } = await this.iexec.orderbook.fetchWorkerpoolOrderbook({ category });

        const workerpoolOrder = workerpoolOrders && workerpoolOrders[0] && workerpoolOrders[0].order;

        if (!workerpoolOrder){
            throw Error(`no workerpoolorder found for category ${category}`);
        }

        const userAddress = await this.iexec.wallet.getAddress();

        const requestOrderToSign = await this.iexec.order.createRequestorder({
            app: appAddress,
            appmaxprice: appOrder.appprice,
            workerpoolmaxprice: workerpoolOrder.workerpoolprice,
            requester: userAddress,
            volume: 1,
            params: params,
            category: category,
            callback: callback
        });

        const requestOrder = await this.iexec.order.signRequestorder(requestOrderToSign);

        const res = await this.iexec.order.matchOrders({
            apporder: appOrder,
            requestorder: requestOrder,
            workerpoolorder: workerpoolOrder
        });
    }catch (e) {
        console.log(e);
    }
  }

  public async getQueryResult(){
        // Must get the result from chain
  }

  public async verifyDealContractAddress(){
        // Must get the Id from the task and confront with the one configured.
  }
}
