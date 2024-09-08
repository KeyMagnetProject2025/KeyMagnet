/*
 * New version of Def-Use analyzer
 */
var copy = require('lodash'),
    escodegen = require('escodegen');

var Set = require('../../analyses/set'),
    walkes = require('walkes'),
    worklist = require('../../analyses'),
    Map = require('core-js/es6/map');

const util = require('util');
const Var = require('./var');

var namespace = require('../../namespace'),
    internal = namespace();

/**
 * DefUseAnalyzer
 * @constructor
 */
function DefUseAnalyzer() {
    "use strict";

    internal(this)._requestData = {};
    internal(this)._IDFDetails = {};
    internal(this)._mapFromFunctionToCall = {};
    /* start-test-block */
    this._testonly_ = {};
    /* end-test-block */
}

DefUseAnalyzer.prototype.addRequestData = function (request_id, data, IDF_data) {
    "use strict";
    internal(this)._requestData[request_id] = data;
    if (IDF_data['isValid']) {
        internal(this)._IDFDetails[request_id] = IDF_data;
    }
}

DefUseAnalyzer.prototype.getRequestData = function () {
    "use strict";
    return internal(this)._requestData;
}

DefUseAnalyzer.prototype.getIDFDetails = function () {
    "use strict";
    return internal(this)._IDFDetails;
}

DefUseAnalyzer.prototype.addFunctionToCallMap = function (function_id, request_id) {
    "use strict";
    internal(this)._mapFromFunctionToCall[function_id] = request_id;
}

DefUseAnalyzer.prototype.getFunctionToCallMap = function () {
    "use strict";
    return internal(this)._mapFromFunctionToCall;
}


DefUseAnalyzer.prototype.getIdentsByList = function (nodes) {
    var idents = new Set();
    nodes.forEach(node => {
        this.getIdents(node).forEach(ident => {
            idents.add(ident)
        });
    })
    return idents;
}


DefUseAnalyzer.prototype.getIdents = function (node) {
    var idents = []
    walkes(node, {
        Identifier: function (node, recurse) {
            idents.push(node.name)
        },
        MemberExpression: function (node, recurse) {
            recurse(node.object);
            recurse(node.property);
        },
        BinaryExpression: function (node, recurse) {
            recurse(node.left);
            recurse(node.right);
        },
        LogicalExpression: function (node, recurse) {
            recurse(node.left);
            recurse(node.right);
        },
        UpdateExpression: function (node, recurse) {
            recurse(node.argument);
        },
        AssignmentExpression: function (node, recurse) {
            recurse(node.right);
        },
        VariableDeclaration: function (node, recurse) {
            node["declarations"].forEach(recurse);
        },
        VariableDeclarator: function (node, recurse) {
            recurse(node.init);
        },
        ConditionalExpression: function (node, recurse) {
            recurse(node.test);
            recurse(node.consequent);
            recurse(node.alternate);
        },
        IfStatement: function (node, recurse) {
            recurse(node.consequent);
            if (node.alternate) {
                recurse(node.alternate);
            }
        },
        SwitchCase: function (node, recurse) {
            node.consequent.forEach(recurse);
        },
        SwitchStatement: function (node, recurse) {
            node.cases.forEach(casenode => {
                recurse(casenode);
            });
        },
        DoWhileStatement: function (node, recurse) {
            recurse(node.body);
        },
        ExpressionStatement: function (node, recurse) {
            recurse(node.expression);
        },
        BlockStatement: function (node, recurse) {
            node.body.forEach(recurse);
        },
        SequenceExpression: function (node, recurse) {
            for (var expression in node.expressions) {
                recurse(expression);
            }
        },
        CallExpression: function (node, recurse) {
            recurse(node.callee);
            node["arguments"].forEach(recurse);
        },
        ArrayExpression: function (node, recurse) {
            node["elements"].forEach(recurse);
        },
        ObjectExpression: function (node, recurse) {
            node.properties.forEach(property => {
                recurse(property);
            })
        },
        Property: function (node, recurse) {
            recurse(node.value);
        },
        NewExpression: function (node, recurse) {
            recurse(node.callee);
        },
        FunctionDeclaration: function (node, recurse) {
            recurse(node.body);
        },
        FunctionExpression: function (node, recurse) {
            recurse(node.body);
        },
        ArrowFunctionExpression: function (node, recurse) {
            recurse(node.body);
        },
        ForStatement: function (node, recurse) {
            recurse(node.body);
        },
        ForInStatement: function (node, recurse) {
            recurse(node.body);
        },
        TryStatement: function (node, recurse) {
            recurse(node.block);
            recurse(node.handler);
            recurse(node.finalizer);
        },
        CatchClause: function (node, recurse) {
            recurse(node.body);
        },
        WhileStatement: function (node, recurse) {
            recurse(node.body);
        }
    });
    return idents;
}


