import { Pool } from './pool';
import { TaskConfig } from './taskContainer';
import { TransferList } from './types';
export declare class TaskExecutor {
    protected pool: Pool;
    protected taskConfig: TaskConfig;
    protected called: boolean;
    constructor(pool: Pool);
    /** Set timeout (in millisecond) to this task. */
    setTimeout(t: number): this;
    /**
     * @see {@link https://nodejs.org/dist/latest-v14.x/docs/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist transferList}
     */
    setTransferList(transferList: TransferList): this;
    protected runTask(param: any): Promise<any>;
}
