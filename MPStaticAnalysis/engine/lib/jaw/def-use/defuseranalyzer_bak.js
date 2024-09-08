/*
 * New version of Def-Use analyzer
 */
var varDefFactory = require('./vardeffactory'),
    defFactory = require('./deffactory'),
    varfactory = require('./varfactory'),
    dupairFactory = require('./dupairfactory'),
    pairFactory = require('./pairfactory'),
    scopeCtrl = require('./../scope/scopectrl'),
    modelCtrl = require('./../model/modelctrl'),
    FlowNode = require('../../esgraph/flownode'),
    loggerModule = require('./../../../core/io/logging'),
    constantsModule = require('./../constants');
    copy = require('lodash'),
    escodegen = require('escodegen'); 

var Set = require('../../analyses/set'),
    walkes = require('walkes'),
    worklist = require('../../analyses'),
    Map = require('core-js/es6/map');

const util = require('util');
const Var = require('./var');


/**
 * DefUseAnalyzer
 * @constructor
 */
function DefUseAnalyzer() {
    "use strict";
    /* start-test-block */
    this._testonly_ = {
    };
    /* end-test-block */
}


DefUseAnalyzer.prototype.getIdents = function (node) {
    var idents = []
    walkes(node, {
        Identifier: function (node, recurse) {
            idents.push(node.name)
        },
        MemberExpression: function (node, recurse) {
            recurse(node.object);
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


DefUseAnalyzer.prototype.findIDFelseNormal = function (node) {
    var varDef = []
    const regex_1 = /\.globalData\.(\w+)/g;
    const regex_2 = /\.getStorageSync\("(\w+)"\)/g;
    const regex_3 = /key:\s*"(\w+)"/g;
    let match;
    
    var right;
    if(node.type === 'AssignmentExpression') {
        right = node.right;
    } else if(node.type === 'VariableDeclarator') {
        right = node.init;
    } else if(node.type === 'Property') {
        right = node.value;
    }

    let raw = escodegen.generate(right);

    if(raw.indexOf('.globalData') > -1) {
        while ((match = regex_1.exec(raw)) !== null) {
            varDef.push({'type': 'globalData', 'value': match[1]});
        }           
    } else if(raw.indexOf('getStorageSync') > -1) {
        while ((match = regex_2.exec(raw)) !== null) {
            varDef.push({'type': 'getStorageSync', 'value': match[1]});
        }   
    } else if(raw.indexOf('getStorage') > -1) {
        while ((match = regex_3.exec(raw)) !== null) {
            varDef.push({'type': 'getStorage', 'value': match[1]});
        }   
    } 
    
    if(varDef.length === 0) {
        varDef = [{'type': 'normal', 'node': node, 'value': 'raw', 'idents': []}]
    }
    return varDef;
}


DefUseAnalyzer.prototype.findGENSet = function (node) {
    var generatedVarDef = {};
    var killedVarDef = [];
    if(node.type === 'AssignmentExpression') {
        if(node.left.type === 'Identifier' && node.operator === '=') {
            killedVarDef.push(node.left.name);
            generatedVarDef[node.left.name] = this.findIDFelseNormal(node);
        } else {
            var definedVar = (node.left.type === 'MemberExpression') ? node.left.object.name : node.left.name;
            if (!!definedVar) {
                generatedVarDef[definedVar] = this.findIDFelseNormal(node)
            }
        }
    } if(node.type === 'VariableDeclarator') {
        if(node.id.type === 'Identifier') {
            var definedVar = node.id.name;
            killedVarDef.push(node.id.name);
            generatedVarDef[node.id.name] = this.findIDFelseNormal(node);
        }
    } else if(node.type === 'Property') {
        if (node.key.type === 'Identifier') {
            var definedVar = node.key.name;
            generatedVarDef[definedVar] = this.findIDFelseNormal(node);
        }
    } else if(node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
        if(node.params && node.params.length){
            for(var i = 0; i < node.params.length; i++){
                var param = node.params[i];
                if(param && param.name){
                    killedVarDef.push(param.name);
                    generatedVarDef[param.name] = [{'type': 'parameter', 'node': node}];
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
        if(name in input) {
            output[name] = [];
        }
    })
    for(var name in gen) {
        if(name in input) {
            // console.log(output[name])
            // console.log(gen[name])
            output[name] = [...output[name], ...gen[name]];
        } else {
            output[name] = gen[name];
        }
    }
    return output;
}


DefUseAnalyzer.prototype.merge = function (input1, input2) {
    var output = copy.cloneDeep(input1);
    for(var name in input2) {
        if(name in input1) {
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
DefUseAnalyzer.prototype.doAnalysis = function (functionNode) {
    
    "use strict";
    var thisAnalyzer = this;
    var output_prev = copy.cloneDeep(functionNode.output);
    // // console.log(output_prev)
    walkes(functionNode.astNode, {
        Literal: walkNext,
        Identifier: walkNext,
        MemberExpression: walkNext,
        BinaryExpression: walkNext,
        LogicalExpression: walkNext,
        ThisExpression: walkNext,
        UpdateExpression: walkNext,
        ThrowStatement: walkNext,
        AssignmentExpression: function (node, recurse) {
            // console.log('AssignmentExpression')
            node.input = copy.cloneDeep(output_prev);
            let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(node);
            node.output = thisAnalyzer.transferFunction(node.input, generatedVarDef, killedVarDef)
            recurse(node.right);
            output_prev = copy.cloneDeep(node.output);
            //console.log(output_prev)
        },
        VariableDeclaration: function (node, recurse) {
            // console.log('VariableDeclaration')
            node["declarations"].forEach(recurse);
        },
        VariableDeclarator: function (node, recurse) {
            // console.log('VariableDeclarator')
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
            // console.log('IfStatement')
            var output_prev_current = copy.cloneDeep(output_prev);
            var output_prev_merge = {};
            node.input = copy.cloneDeep(output_prev);
            
			recurse(node.consequent);
            output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);
			if (node.alternate) {
                output_prev = copy.cloneDeep(output_prev_current);
				recurse(node.alternate);
                output_prev_merge = thisAnalyzer.merge(output_prev_merge, output_prev);
            }
            node.output = output_prev_merge;
            // // console.log(node.output)
            output_prev = copy.cloneDeep(node.output);
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
            recurse(node.expression);
        },
        BlockStatement: function (node, recurse) {
            // console.log('BlockStatement')
            node.body.forEach(recurse);
        },
        SequenceExpression: function (node, recurse) {
            // console.log('SequenceExpression')
            node.expressions.forEach(expression => {
                recurse(expression);
            })
        },
        CallExpression: function (node, recurse) {
            // console.log('CallExpression')
            // console.log('\n###############################################')
            // console.log(escodegen.generate(node.callee))
            // console.log(output_prev)
            node.input = copy.cloneDeep(output_prev);
            recurse(node.callee);
            node["arguments"].forEach(recurse);
        },
        ArrayExpression: function (node, recurse) {
            node["elements"].forEach(recurse);
        },
        ObjectExpression: function (node, recurse) {
            node.input = copy.cloneDeep(output_prev);
            // console.log('ObjectExpression')
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
        },
		FunctionDeclaration: function (node, recurse) {
            // console.log('FunctionDeclaration')
            node.input = copy.cloneDeep(output_prev);
            let [generatedVarDef, killedVarDef] = thisAnalyzer.findGENSet(node);
            node.output = thisAnalyzer.transferFunction(node.input, generatedVarDef, killedVarDef);
            output_prev = copy.cloneDeep(node.output);

            recurse(node.body);
        },
		FunctionExpression: function (node, recurse) {
            // console.log('FunctionExpression')
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
            // console.log('ReturnStatement')
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


var singleton = new DefUseAnalyzer();
module.exports = singleton;
