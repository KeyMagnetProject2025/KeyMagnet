"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_RECORD_DELIMITER = '\n';
var VALID_RECORD_DELIMITERS = [DEFAULT_RECORD_DELIMITER, '\r\n'];
var CsvStringifier = /** @class */ (function () {
    function CsvStringifier(fieldStringifier, recordDelimiter) {
        this.fieldStringifier = fieldStringifier;
        this.fieldDelimiter = fieldStringifier.fieldDelimiter;
        this.recordDelimiter = recordDelimiter || DEFAULT_RECORD_DELIMITER;
        _validateRecordDelimiter(this.recordDelimiter);
    }
    CsvStringifier.prototype.getHeaderString = function () {
        var headerRecord = this.getHeaderRecord();
        return headerRecord ? this.stringifyRecords([headerRecord]) : null;
    };
    CsvStringifier.prototype.stringifyRecords = function (records) {
        var _this = this;
        var csvLines = Array.from(records, function (record) { return _this.getCsvLine(_this.getRecordAsArray(record)); });
        return csvLines.join(this.recordDelimiter) + this.recordDelimiter;
    };
    CsvStringifier.prototype.getCsvLine = function (record) {
        var _this = this;
        return record
            .map(function (fieldValue) { return _this.fieldStringifier.stringify(fieldValue); })
            .join(this.fieldDelimiter);
    };
    return CsvStringifier;
}());
exports.CsvStringifier = CsvStringifier;
function _validateRecordDelimiter(delimiter) {
    if (VALID_RECORD_DELIMITERS.indexOf(delimiter) === -1) {
        throw new Error("Invalid record delimiter `" + delimiter + "` is specified");
    }
}
//# sourceMappingURL=abstract.js.map