"use strict";
/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesmoHub = void 0;
const types_1 = require("../types");
const ethers_1 = require("ethers");
const desmoHub_config_1 = require("../resources/desmoHub-config");
const rxjs_1 = require("rxjs");
const contractABI = desmoHub_config_1.deploymentOutput.output.abi;
class DesmoHub {
    constructor(walletSigner) {
        if (!walletSigner.isConnected) {
            throw new Error('DesmoHub requires an already signed-in wallet!');
        }
        this._walletSigner = walletSigner;
        this.abiInterface = new ethers_1.ethers.utils.Interface(contractABI);
        this.contract = new ethers_1.ethers.Contract(desmoHub_config_1.contractAddress, contractABI, this.provider).connect(this.wallet);
        // Observables setup:
        this.TDD_CREATED = new rxjs_1.Subject();
        this.tddCreated$ = this.TDD_CREATED.asObservable();
        this.TDD_DISABLED = new rxjs_1.Subject();
        this.tddDisabled$ = this.TDD_DISABLED.asObservable();
        this.TDD_ENABLED = new rxjs_1.Subject();
        this.tddEnabled$ = this.TDD_ENABLED.asObservable();
        this.TDD_RETRIEVAL = new rxjs_1.Subject();
        this.tddRetrieval$ = this.TDD_RETRIEVAL.asObservable();
        this.TRANSACTION_SENT = new rxjs_1.Subject();
        this.transactionSent$ = this.TRANSACTION_SENT.asObservable();
    }
    get provider() {
        return this._walletSigner.provider;
    }
    get wallet() {
        return this._walletSigner.wallet;
    }
    attachListenerForNewEvents(eventFilter, listener) {
        // The following is a workaround that will stop to be required when ethers.js v6 will be released:
        // (see https://github.com/ethers-io/ethers.js/issues/2310)
        this.provider.once('block', () => {
            this.provider.on(eventFilter, listener);
        });
    }
    async startListeners() {
        const ownerAddress = await this.wallet.getAddress();
        const filterCreated = this.contract.filters.TDDCreated(ownerAddress);
        this.attachListenerForNewEvents(filterCreated, (event) => {
            const parsedEvent = this.abiInterface.parseLog(event);
            this.TDD_CREATED.next({
                key: parsedEvent.args.key,
                url: parsedEvent.args.url,
                disabled: parsedEvent.args.disabled,
            });
        });
        const filterDisabled = this.contract.filters.TDDDisabled(ownerAddress);
        this.attachListenerForNewEvents(filterDisabled, (event) => {
            const parsedEvent = this.abiInterface.parseLog(event);
            this.TDD_DISABLED.next({
                key: parsedEvent.args.key,
                url: parsedEvent.args.url,
            });
        });
        const filterEnabled = this.contract.filters.TDDEnabled(ownerAddress);
        this.attachListenerForNewEvents(filterEnabled, (event) => {
            const parsedEvent = this.abiInterface.parseLog(event);
            this.TDD_ENABLED.next({
                key: parsedEvent.args.key,
                url: parsedEvent.args.url,
            });
        });
        const filterRetrieval = this.contract.filters.TDDRetrieval(ownerAddress);
        this.attachListenerForNewEvents(filterRetrieval, (event) => {
            const parsedEvent = this.abiInterface.parseLog(event);
            this.TDD_RETRIEVAL.next({
                key: parsedEvent.args.key,
                url: parsedEvent.args.url,
                disabled: parsedEvent.args.disabled,
            });
        });
    }
    stopListeners() {
        this.provider.removeAllListeners();
    }
    async registerTDD(tddUrl) {
        const ownerAddress = await this.wallet.getAddress();
        const tx = await this.contract.registerTDD({
            url: tddUrl,
            owner: ownerAddress,
            disabled: false,
        });
        this.TRANSACTION_SENT.next({
            invokedOperation: types_1.OperationType.registerTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async disableTDD() {
        const tx = await this.contract.disableTDD();
        this.TRANSACTION_SENT.next({
            invokedOperation: types_1.OperationType.disableTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async enableTDD() {
        const tx = await this.contract.enableTDD();
        this.TRANSACTION_SENT.next({
            invokedOperation: types_1.OperationType.enableTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async getTDD() {
        const tx = await this.contract.getTDD();
        this.TRANSACTION_SENT.next({
            invokedOperation: types_1.OperationType.getTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async getNewRequestID() {
        const tx = await this.contract.getNewRequestID();
        this.TRANSACTION_SENT.next({
            invokedOperation: types_1.OperationType.getNewRequestID,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async getTDDByRequestID(requestKey) {
        const tx = await this.contract.getTDDByRequestID(requestKey);
        this.TRANSACTION_SENT.next({
            invokedOperation: types_1.OperationType.getTDDByRequestID,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
}
exports.DesmoHub = DesmoHub;
//# sourceMappingURL=desmoHub-module.js.map