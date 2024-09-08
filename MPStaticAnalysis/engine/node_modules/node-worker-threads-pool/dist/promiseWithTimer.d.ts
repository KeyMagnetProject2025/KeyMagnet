/**
 * Detect if error is a Timeout error.
 */
export declare function isTimeoutError(err: Error): boolean;
export declare class PromiseWithTimer<T = any> {
    private promise;
    private timeout;
    private timerId;
    private timeoutSymbol;
    constructor(p: Promise<T>, timeout: number);
    private createTimer;
    startRace(): Promise<T>;
}
