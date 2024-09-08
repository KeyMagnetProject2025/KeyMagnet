"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicPool = exports.DynamicTaskExecutor = void 0;
const worker_threads_1 = require("worker_threads");
const pool_1 = require("./pool");
const poolWorker_1 = require("./poolWorker");
const taskExecutor_1 = require("./taskExecutor");
const utils_1 = require("./utils");
const script = `
  const vm = require('vm');
  const { parentPort } = require('worker_threads');

  ${utils_1.WORKER_RUNTIME_HELPER_CODE}

  process.once("unhandledRejection", (err) => {
    throw err;
  });

  parentPort.on('message', async ({ code, workerData, param }) => {
    this.workerData = workerData;
    const task = vm.runInThisContext(code);
    const container = { task, workerData, require };
    const result = await container.task(param);
    parentPort.postMessage(result);
  });
`;
/** Executor for DynamicPool. Used to apply some advanced settings to a task. */
class DynamicTaskExecutor extends taskExecutor_1.TaskExecutor {
    constructor(dynamicPool, task) {
        super(dynamicPool);
        /** Execute this task with the parameter provided. */
        this.exec = ((param) => {
            const workerParam = { code: this.code, param };
            return super.runTask(workerParam);
        });
        this.code = utils_1.createFunctionString(task);
    }
}
exports.DynamicTaskExecutor = DynamicTaskExecutor;
/**
 * Threads pool that can run different function
 * each call.
 */
class DynamicPool extends pool_1.Pool {
    constructor(
    /** Number of workers. */
    size, 
    /** Some advanced settings. */
    opt) {
        super(size);
        const workerOpt = {
            eval: true
        };
        if (opt === null || opt === void 0 ? void 0 : opt.shareEnv) {
            workerOpt.env = worker_threads_1.SHARE_ENV;
        }
        if (typeof (opt === null || opt === void 0 ? void 0 : opt.resourceLimits) === 'object') {
            workerOpt.resourceLimits = opt.resourceLimits;
        }
        this.fill(() => new poolWorker_1.PoolWorker(script, workerOpt));
    }
    /**
     * Choose a idle worker to execute the function
     * with context provided.
     */
    exec(opt) {
        //@ts-ignore
        const { task, workerData, timeout, param } = opt;
        if (typeof task !== 'function') {
            throw new TypeError('task "fn" must be a function!');
        }
        const code = utils_1.createFunctionString(task);
        const workerParam = {
            code,
            param,
            workerData
        };
        return this.runTask(workerParam, { timeout });
    }
    /**
     * Create a task executor of this pool.
     * This is used to apply some advanced settings to a task.
     */
    createExecutor(task) {
        return new DynamicTaskExecutor(this, task);
    }
}
exports.DynamicPool = DynamicPool;
