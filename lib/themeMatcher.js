var N3 = require('n3');
var fs = require('fs');

var themeStore = N3.Store();
var loadingDone = false;

fs.readFile('resources/mappingDBpediaTDTTaxonomy.ttl', {encoding: "utf8"}, function(err, data){
	if (err) {
	    console.log("Required file for themeMatcher was not found.");
		process.exit(1);
	} else {
		var parser = N3.Parser();
		parser.parse(data, function(error, triple, prefixes){
			if (triple) {
				themeStore.addTriple(triple.subject, triple.predicate, triple.object);
			} else {
				loadingDone = true;
			}
		});		
	}
});

var match = module.exports.match = function(concept) {
	var results = [];

	if (loadingDone) {
		var themes = themeStore.find(concept, "http://www.w3.org/2004/02/skos/core#closeMatch", null);
		
		themes.forEach(function(theme){
			results.push(theme.object);
		});	

	} else {
		console.log('loading was not done yet ...'.red);
	}

	return results;
}
