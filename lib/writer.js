var fs = require('fs');
var validator = require('validator');

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
		var subject = goodURI(triple.subject);
		var object = goodURI(triple.object);
		var predicate = goodURI(triple.predicate);
		
	    wstream.write(subject + " " + predicate + " " + object + " .\n");
	});
}

var goodURI = function(uri) {
	if (validator.isURL(uri)) {
		return "<" + uri + ">";
	} else {
		return uri;
	}
}
