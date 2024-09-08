"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskContainer = void 0;
class TaskContainer {
    constructor(param, resolve, reject, taskConfig) {
        this.param = param;
        this.resolve = resolve;
        this.reject = reject;
        this.taskConfig = taskConfig;
    }
}
exports.TaskContainer = TaskContainer;
