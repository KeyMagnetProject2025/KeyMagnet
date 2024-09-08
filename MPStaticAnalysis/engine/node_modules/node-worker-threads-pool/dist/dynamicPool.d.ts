import { Pool } from './pool';
import { TaskExecutor } from './taskExecutor';
import { Async, Func, NodeWorkerSettings, TaskFuncThis } from './types';
export declare type DynamicPoolExecOptions<TTask extends Func<TaskFuncThis<TWorkerData>>, TWorkerData = any> = {
    /**
     * Data to pass into workers.
     * @deprecated since version 1.4.0. Please use parameter instead.
     */
    workerData?: TWorkerData;
    timeout?: number;
} & ({
    /** Function to be executed. */
    task: () => ReturnType<TTask>;
} | {
    /** Function to be executed. */
    task: TTask;
    /** Parameter for task function. */
    param: Parameters<TTask>[0];
});
/** Executor for DynamicPool. Used to apply some advanced settings to a task. */
export declare class DynamicTaskExecutor<TTask extends Func> extends TaskExecutor {
    private code;
    constructor(dynamicPool: DynamicPool, task: Function);
    /** Execute this task with the parameter provided. */
    exec: Async<TTask>;
}
/**
 * Threads pool that can run different function
 * each call.
 */
export declare class DynamicPool extends Pool {
    constructor(
    /** Number of workers. */
    size: number, 
    /** Some advanced settings. */
    opt?: NodeWorkerSettings);
    /**
     * Choose a idle worker to execute the function
     * with context provided.
     */
    exec<TTask extends Func, TWorkerData = any>(opt: DynamicPoolExecOptions<TTask, TWorkerData>): ReturnType<Async<TTask>>;
    /**
     * Create a task executor of this pool.
     * This is used to apply some advanced settings to a task.
     */
    createExecutor<TTask extends Func>(task: TTask): DynamicTaskExecutor<TTask>;
}
