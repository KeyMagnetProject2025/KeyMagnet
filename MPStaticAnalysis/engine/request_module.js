var walkes = require('walkes');
var esprimaParser = require('./lib/jaw/parser/jsparser');;
var escodegen = require('escodegen');  // API: escodegen.generate(node);
var copy = require('lodash')


var intraFunctionHandler = async function (function_id, function_content) {
    await esprimaParser.traverseAST(ast, function (node) {
		if (node && node.type) {
			let _id = flownodeFactory.count;
			if (_id in flownodeFactory.generatedExitsDict) {
				flownodeFactory.count = flownodeFactory.count + 1;
				_id = flownodeFactory.count
			}
			node._id = _id;
			flownodeFactory.count = flownodeFactory.count + 1;
		}
	});
}
