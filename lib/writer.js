var fs = require('fs');

var write = module.exports.write = function(store, outputFile) {
	var triples = store.find(null, null, null);
	
	var wstream;

	if (outputFile) {
		wstream = fs.createWriteStream(outputFile);
	} else {
		//wstream = fs.createWriteStream(unix_error_log_root + "access.log", { flags: 'a' });
		wstream = process.stdout;
		wstream.write("===== OUTPUT =====\n");
	}

	triples.forEach(function(triple){
	    wstream.write(triple.subject + " " + triple.predicate + " " + triple.object + " .\n");
	});
}
