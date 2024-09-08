import { TransferList } from './types';
declare type ResolveFunc = (value: any) => void;
declare type RejectFunc = (reason: any) => void;
export interface TaskConfig {
    timeout?: number;
    transferList?: TransferList;
}
export declare class TaskContainer {
    param: any;
    resolve: ResolveFunc;
    reject: RejectFunc;
    taskConfig: TaskConfig;
    constructor(param: any, resolve: ResolveFunc, reject: RejectFunc, taskConfig: TaskConfig);
}
export {};