DefUseAnalyzer.prototype.findIDFelseNormal = function (node, value) {
    var varDef = []

    const regex_1 = /\.globalData\.([\.\w]+)/g;
    const regex_2 = /\.getStorageSync\(['"](\w+)['"]\)/g;
    const regex_3 = /key:\s*['"](\w+)['"]/g;
    let match, raw;

    if (value) {
        raw = value;
    } else {
        var right;
        if (node.type === 'AssignmentExpression') {
            right = node.right;
        } else if (node.type === 'VariableDeclarator') {
            right = node.init;
        } else if (node.type === 'Property') {
            right = node.value;
        }

        if (!right)
            return varDef;

        raw = escodegen.generate(right);
    }

    if (raw.indexOf('.globalData') > -1) {
        while ((match = regex_1.exec(raw)) !== null) {
            varDef.push({
                'type': 'globalData',
                'value': match[1]
            });
        }
    } else if (raw.indexOf('getStorageSync') > -1) {
        while ((match = regex_2.exec(raw)) !== null) {
            varDef.push({
                'type': 'getStorageSync',
                'value': match[1]
            });
        }
    } else if (raw.indexOf('getStorage') > -1) {
        while ((match = regex_3.exec(raw)) !== null) {
            varDef.push({
                'type': 'getStorage',
                'value': match[1]
            });
        }
    }

    if (value) return varDef;

    // if(varDef.length === 0) {
    varDef.push({
        'type': 'normal',
        'value': raw,
        'idents': this.getIdents(right)
    })
    // }
    // console.log(varDef)
    return varDef;
}


DefUseAnalyzer.prototype.findGENSet = function (node) {
    var generatedVarDef = {};
    var killedVarDef = [];

    if (node.type === 'AssignmentExpression') {
        if (node.left.type === 'Identifier' && node.operator === '=') {
            killedVarDef.push(node.left.name);
            generatedVarDef[node.left.name] = this.findIDFelseNormal(node);
        } else {
            var definedVar = (node.left.type === 'MemberExpression') ? node.left.object.name : node.left.name;
            if (!!definedVar) {
                generatedVarDef[definedVar] = this.findIDFelseNormal(node);
            }

            if (node.left.type === 'MemberExpression' && node.left.object.type === 'ThisExpression') {
                var definedVar2 = node.left.property.name;
                if (!!definedVar2) {
                    generatedVarDef[definedVar2] = this.findIDFelseNormal(node);
                }
            }
        }
    }
    if (node.type === 'VariableDeclarator') {
        if (node.id.type === 'Identifier') {
            var definedVar = node.id.name;
            killedVarDef.push(node.id.name);
            generatedVarDef[node.id.name] = this.findIDFelseNormal(node);
            // console.log(generatedVarDef)   
        }
    } else if (node.type === 'Property') {
        if (node.key.type === 'Identifier') {
            var definedVar = node.key.name;
            generatedVarDef[definedVar] = this.findIDFelseNormal(node);
        }
    } else if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        if (node.params && node.params.length) {
            for (var i = 0; i < node.params.length; i++) {
                var param = node.params[i];
                if (param && param.name) {
                    killedVarDef.push(param.name);

                    var dependencies = {}
                    var functionToCallMap = this.getFunctionToCallMap();
                    if (node._id in functionToCallMap) {
                        var callExpression = functionToCallMap[node._id]
                        if (callExpression.dependencies) {
                            dependencies = {
                                'name': callExpression.callee,
                                'dependencies': callExpression.dependencies
                            }
                        } else {
                            dependencies = {
                                'name': callExpression.callee,
                                'dependencies': {}
                            }
                        }

                    }
                    generatedVarDef[param.name] = [{
                        'type': 'parameter',
                        'id': node._id,
                        '__caller': [dependencies]
                    }];
                }
            }
        }
    }

    return [generatedVarDef, killedVarDef];
}


DefUseAnalyzer.prototype.transferFunction = function (input, gen, kill) {
    var output = copy.cloneDeep(input);
    gen = copy.cloneDeep(gen);
    kill.forEach(name => {
        if (name in input) {
            output[name] = [];
        }
    })
    for (var name in gen) {
        if (gen[name]) {
            // console.log(name, output[name])
            if (name in input) {
                if (typeof input[name] === 'object')
                    output[name] = [...output[name], ...gen[name]];
            } else {
                output[name] = gen[name];
            }
        }
    }
    return output;
}


DefUseAnalyzer.prototype.merge = function (input1, input2) {
    var output = copy.cloneDeep(input1);
    for (var name in input2) {
        if (name in input1) {
            // input1[name].forEach(item => {
            //     // console.log(item)
            // })
        } else {
            output[name] = input2[name];
        }
    }
    return output;
}


/**
 * Do reach definition analysis
 * @param {Model} model
 */
DefUseAnalyzer.prototype.doAnalysis = function (functionName, functionNode, filename) {

    "use strict";
    var thisAnalyzer = this;
    var output_prev = copy.cloneDeep(functionNode.output);

    this.addFunctionToCallMap(functionNode.astNode._id, {
        'id': functionNode.astNode._id,
        'callee': functionName,
        'type': 'entryNode'
    })
    // console.log(functionNode.astNode)

    walkes(functionNode.astNode, {
        AssignmentExpression: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(node);
            node.output = thisAnalyzer.transferFunction(node.input, generatedVarDef, killedVarDef)
            recurse(node.right);
            output_prev = copy.cloneDeep(node.output);
        },
        VariableDeclaration: function (node, recurse) {
            node["declarations"].forEach(recurse);
        },
        VariableDeclarator: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(node);
            node.output = thisAnalyzer.transferFunction(node.input, generatedVarDef, killedVarDef)
            recurse(node.init);
            output_prev = copy.cloneDeep(node.output);
        },
        ConditionalExpression: function (node, recurse) {
            var output_prev_current = copy.cloneDeep(output_prev);
            var output_prev_merge = {};
            node.input = copy.cloneDeep(output_prev_current);
            recurse(node.test);
            output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);

            output_prev = copy.cloneDeep(output_prev_current);
            recurse(node.consequent);
            output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);

            output_prev = copy.cloneDeep(output_prev_current);
            recurse(node.alternate);
            output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);

            node.output = copy.cloneDeep(output_prev_current);
            output_prev = copy.cloneDeep(node.output);
        },
        IfStatement: function (node, recurse) {
            var output_prev_current = copy.cloneDeep(output_prev);
            var output_prev_merge = {};
            node.input = copy.cloneDeep(output_prev);

            recurse(node.test);
            recurse(node.consequent);
            output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);
            if (node.alternate) {
                output_prev = copy.cloneDeep(output_prev_current);
                recurse(node.alternate);
                output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);
            }

            node.output = output_prev_merge;
            output_prev = copy.cloneDeep(node.output);
        },
        BinaryExpression: function (node, recurse) {
            recurse(node.left);
            recurse(node.right);
        },
        LogicalExpression: function (node, recurse) {
            recurse(node.left);
            recurse(node.right);
        },
        UpdateExpression: function (node, recurse) {
            recurse(node.argument);
        },
        SwitchCase: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            node.consequent.forEach(recurse);
        },
        SwitchStatement: function (node, recurse) {
            var output_prev_current = copy.cloneDeep(output_prev);
            var output_prev_merge = {};
            node.input = copy.cloneDeep(output_prev);
            node.cases.forEach(casenode => {
                output_prev = copy.cloneDeep(output_prev_current);
                recurse(casenode);
                output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);
            });
            node.output = output_prev_merge;
            output_prev = copy.cloneDeep(node.output);
        },
        DoWhileStatement: function (node, recurse) {
            recurse(node.body);
        },
        ExpressionStatement: function (node, recurse) {
            // console.log(escodegen.generate(node.expression))
            // console.log(node.expression.type)
            // if (node.expression.type === 'CallExpression')
            //     console.log(escodegen.generate(node.expression.callee))
            // console.log('..............')
            recurse(node.expression);
        },
        BlockStatement: function (node, recurse) {
            node.body.forEach(recurse);
        },
        SequenceExpression: function (node, recurse) {
            node.expressions.forEach(expression => {
                recurse(expression);
            })
        },
        CallExpression: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            // if(node.callee.property) {
            //     console.log(node.callee.property.name);
            //     console.log(node)
            // }
            thisAnalyzer.isRequest(node, filename);

            recurse(node.callee);
            node["arguments"].forEach(recurse);
        },
        ArrayExpression: function (node, recurse) {
            node["elements"].forEach(recurse);
        },
        ObjectExpression: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            node.properties.forEach(property => {
                property.input = node.input;
                // let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(property);
                // property.output = thisAnalyzer.transferFunction(property.input, generatedVarDef, killedVarDef);
                recurse(property);
            })
        },
        Property: function (node, recurse) {
            recurse(node.value);
        },
        NewExpression: function (node, recurse) {
            recurse(node.callee);
            node["arguments"].forEach(recurse);
        },
        FunctionDeclaration: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(node);
            node.output = thisAnalyzer.transferFunction(node.input, generatedVarDef, killedVarDef);
            output_prev = copy.cloneDeep(node.output);

            recurse(node.body);
        },
        FunctionExpression: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(node);
            node.output = thisAnalyzer.transferFunction(node.input, generatedVarDef, killedVarDef);
            output_prev = copy.cloneDeep(node.output);

            recurse(node.body);
        },
        ArrowFunctionExpression: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(node);
            node.output = thisAnalyzer.transferFunction(node.input, generatedVarDef, killedVarDef);
            output_prev = copy.cloneDeep(node.output);

            recurse(node.body);
        },
        ForStatement: function (node, recurse) {
            recurse(node.body);
        },
        ForInStatement: function (node, recurse) {
            recurse(node.body);
        },
        TryStatement: function (node, recurse) {
            recurse(node.block);
            recurse(node.handler);
            recurse(node.finalizer);
        },
        CatchClause: function (node, recurse) {
            recurse(node.body);
        },
        WhileStatement: function (node, recurse) {
            recurse(node.body);
        },
        ReturnStatement: function (node, recurse) {
            recurse(node.argument);
        }
        // default: function (node, recurse) {
        //     recurse(node)
        // }
    });

    function walkNext() {
        return;
    }

    return 1;
};


