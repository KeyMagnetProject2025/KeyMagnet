/*
 * DefUseAnalysisExecutor module
 */
var jsParser = require('../parser/jsparser'),
	scopeCtrl = require('../scope/scopectrl'),
	modelCtrl = require('../model/modelctrl'),
	modelBuilder = require('../model/modelbuilder'),
	defuseAnalyzer = require('./defuseanalyzer_new'),
	variableAnalyzer = require('./variableanalyzer'),
    flownodefactory = require('./../../esgraph/flownodefactory'), 
    constantsModule = require('./../constants'),
    factoryModel = require('../model/modelfactory');
    loggerModule = require('./../../../core/io/logging');

const { performance } = require('perf_hooks');

function DefUseAnalysisExecutor() {
}

/* start-public-methods */
/**
 * Initialize
 * @param {Array} codeOfPages Source code of each page
 */
DefUseAnalysisExecutor.prototype.initialize = function (codeOfPages) {
	"use strict";
	if (codeOfPages instanceof Array) {
		codeOfPages.forEach(function (code) {
			var ast = jsParser.parseAST(code, {range: true, loc: true, tolerant: constantsModule.tolerantMode});
            jsParser.traverseAST(ast, function(node){
                if(node && node.type){
                    let _id = flownodefactory.count;
                    // if(flownodefactory.generatedExits.some(e => e.id == _id)){ // this statement is slow because of some(), replace with dictonary key lookup
                    if(_id in flownodeFactory.generatedExitsDict){
                         flownodefactory.count= flownodefactory.count + 1; 
                         _id = flownodefactory.count    
                    }
                    node._id = _id;
                    flownodefactory.count= flownodefactory.count + 1;           
                }
            });
			scopeCtrl.addPageScopeTree(ast);
		});
		modelCtrl.initializePageModels();
        variableAnalyzer.setLocalVariables(scopeCtrl.domainScope);
        scopeCtrl.pageScopeTrees.forEach(function (pageScopeTree) {
            pageScopeTree.scopes.forEach(function (scope) {
                variableAnalyzer.setLocalVariables(scope);
            });
        });
	}
};


// const { spawn } = require('child_process');
// const { StaticPool } = require('node-worker-threads-pool');

DefUseAnalysisExecutor.prototype.buildIntraProceduralAnalysis = function () {
    "use strict";
    
	scopeCtrl.pageScopeTrees.forEach(function (scopeTree) {
		scopeTree.scopes.forEach(function (scope) {
			var model = factoryModel.create();

			try {
				if (scope.ast.type === 'FunctionDeclaration' || scope.ast.type === 'FunctionExpression') {
					model.graph = scope.ast.body;
				} else {
                    // Program
					model.graph = scope.ast;
				}
			} catch (error) {
				// PASS
				// CFG Generation Error.
				model.graph = null;
			}
            defuseAnalyzer.doAnalysis(model)
		});
	});
};

/**
 * Build model graphs for each intra-procedural model in every PageModels
 */
DefUseAnalysisExecutor.prototype.buildIntraProceduralModelsOfEachPageModels = function () {
	"use strict";

	modelBuilder.buildIntraProceduralModels(); // CFG

    constantsModule.staticModelPrintPhases && console.log('PDG start')
    defuseAnalyzer.initiallyAnalyzeIntraProceduralModels();
    
    modelCtrl.collectionOfPageModels.forEach(function (pageModels) {
        pageModels.intraProceduralModels.forEach(function (model) {
            defuseAnalyzer.doAnalysis(model);
            defuseAnalyzer.findDUPairs(model);

        });
    });

    // put a min timeout budget for PDG 
    // var startTime = performance.now();
    // var timeout = 10 * 1000; // minimum 10 secs
    // for(let pageModels of Array.from(modelCtrl.collectionOfPageModels.values())){
    //     for(let model of pageModels.intraProceduralModels){

    //         defuseAnalyzer.doAnalysis(model);
    //         defuseAnalyzer.findDUPairs(model);

    //         if(performance.now() - startTime > timeout){
    //             constantsModule.staticModelPrintPhases && console.log('breaking loop');
    //             return 1;
    //         }
    //     }          
    // }


    // const pool = new StaticPool({
    //     size: 1,
    //     task: (model) => {
    //         defuseAnalyzer.doAnalysis(model);
    //         defuseAnalyzer.findDUPairs(model);
    //     }, 
    // });

    // var startTime = performance.now();
    // var timeout = 5 * 60 * 1000; // min 5 min
    // for(let pageModels of Array.from(modelCtrl.collectionOfPageModels.values())){
    //     for(let model of pageModels.intraProceduralModels){
     
    //         pool
    //           .createExecutor()
    //           .setTimeout(timeout) // set timeout for task.
    //           .exec(model);
    //     }          
    // }


    constantsModule.staticModelPrintPhases && console.log('PDG end')
    return 1;
};

DefUseAnalysisExecutor.prototype.buildInterProceduralModelsOfEachPageModels = function () {
    "use strict";

    
    modelBuilder.buildInterProceduralModels();  // CFG

    modelCtrl.collectionOfPageModels.forEach(function (pageModels) {
        pageModels.interProceduralModels.forEach(function (model) {

            defuseAnalyzer.doAnalysis(model);
            defuseAnalyzer.findDUPairs(model);
        });
    });
    
};


/* start-public-methods */

var analysisExecutor = new DefUseAnalysisExecutor();
module.exports = analysisExecutor;