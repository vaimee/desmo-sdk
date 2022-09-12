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
