var fs = require('fs');

var write = module.exports.write = function(store, outputFile) {
	var triples = store.find(null, null, null);
		
	if (outputFile) {
		var wstream = fs.createWriteStream(outputFile);

		triples.forEach(function(triple){
		     wstream.write(triple.subject + " " + triple.predicate + " " + triple.object + " .\n");

		});
	} else {
		//no output file is specified, so we write to stdout
		console.log("====== OUTPUT =====");
		
		triples.forEach(function(triple){
			console.log(triple.subject, triple.predicate, triple.object, ".");
		});
	}
}
