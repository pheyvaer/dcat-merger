global.verbose = false;
global.maxTimeout = 1000.00;

var loader = require('./lib/loader.js');
var writer = require('./lib/writer.js');
var cataloger = require('./lib/cataloger.js');
var N3 = require('n3');

var outputFile;
var outputFileIndex;
var errorMessage = "Incorrect parameter usage.";

var badExit = function(){
    console.log(errorMessage);
    process.exit(1);
}


process.argv.forEach(function (val, index, array) {
	if (val === "-o") {
		if (outputFileIndex || index == array.length - 1) {
			badExit();
		} else {
			outputFileIndex = index + 1;
		}
	} 

	if (val === "-v") {
		global.verbose = true;
	}

  	if (index === outputFileIndex) {
		if (val === "-o" || val === "-v") {
			badExit();
		}

		outputFile = val;
	}
});

console.log("Loading & parsing started ");
loader.load().then(function(store){
	console.log("Loading & parsing finished");

	if (global.verbose) {
		console.log("Cataloging started");
	} else {
		process.stdout.write("Cataloging ... ");
	}
	cataloger.catalog(store, verbose).then(function(cStore){
		if (global.verbose) {
			console.log("Cataloging finished");
		} else {
			console.log("done");
		}

		if (global.verbose) {
			console.log("Writing to '" + outputFile + "' started");
		} else {
			process.stdout.write("Writing to '" + outputFile + "' ... ");
		}

		writer.write(cStore, outputFile);

		if (global.verbose) {
			console.log("Writing to '" + outputFile + "' finished");
		} else {
			console.log("done");
		}
	});
});
