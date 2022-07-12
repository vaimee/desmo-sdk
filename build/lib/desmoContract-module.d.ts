/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
*/
export declare class DesmoContractIexec {
    private rpcUrl;
    private privateKey;
    private iexec;
    constructor(rpcUrl: string, privateKey: string);
    buyQuery(params: string): Promise<void>;
    getQueryResult(): Promise<void>;
    verifyDealContractAddress(): Promise<void>;
}
//# sourceMappingURL=desmoContract-module.d.ts.map