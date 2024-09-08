"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultFieldStringifier = /** @class */ (function () {
    function DefaultFieldStringifier(fieldDelimiter) {
        this.fieldDelimiter = fieldDelimiter;
    }
    DefaultFieldStringifier.prototype.stringify = function (value) {
        if (typeof value === 'undefined' || value === null)
            return '';
        var str = String(value);
        return this.needsQuote(str) ? "\"" + str.replace(/"/g, '""') + "\"" : str;
    };
    DefaultFieldStringifier.prototype.needsQuote = function (str) {
        return str.includes(this.fieldDelimiter) || str.includes('\n') || str.includes('"');
    };
    return DefaultFieldStringifier;
}());
exports.DefaultFieldStringifier = DefaultFieldStringifier;
var ForceQuoteFieldStringifier = /** @class */ (function () {
    function ForceQuoteFieldStringifier() {
    }
    ForceQuoteFieldStringifier.prototype.stringify = function (value) {
        if (typeof value === 'undefined' || value === null)
            return '';
        var str = String(value);
        return "\"" + str.replace(/"/g, '""') + "\"";
    };
    return ForceQuoteFieldStringifier;
}());
exports.ForceQuoteFieldStringifier = ForceQuoteFieldStringifier;
//# sourceMappingURL=default-field-stringifier.js.map