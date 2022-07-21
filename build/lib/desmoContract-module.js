"use strict";
/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesmoContract = void 0;
const ethers_1 = require("ethers");
const iexec_1 = require("iexec");
const desmoContract_config_1 = require("../resources/desmoContract-config");
const contractABI = desmoContract_config_1.deploymentOutput.output.abi;
class DesmoContract {
    // TODO make it generic for different wallets
    constructor(walletSigner, rpcUrl, privateKey) {
        if (!walletSigner.isConnected) {
            throw new Error('Desmo Contract requires an already signed-in wallet!');
        }
        this._walletSigner = walletSigner;
        this.abiInterface = new ethers_1.ethers.utils.Interface(contractABI);
        this.contract = new ethers_1.ethers.Contract(desmoContract_config_1.contractAddress, contractABI, this.provider).connect(this.wallet);
        try {
            this.iexec = new iexec_1.IExec({ ethProvider: iexec_1.utils.getSignerFromPrivateKey(rpcUrl, privateKey) });
            //this.iexec = new IExec({ ethProvider: walletSigner.wallet._signTypedData() });
        }
        catch (e) {
            throw new Error('Desmo Contract could not connect with iExec');
        }
        console.log(iexec_1.utils.getSignerFromPrivateKey(rpcUrl, privateKey));
        console.log(walletSigner.wallet);
        this.appAddress = "0x306cd828d80d2344e9572f54994d2abb1d9f5f39";
        this.callback = "0x5e79D4ddc6a6F5D80816ABA102767a15E6685b3e";
        this.category = 0;
        this.dealId = "";
        this.taskId = "";
    }
    async fetchAppOrder() {
        const { orders: appOrders } = await this.iexec.orderbook.fetchAppOrderbook(this.appAddress);
        const appOrder = appOrders && appOrders[0] && appOrders[0].order;
        if (!appOrder) {
            throw Error(`no apporder found for app ${this.appAddress}`);
        }
        else {
            return appOrder;
        }
    }
    async fetchWorkerpoolOrder() {
        const { orders: workerpoolOrders } = await this.iexec.orderbook.fetchWorkerpoolOrderbook({
            category: this.category
        });
        const workerpoolOrder = workerpoolOrders && workerpoolOrders[0] && workerpoolOrders[0].order;
        if (!workerpoolOrder) {
            throw Error(`no workerpoolorder found for category ${this.category}`);
        }
        else {
            return workerpoolOrder;
        }
    }
    async retrieveTaskID() {
        const deal = await this.iexec.deal.show(this.dealId);
        return this.taskId = deal.tasks["0"];
    }
    async retrieveCallbackAddress() {
        const deal = await this.iexec.deal.show(this.dealId);
        console.log(deal);
        return deal.callback;
    }
    get provider() {
        return this._walletSigner.provider;
    }
    get wallet() {
        return this._walletSigner.wallet;
    }
    // TODO retrieve TDD subset before trigger iExec
    async buyQuery(params) {
        try {
            this.fetchAppOrder().then(async (resultAppOrder) => {
                this.fetchWorkerpoolOrder().then(async (resultWorkerpoolOrder) => {
                    // Check if we can use the address from the wallet.
                    const userAddress = await this.iexec.wallet.getAddress();
                    const requestOrderToSign = await this.iexec.order.createRequestorder({
                        app: this.appAddress,
                        appmaxprice: resultAppOrder.appprice,
                        workerpoolmaxprice: resultWorkerpoolOrder.workerpoolprice,
                        requester: userAddress,
                        volume: 1,
                        params: params,
                        category: this.category,
                        callback: this.callback
                    });
                    const requestOrder = await this.iexec.order.signRequestorder(requestOrderToSign);
                    const res = await this.iexec.order.matchOrders({
                        apporder: resultAppOrder,
                        requestorder: requestOrder,
                        workerpoolorder: resultWorkerpoolOrder
                    });
                    this.dealId = res.dealid;
                }).catch(error => {
                    console.log(error);
                });
            }).catch(error => {
                console.log(error);
            });
        }
        catch (e) {
            console.log(e);
        }
    }
    // TODO decode the result
    async getQueryResult() {
        this.retrieveTaskID().then(async (taskID) => {
            try {
                return await this.iexec.task.show(taskID);
            }
            catch (e) {
                console.log(e);
                throw Error(`Error to retrieve result: ${e}`);
            }
        });
    }
    async verifyCallbackAddress(callbackAddress) {
        this.retrieveTaskID().then(async (taskID) => {
            try {
                await this.retrieveCallbackAddress().then(registeredAddress => {
                    console.log("Address: ");
                    console.log(registeredAddress);
                    if (registeredAddress === callbackAddress) {
                        return registeredAddress;
                    }
                    else {
                        throw new Error("Callback address not match");
                    }
                });
            }
            catch (e) {
                console.log(e);
                throw Error(`Error to retrieve result: ${e}`);
            }
        });
    }
}
exports.DesmoContract = DesmoContract;
//# sourceMappingURL=desmoContract-module.js.map