var N3 = require('n3');
var fs = require('fs');
var Q = require('q');
var SparqlClient = require('sparql-client');
var sparqlEndpoint = 'http://dbpedia.org/sparql';

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
				console.log('themeMatcher: loading is done');
				loadingDone = true;
			}
		});		
	}
});

var getUpperClasses = function(concept) {
	var deferred = Q.defer();
	var query = "SELECT ?c FROM <http://dbpedia.org> WHERE {"
	             + "<" + concept + "> rdfs:subClassOf+ ?c "
	             + "}";

	var client = new SparqlClient(sparqlEndpoint);

	var f = function(){
	client.query(query).execute(function(error, response){
			var results = [];
	  		response.results.bindings.forEach(function(binding){
	        	results.push(binding.c.value);
	    	});

			deferred.resolve(results);
		});
	};

	setTimeout(f, Math.random()*global.maxTimeout);

	return deferred.promise;
};

var match = module.exports.match = function(concept) {
	var deferred = Q.defer();
	
	if (loadingDone) {
		getUpperClasses(concept).then(function(allClasses){
			var results = []
			allClasses.push(concept);

			allClasses.forEach(function(c){
				var themes = themeStore.find(c, "http://www.w3.org/2004/02/skos/core#closeMatch", null);
		
			    themes.forEach(function(theme){
					results.push(theme.object);
				});
			});

			deferred.resolve(results);
		});
	} else {
		console.log('loading was not done yet ...'.red);
		process.exit(1);
	}

	return deferred.promise;
}
