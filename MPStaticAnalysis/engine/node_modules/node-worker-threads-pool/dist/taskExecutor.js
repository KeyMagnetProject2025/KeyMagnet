"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskExecutor = void 0;
class TaskExecutor {
    constructor(pool) {
        this.taskConfig = {};
        this.called = false;
        this.pool = pool;
    }
    /** Set timeout (in millisecond) to this task. */
    setTimeout(t) {
        this.taskConfig.timeout = t;
        return this;
    }
    /**
     * @see {@link https://nodejs.org/dist/latest-v14.x/docs/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist transferList}
     */
    setTransferList(transferList) {
        this.taskConfig.transferList = transferList;
        return this;
    }
    runTask(param) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.called) {
                throw new Error('task executor is already called!');
            }
            this.called = true;
            return this.pool.runTask(param, this.taskConfig);
        });
    }
}
exports.TaskExecutor = TaskExecutor;
