/** @file Typescript typing information
 * If you want to break your types out from your code, you can
 * place them into the 'types' folder. Note that if you using
 * the type declaration extention ('.d.ts') your files will not
 * be compiled -- if you need to deliver your types to consumers
 * of a published npm module use the '.ts' extension instead.
 */

import { Tag } from 'iexec/dist/lib/types';

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
