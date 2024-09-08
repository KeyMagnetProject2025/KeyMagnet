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
exports.PromiseWithTimer = exports.isTimeoutError = void 0;
class TimeoutError extends Error {
    constructor() {
        super(...arguments);
        this.name = 'TimeoutError';
    }
}
/**
 * Detect if error is a Timeout error.
 */
function isTimeoutError(err) {
    return err instanceof TimeoutError;
}
exports.isTimeoutError = isTimeoutError;
class PromiseWithTimer {
    constructor(p, timeout) {
        this.timeoutSymbol = Symbol('timeoutSymbol');
        this.promise = p;
        this.timeout = timeout;
    }
    createTimer() {
        return new Promise((resolve) => {
            this.timerId = setTimeout(resolve, this.timeout, this.timeoutSymbol);
        });
    }
    startRace() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.timeout <= 0) {
                return this.promise;
            }
            const result = yield Promise.race([this.promise, this.createTimer()]);
            if (result === this.timeoutSymbol) {
                throw new TimeoutError('timeout');
            }
            clearTimeout(this.timerId);
            return result;
        });
    }
}
exports.PromiseWithTimer = PromiseWithTimer;
