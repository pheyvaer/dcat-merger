var loader = require('./lib/loader.js');
var writer = require('./lib/writer.js');

var outputFile;

process.argv.forEach(function (val, index, array) {
  	if (index === 2) {
		outputFile = val;
	}
});

loader.load().then(function(store){
	writer.write(store, outputFile);
});
