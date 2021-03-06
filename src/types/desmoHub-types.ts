/** @file Typescript typing information
 * If you want to break your types out from your code, you can
 * place them into the 'types' folder. Note that if you using
 * the type declaration extention ('.d.ts') your files will not
 * be compiled -- if you need to deliver your types to consumers
 * of a published npm module use the '.ts' extension instead.
 */

export interface ITDD {
  url: string;
  owner: string;
  disabled : boolean;
  score: number;
}

export interface ITDDCreatedEvent {
  key: string;
  url: string;
  disabled: boolean;
  score: number;
}

export interface ITDDDisabledEvent {
  key: string;
  url: string;
}

export interface ITDDEnabledEvent {
  key: string;
  url: string;
}

export interface ITDDRetrievalEvent {
  key: string;
  url: string;
  disabled: boolean;
  score: number;
}

export interface IRequestIDEvent {
  requestID: number;
}

export interface ITDDSubsetEvent {
  subset: string[];
}

export enum OperationType {
  registerTDD = 0,
  disableTDD = 1,
  enableTDD = 2,
  getTDD = 3,
  getNewRequestID = 4,
  getTDDByRequestID = 5
}

export interface ISentTransaction {
  invokedOperation: OperationType;
  hash: string;
  sent: Date;
  confirmed?: Date;
}
