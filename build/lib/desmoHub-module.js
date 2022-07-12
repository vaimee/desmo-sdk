"use strict";
/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesmoHub = void 0;
const index_1 = require("../types/index");
const ethers_1 = require("ethers");
const desmoHubConfig_1 = require("../resources/desmoHubConfig");
const rxjs_1 = require("rxjs");
const contractABI = desmoHubConfig_1.deploymentOutput.output.abi;
class DesmoHub {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(this.rpcUrl);
        this.abiInterface = new ethers_1.ethers.utils.Interface(contractABI);
        this.contract = new ethers_1.ethers.Contract(desmoHubConfig_1.contractAddress, contractABI, this.provider);
        this.isConnected = false;
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
    signInWithPrivateKey(privateKey) {
        if (this.isConnected) {
            throw new Error('Already signed in!');
        }
        this.walletSigner = new ethers_1.ethers.Wallet(privateKey, this.provider);
        this.contract = this.contract.connect(this.walletSigner);
        this.isConnected = true;
    }
    async signInWithJsonWallet(encryptedJson, password) {
        if (this.isConnected) {
            throw new Error('Already signed in!');
        }
        this.walletSigner = await ethers_1.ethers.Wallet.fromEncryptedJson(encryptedJson, password);
        this.contract = this.contract.connect(this.walletSigner);
        this.isConnected = true;
    }
    attachListenerForNewEvents(eventFilter, listener) {
        // The following is a workaround that will stop to be required when ethers.js v6 will be released:
        // (see https://github.com/ethers-io/ethers.js/issues/2310)
        this.provider.once('block', () => {
            this.provider.on(eventFilter, listener);
        });
    }
    startListeners() {
        if (this.isConnected === false) {
            throw new Error('This operation requires a signed in wallet!');
        }
        const ownerAddress = this.walletSigner.address;
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
        if (this.isConnected === false) {
            throw new Error('This operation requires a signed in wallet!');
        }
        const ownerAddress = this.walletSigner.address;
        const tx = await this.contract.registerTDD({
            url: tddUrl,
            owner: ownerAddress,
            disabled: false,
        });
        this.TRANSACTION_SENT.next({
            invokedOperation: index_1.OperationType.registerTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async disableTDD() {
        if (this.isConnected === false) {
            throw new Error('This operation requires a signed in wallet!');
        }
        const tx = await this.contract.disableTDD();
        this.TRANSACTION_SENT.next({
            invokedOperation: index_1.OperationType.disableTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async enableTDD() {
        if (this.isConnected === false) {
            throw new Error('This operation requires a signed in wallet!');
        }
        const tx = await this.contract.enableTDD();
        this.TRANSACTION_SENT.next({
            invokedOperation: index_1.OperationType.enableTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
    async getTDD() {
        const tx = await this.contract.getTDD();
        this.TRANSACTION_SENT.next({
            invokedOperation: index_1.OperationType.retrieveTDD,
            hash: tx.hash,
            sent: new Date(Date.now()),
        });
    }
}
exports.DesmoHub = DesmoHub;
//# sourceMappingURL=desmoHub-module.js.map