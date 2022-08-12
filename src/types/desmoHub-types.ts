/** @file Typescript typing information
 * If you want to break your types out from your code, you can
 * place them into the 'types' folder. Note that if you using
 * the type declaration extention ('.d.ts') your files will not
 * be compiled -- if you need to deliver your types to consumers
 * of a published npm module use the '.ts' extension instead.
 */

import { ethers } from 'ethers';

export interface ITDD {
  url: string;
  owner: string;
  disabled: boolean;
  score: ethers.BigNumber;
}

export interface ITDDCreatedEvent {
  key: string;
  url: string;
  disabled: boolean;
  score: ethers.BigNumber;
}

export interface ITDDDisabledEvent {
  key: string;
  url: string;
}

export interface ITDDEnabledEvent {
  key: string;
  url: string;
}

export interface IRequestIDEvent {
  requestID: ethers.Bytes;
}

export enum OperationType {
  registerTDD = 0,
  disableTDD = 1,
  enableTDD = 2,
  getNewRequestID = 3,
}

export interface ISentTransaction {
  invokedOperation: OperationType;
  hash: string;
  sent: Date;
  confirmed?: Date;
}
