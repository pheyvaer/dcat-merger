var Q = require('q');
var SparqlClient = require('sparql-client');
var sparqlEndpoint = 'http://dbpedia.org/sparql';

var getUpperClasses = module.exports.getUpperClasses = function(concept) {
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
