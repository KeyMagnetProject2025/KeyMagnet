var defuseAnalyzer = require('./def-use/defuseanalyzer_new'),
    cfgBuilder = require('./cfg/cfgbuilder'),
    path = require("path"),
    walkes = require('walkes');
var esprimaParser = require('./parser/jsparser');
var escodegen = require('escodegen');  // API: escodegen.generate(node);
var copy = require('lodash')
var fs = require("fs");

/**
 * requestCtrl
 * @constructor
 */
function requestCtrl() {
    "use strict";
    /* start-test-block */
    this._testonly_ = {
    };
    /* end-test-block */
}

requestCtrl.prototype.buildIntraDataFlowModel = function (functionName, functionNode, filename) {

    // cfgBuilder.getCFG(functionNode.astNode)
    var initialization = {};
    var entryNode = functionNode.astNode;
    if (entryNode.type === 'FunctionDeclaration' || entryNode.type === 'FunctionExpression') {
        if (entryNode.params && entryNode.params.length) {
            for (var i = 0; i < entryNode.params.length; i++) {
                var param = entryNode.params[i];
                if (param && param.name) {
                    dependencies = {
                        'name': functionName,
                        'dependencies': {}
                    }
                    initialization[param.name] = [{ 'type': 'parameter', 'id': entryNode._id, '__caller': [dependencies] }];
                }
            }
        }
    }

    functionNode.output = initialization;
    defuseAnalyzer.doAnalysis(functionName, functionNode, filename);
}


requestCtrl.prototype.getCallersById = function (callRelations, calleeId) {
    var callers = [];
    callRelations.forEach(callRelation => {
        if (callRelation.toFunction === calleeId) {
            var callerNode = callRelation.fromNode;
            var dependencies = defuseAnalyzer.clearDependencies(callerNode.input, defuseAnalyzer.getIdentsByList(callerNode.arguments));

            arguments_info = []
            callerNode.arguments.forEach(argument => {
                arguments_info.push(escodegen.generate(argument))
            })
            callers.push({
                'callerId': callRelation.fromNode,
                'name': callRelation.functionName,
                'arguments': arguments_info,
                'container': callRelation.fromFunction,
                'dependencies': dependencies
            });
        }
    })
    return callers;
}


// 根据CG来完善函数之间的依赖关系
requestCtrl.prototype.buildInterDataFlowModel = function (outputDir, functionMap, callRelations) {

    // 进行过程间的数据流分析
    var requestData = defuseAnalyzer.getRequestData();
    var IDFDetails = defuseAnalyzer.getIDFDetails();
    var functionToCallMap = defuseAnalyzer.getFunctionToCallMap();
    // callRelations.forEach(callRelation => {
    //     console.log(callRelation.fromNode.input)
    // })
    
    for (var request_id in requestData) {
        var dependencyContent = requestData[request_id]['dependencies'];
        var visited = []
        this.recurseAnalysis(dependencyContent, functionToCallMap, callRelations, visited, 0);
    }
    
    this.saveMiddleFiles(outputDir, requestData, IDFDetails, callRelations, functionToCallMap)
}


requestCtrl.prototype.recurseAnalysis = function (dependencyContent, functionToCallMap, callRelations, visited, depth) {
    if (depth > 3) return;

    for (var ident in dependencyContent) {
        dependencyContent[ident].forEach(dependency => {
            if (dependency['type'] === 'parameter') {
                var functionNodeId = dependency['id'];
                if (functionNodeId in functionToCallMap) {
                    var callExpression = functionToCallMap[functionNodeId];

                    if (callExpression.type === 'entryNode') {
                        var callers = this.getCallersById(callRelations, callExpression.id);
                        if (callers.length > 0) {
                            dependency['__caller'] = []

                            callers.forEach(caller => {
                                if(visited.indexOf(caller.callerId) == -1) {
                                    visited.push(caller.callerId)
                                    this.recurseAnalysis(caller.dependencies, functionToCallMap, callRelations, visited, depth + 1);
                                    dependency['__caller'].push({
                                        'name': caller.name,
                                        'container': caller.container,
                                        'arguments': caller.arguments,
                                        'dependencies': caller.dependencies
                                    })
                                }
                            })
                        }
                    } else if ('__caller' in dependency && 'dependencies' in dependency['__caller']) {
                        this.recurseAnalysis(dependency['__caller']['dependencies'], functionToCallMap, callRelations, depth + 1);
                    }
                }
            }
        });
    }
}


function formatJsonData(data){
    var cache = []
    return JSON.stringify(data, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // console.log(typeof value)
                // console.log(value)
                // console.log('##############################################')
                return;
            }
            cache.push(value);
        }
        return value;
    });
}


requestCtrl.prototype.saveMiddleFiles = function (outputDir, requestData, IDFDetails, callRelations, functionToCallMap) {
    const fmFile = path.join(outputDir, 'IDF_details.json');
    var fmNodes = fs.openSync(fmFile, 'w');
    fs.writeSync(fmNodes, JSON.stringify(IDFDetails));

    const fmFile2 = path.join(outputDir, 'request_traces_middle.json');
    var fmNodes = fs.openSync(fmFile2, 'w');
    // console.log(requestData)
    fs.writeSync(fmNodes, formatJsonData(requestData));

    var call_relations_filtered = []
    callRelations.forEach(callRelation => {
        call_relations_filtered.push({
            fromId: callRelation.fromId,
            fromFunction: callRelation.fromFunction,
            functionName: callRelation.functionName,
            toFunction: callRelation.toFunction
        })
    })
    const fmFile3 = path.join(outputDir, 'call_relations.json');
    var fmNodes = fs.openSync(fmFile3, 'w');
    fs.writeSync(fmNodes, JSON.stringify(call_relations_filtered));

    const fmFile4 = path.join(outputDir, 'function_map.json');
    var fmNodes = fs.openSync(fmFile4, 'w');
    fs.writeSync(fmNodes, formatJsonData(functionToCallMap));
}


var requestctrl = new requestCtrl();
module.exports = requestctrl;
