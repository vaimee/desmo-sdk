import { Tag } from 'iexec/dist/lib/types';

export interface DesmoTransaction {
  transaction: string;
  requestID: string;
  result: string;
  taskID: string;
}

export interface AppOrder {
  app: string;
  appprice: number;
  volume: number;
  tag: string;
  datasetrestrict: string;
  workerpoolrestrict: string;
  requesterrestrict: string;
  salt: string;
  sign: string;
}

export interface WorkerpoolOrder {
  workerpool: string;
  workerpoolprice: number;
  volume: number;
  tag: Tag;
  category: number;
  trust: number;
  apprestrict: string;
  datasetrestrict: string;
  requesterrestrict: string;
  salt: string;
  sign: string;
}

export enum TaskStatus {
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_TIMEDOUT = 'TASK_TIMEDOUT',
  TASK_FAILED = 'TASK_FAILED',
}

export interface IQueryState {
  taskID: string;
  state: string;
}
