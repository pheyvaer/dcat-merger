var loader = require('./lib/loader.js');
var writer = require('./lib/writer.js');
var cataloger = require('./lib/cataloger.js');
var N3 = require('n3');

var outputFile;

process.argv.forEach(function (val, index, array) {
  	if (index === 2) {
		outputFile = val;
		console.log(outputFile);
	}
});

loader.load().then(function(store){
	var cStore = cataloger.catalog(store);

//	allTriples = cStore.find(null, null, null);

//	console.log(allTriples.length);
//	allTriples.forEach(function(triple){
//		console.log(triple.subject);
//	});

	writer.write(cStore, outputFile);
});
