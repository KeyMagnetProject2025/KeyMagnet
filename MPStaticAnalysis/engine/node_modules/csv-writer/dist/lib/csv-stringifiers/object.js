"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_1 = require("./abstract");
var ObjectCsvStringifier = /** @class */ (function (_super) {
    __extends(ObjectCsvStringifier, _super);
    function ObjectCsvStringifier(fieldStringifier, header, recordDelimiter) {
        var _this = _super.call(this, fieldStringifier, recordDelimiter) || this;
        _this.header = header;
        return _this;
    }
    ObjectCsvStringifier.prototype.getHeaderRecord = function () {
        if (!this.isObjectHeader)
            return null;
        return this.header.reduce(function (memo, field) {
            var _a;
            return Object.assign({}, memo, (_a = {}, _a[field.id] = field.title, _a));
        }, {});
    };
    ObjectCsvStringifier.prototype.getRecordAsArray = function (record) {
        return this.fieldIds.map(function (field) { return record[field]; });
    };
    Object.defineProperty(ObjectCsvStringifier.prototype, "fieldIds", {
        get: function () {
            return this.isObjectHeader ? this.header.map(function (column) { return column.id; }) : this.header;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectCsvStringifier.prototype, "isObjectHeader", {
        get: function () {
            return isObject(this.header && this.header[0]);
        },
        enumerable: true,
        configurable: true
    });
    return ObjectCsvStringifier;
}(abstract_1.CsvStringifier));
exports.ObjectCsvStringifier = ObjectCsvStringifier;
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
//# sourceMappingURL=object.js.map