DefUseAnalyzer.prototype.isRuled = function (callee) {
    var blackList = ['navigateTo', 'redirectTo', 'console.log', 'console.error', 'console.dir', 'navigateBack', 'switchTab', 'showToast', 'Math.', 'JSON.stringify',
        'parseInt', 'parseFloat', 'setTimeout', 'setStorage', 'getStorage', 'callback', 'setData', 'setInterval', '.then'
    ]
    for (var idx in blackList) {
        if (callee.indexOf(blackList[idx]) > -1 && callee.length < 32)
            return false;
    }
    return true;

    // var whiteList = ['request', 'get', 'post', 'send', 'http', 'ajax', 'fetch'] 
    // for (var idx in whiteList) {
    //     if (callee.indexOf(whiteList[idx]) > -1)
    //         return true;
    // }
    // return false;
}


DefUseAnalyzer.prototype.isRequest = function (callExpression, filename) {

    var callee = escodegen.generate(callExpression.callee);

    if (!this.isRuled(callee)) {
        return
    }

    var url = '',
        data = '',
        success = [];
    var IDF_data = {};
    var idents = new Set();

    // Case 1: wx.request({ url: '', data: '', success: function(e) {}});
    if (callExpression.arguments && callExpression.arguments.length && callExpression.arguments[0].type === 'ObjectExpression') {
        let functionNode;
        // if(this.isRuled(callee)) 
        callExpression.arguments[0].properties.forEach(property => {
            if (property.key.name == 'url') {
                url = escodegen.generate(property.value);
                this.getIdents(property.value).forEach(ident => {
                    idents.add(ident);
                })
            } else if (property.key.name == 'data' || property.key.name == 'formData') {
                data = escodegen.generate(property.value);
                this.getIdents(property.value).forEach(ident => {
                    idents.add(ident);
                })
            } else if (property.key.name == 'success' && (property.value.type == 'FunctionExpression' || property.value.type == 'ArrowFunctionExpression')) {
                functionNode = property.value;
                [success, IDF_data] = this.getSuccessData(functionNode);
            }
        });

        var blackList = ['wx.', 'swan.', 'my.', 'tt.', '.login']
        var label = 0;
        for (let i = 0; i < blackList.length; i++) {
            if (callee.indexOf(blackList[i]) != -1) {
                label = -1;
                break
            }
        }
        if (url === '' && success.length && label === 0) {
            url = callee;
        }

        this.recordRequestInfo(callExpression, idents, url, data, success, functionNode, IDF_data, filename);

    } else if (callExpression.arguments && callExpression.arguments.length && callExpression.arguments[0].type === 'FunctionExpression' &&
        callExpression.callee.type === 'MemberExpression' && callExpression.callee.object.type === 'CallExpression' && callExpression.callee.property.name === 'then') {
        // Case 2: a.get(...).then(function(t){})
        let innerCallExpression = callExpression.callee.object;
        let functionNode;
        // if(this.isRuled(callee)) 
        innerCallExpression.arguments.forEach(argument => {
            url += escodegen.generate(argument) + '; ';
            this.getIdents(argument).forEach(ident => {
                idents.add(ident);
            })
        });

        functionNode = callExpression.arguments[0];
        [success, IDF_data] = this.getSuccessData(functionNode);

        this.recordRequestInfo(callExpression, idents, url, data, success, functionNode, IDF_data, filename);

    } else if (callExpression.arguments && callExpression.arguments.length) {
        // Case 3: a.request('...', '...', {data: '...', success: function(e){}})
        var flag = 0;
        callExpression.arguments.forEach(argument => {
            if (argument.type === 'ObjectExpression') {
                argument.properties.forEach(property => {
                    if (property.key.name === 'success' && property.value.type === 'FunctionExpression') {
                        functionNode = property.value;
                        [success, IDF_data] = this.getSuccessData(functionNode);

                        flag = 1;
                    } else {
                        data += escodegen.generate(property.value) + '; ';
                        this.getIdents(property.value).forEach(ident => {
                            idents.add(ident);
                        })
                    }
                })
            } else if (argument.type === 'FunctionExpression' && flag === 0) {
                // Case 4: a.get('...', {...}, function(e){})
                functionNode = argument;
                [success, IDF_data] = this.getSuccessData(functionNode);

                flag = 1;
            } else {
                url += escodegen.generate(argument) + '; ';
                this.getIdents(argument).forEach(ident => {
                    idents.add(ident);
                })
            }
        })

        if (flag === 1) {
            this.recordRequestInfo(callExpression, idents, url, data, success, functionNode, IDF_data, filename);
        }
    }
}


