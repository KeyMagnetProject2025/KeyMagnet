"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticPool = exports.StaticTaskExecutor = void 0;
const worker_threads_1 = require("worker_threads");
const pool_1 = require("./pool");
const poolWorker_1 = require("./poolWorker");
const taskExecutor_1 = require("./taskExecutor");
const utils_1 = require("./utils");
function createScript(fn) {
    return `
    const { parentPort, workerData } = require('worker_threads');

    ${utils_1.WORKER_RUNTIME_HELPER_CODE}

    this.workerData = workerData;
    const container = {
      workerData,
      require,
      task: ${utils_1.createFunctionString(fn)}
    };
    
    process.once("unhandledRejection", (err) => {
      throw err;
    });

    parentPort.on('message', async (param) => {
      parentPort.postMessage(await container.task(param));
    });
  `;
}
/** Executor for StaticPool. Used to apply some advanced settings to a task. */
class StaticTaskExecutor extends taskExecutor_1.TaskExecutor {
    constructor() {
        super(...arguments);
        /** Execute this task with the parameter provided. */
        this.exec = ((param) => {
            return super.runTask(param);
        });
    }
}
exports.StaticTaskExecutor = StaticTaskExecutor;
/**
 * Threads pool with static task.
 */
class StaticPool extends pool_1.Pool {
    constructor(opt) {
        super(opt.size);
        /**
         * Choose a idle worker to run the task
         * with param provided.
         */
        this.exec = ((param) => {
            if (typeof param === 'function') {
                throw new TypeError('"param" can not be a function!');
            }
            return this.runTask(param, { timeout: 0 });
        });
        const { task, workerData, shareEnv, resourceLimits } = opt;
        const workerOpt = { workerData };
        if (shareEnv) {
            workerOpt.env = worker_threads_1.SHARE_ENV;
        }
        if (typeof resourceLimits === 'object') {
            workerOpt.resourceLimits = resourceLimits;
        }
        if (typeof task === 'function') {
            workerOpt.eval = true;
        }
        switch (typeof task) {
            case 'string': {
                this.fill(() => new poolWorker_1.PoolWorker(task, workerOpt));
                break;
            }
            case 'function': {
                const script = createScript(task);
                this.fill(() => new poolWorker_1.PoolWorker(script, workerOpt));
                break;
            }
            default:
                throw new TypeError('Invalid type of "task"!');
        }
    }
    /**
     * Create a task executor of this pool.
     * This is used to apply some advanced settings to a task.
     */
    createExecutor() {
        return new StaticTaskExecutor(this);
    }
}
exports.StaticPool = StaticPool;
