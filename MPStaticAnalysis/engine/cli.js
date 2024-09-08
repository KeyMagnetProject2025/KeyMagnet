const constantsModule = require('./lib/jaw/constants');
const GraphExporter = require('./core/io/graphexporter');
const CLIModule = require('./core/cli/cli');
const SourceReader = require('./core/io/sourcereader');
const fs = require("fs");
const pathModule = require('path');

function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

/**
 * HPGContainer
 * @constructor
 */
function HPGContainer() {
	"use strict";
	// re-instantiate every time
	this.api = require('./model_builder');
	this.scopeCtrl = require('./lib/jaw/scope/scopectrl');
	this.modelCtrl = require('./lib/jaw/model/modelctrl');
	// this.modelBuilder = require('./lib/jaw/model/modelbuilder');
	this.scopeCtrl.clear();
	this.modelCtrl.clear();
}


/**
 * UUIDv4 generator
 */
function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}


/**
 * main
 */
(async function main() {

	const args = CLIModule.readArgvInput();

	// prepare graph id
	const graphid = (args.graphid === '') ? 'graph-' + uuidv4() : args.graphid;

	// do the code preprocessing by default
	const do_preprocessing = (args.preprocess.toLowerCase() === 'false') ? false : true;

	// input language
	if (args.lang !== constantsModule.LANG.js && args.lang !== constantsModule.LANG.python && args.lang !== constantsModule.LANG.php) {
		console.log("[-] error: unsupported language " + args.lang);
		process.exit()
	}

	// prepare output location
	const outputDirectory = args.output;
	if (!fs.existsSync(outputDirectory)) {
		fs.mkdirSync(outputDirectory, {
			recursive: true
		});
	}

	// prepare input and initialize models
	const inputFiles = (args.input && Array.isArray(args.input)) ? args.input : [args.input];

	let hpgContainer = new HPGContainer();
	// build the graph
	for (let i = 0; i < inputFiles.length; i++) {
		let filename = inputFiles[i];
		try {
			let code = await SourceReader.getSourceFromFile(filename);
			await hpgContainer.api.initializeModelsFromSource(filename, code, args.lang, do_preprocessing) /* args.lang: only JS is supported at the moment */
		} catch (err) {
			console.error(`Error reading file: ${err.message}`);
		}
	}

	await hpgContainer.api.buildInitializedModels();

	// { 'nodes': g_nodes, 'edges': g_edges, 'functionMap': functionMap }
	const graph = await hpgContainer.api.buildHPG({
		'ipcg': true,
		'erddg': true,
		'output': args.output
	});

	// export to disk
	// if(args.mode === 'graphML'){
	// 	await GraphExporter.exportToGraphML(graph, graphid, args.output);
	// } else{
	// 	await GraphExporter.exportToCSV(graph, graphid, args.output);
	// }
})();