DefUseAnalyzer.prototype.recordRequestInfo = function (callExpression, idents, url, data, success, functionNode, IDF_data, filename) {
    var loc = JSON.stringify(callExpression.loc).replaceAll('"', '')
    var request_id = 'request__' + callExpression._id + '__Loc__' + loc;

    // console.log('...........................................')
    // console.log(filename)
    // console.log(escodegen.generate(callExpression.callee))
    var dependencies = this.clearDependencies(callExpression.input, idents);
    var type = 'normal';

    if (url) {
        url_IDF = this.findIDFelseNormal(null, url);
        if (url_IDF.length > 0) {
            dependencies['url'] = url_IDF;
        }
        if (data) {
            data_IDF = this.findIDFelseNormal(null, data);
            if (data_IDF.length > 0)
                dependencies['data'] = data_IDF;
        }

        type = 'request';
        this.addRequestData(request_id, {
            'parent': filename,
            'content': {
                'url': url,
                'data': data,
                'success': success
            },
            'dependencies': dependencies
        }, IDF_data);
    }

    // a.call({ success: function(e){} })
    if (success && functionNode) {
        // console.log(functionNode._id, callExpression._id)
        this.addFunctionToCallMap(functionNode._id, {
            'id': callExpression._id,
            'loc': loc,
            'callee': escodegen.generate(callExpression.callee),
            'dependencies': dependencies,
            'type': type
        });
    }
}

