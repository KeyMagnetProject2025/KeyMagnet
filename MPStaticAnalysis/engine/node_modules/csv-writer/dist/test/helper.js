"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("assert");
var fs = require('fs');
exports.testFilePath = function (id) { return "./test-tmp/" + id + ".csv"; };
exports.assertFile = function (path, expectedContents, encoding) {
    var actualContents = fs.readFileSync(path, encoding || 'utf8');
    assert_1.strictEqual(actualContents, expectedContents);
};
exports.assertContain = function (expectedSubstring, actualString) {
    assert_1.ok(expectedSubstring.includes(actualString), actualString + " does not contain " + expectedSubstring);
};
function mockType(params) {
    return Object.assign({}, params);
}
exports.mockType = mockType;
//# sourceMappingURL=helper.js.map