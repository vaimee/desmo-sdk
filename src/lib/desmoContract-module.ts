/**
 * @file ./lib is a great place to keep all your code.
 * You can then choose what to make available by default by
 * exporting your lib modules from the ./src/index.ts entrypoint.
*/

import { ethers } from 'ethers';
import { IExec, utils } from 'iexec';
export class DesmoContractIexec {

    constructor(private rpcUrl: string) {
        const iexec = new IExec({ ethProvider: rpcUrl });
    }

    public async buyQuery(){
        // Must trigger the iExec platform
    }

    public async getQueryResult(){
        // Must get the result from chain
    }

    public async verifyDealContractAddress(){
        // Must get the Id from the task and confront with the one configured. 
    }

}