DefUseAnalyzer.prototype.clearDependencies = function (input, idents) {
    dependencies = {}
    for (let i = 0; i < idents.size; i++) {
        ident = idents._values[i];
        // console.log(ident, input[ident])
        // console.log(typeof input[ident])
        if (input && ident in input && typeof input[ident] === 'object' && 'length' in input[ident]) {

            dependencies[ident] = input[ident];
            input[ident].forEach(dependency => {
                if ('idents' in dependency) {
                    dependency['idents'].forEach(ident => {
                        idents.add(ident);
                    })
                }
            })
        }
    }
    return dependencies;
}


DefUseAnalyzer.prototype.getSuccessData = function (functionNode) {

    var successData = [];
    var functionBody = escodegen.generate(functionNode.body);

    if (functionNode.params && functionNode.params.length) {
        for (var i = 0; i < functionNode.params.length; i++) {
            var param = functionNode.params[i];
            if (param && param.name) {
                let regex = RegExp(param.name + '\\.[\\w\\.]+', 'g');

                let match;
                while ((match = regex.exec(functionBody)) !== null) {
                    successData.push(match[0]);
                }

                let regex2 = RegExp('\\.[\\w\\.]+ = ' + param.name + '\\.[\\w\\.]+', 'g')
                let match2;
                while ((match2 = regex2.exec(functionBody)) !== null) {
                    data = match2[0].split(' = ')[0]
                    successData.push(data);
                }

                let regex3 = RegExp('[\\w\\.]+\: ' + param.name + '\\.[\\w\\.]+', 'g')
                let match3;
                while ((match3 = regex3.exec(functionBody)) !== null) {
                    data = match3[0].split(': ')[0]
                    successData.push(data);
                }
            }
        }
    }


    IDF_data = {
        'globalData': [],
        'storage': [],
        'storageSync': [],
        'isValid': false
    }
    const regex_1 = /\.globalData\.([\.\w]+) *=/g;
    const regex_2 = /\.setStorageSync\(['"](\w+)['"],/g;
    const regex_3 = /key:\s*['"](\w+)['"]/g;
    let match;

    if (functionBody.indexOf('.globalData') > -1) {
        while ((match = regex_1.exec(functionBody)) !== null) {
            IDF_data['globalData'].push(match[1]);
            IDF_data['isValid'] = true;
        }
    } else if (functionBody.indexOf('setStorageSync') > -1) {
        while ((match = regex_2.exec(functionBody)) !== null) {
            IDF_data['storageSync'].push(match[1]);
            IDF_data['isValid'] = true;
        }
    } else if (functionBody.indexOf('setStorage') > -1) {
        while ((match = regex_3.exec(functionBody)) !== null) {
            IDF_data['storage'].push(match[1]);
            IDF_data['isValid'] = true;
        }
    }

    // console.log(IDF_data)
    return [successData, IDF_data];
}

var singleton = new DefUseAnalyzer();
module.exports = singleton;