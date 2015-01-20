var loader = require('./lib/loader.js');
var writer = require('./lib/writer.js');
var cataloger = require('./lib/cataloger.js');
var N3 = require('n3');

var outputFile;
var outputFileIndex;
global.verbose = false;
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

console.log("Loading & parsing ... ");
loader.load().then(function(store){
	console.log("Loading & parsing ... done");
	process.stdout.write("Cataloging ... ");
	cataloger.catalog(store, verbose).then(function(cStore){
		console.log("done");
		process.stdout.write("Writing to '" + outputFile + "' ... ");
		writer.write(cStore, outputFile);
		console.log("done");
	});
});
