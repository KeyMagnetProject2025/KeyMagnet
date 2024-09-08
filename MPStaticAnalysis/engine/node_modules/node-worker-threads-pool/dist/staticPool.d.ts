import { Pool } from './pool';
import { TaskExecutor } from './taskExecutor';
import { Async, Func, NodeWorkerSettings, TaskFuncThis } from './types';
export declare type StaticPoolOptions<TTask extends Func<TaskFuncThis<TWorkerData>>, TWorkerData = any> = NodeWorkerSettings & {
    /** number of workers */
    size: number;
    /** path of worker file or worker function */
    task: string | TTask;
    /** data to pass into workers */
    workerData?: TWorkerData;
};
/** Executor for StaticPool. Used to apply some advanced settings to a task. */
export declare class StaticTaskExecutor<TTask extends Func> extends TaskExecutor {
    /** Execute this task with the parameter provided. */
    exec: Async<TTask>;
}
/**
 * Threads pool with static task.
 */
export declare class StaticPool<TTask extends Func, TWorkerData = any> extends Pool {
    constructor(opt: StaticPoolOptions<TTask, TWorkerData>);
    /**
     * Choose a idle worker to run the task
     * with param provided.
     */
    exec: Async<TTask>;
    /**
     * Create a task executor of this pool.
     * This is used to apply some advanced settings to a task.
     */
    createExecutor(): StaticTaskExecutor<TTask>;
}
