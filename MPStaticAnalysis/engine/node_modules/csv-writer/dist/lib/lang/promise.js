"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var nodeCallback = function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            };
            fn.apply(null, args.concat([nodeCallback]));
        });
    };
}
exports.promisify = promisify;
//# sourceMappingURL=promise.js.map