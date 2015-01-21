var Q = require('q');
var ldf = require('ldf-client');
var config = require('../config.json');
ldf.Logger.setLevel("warning");


var getUpperClasses = module.exports.getUpperClasses = function(concept) {
	var deferred = Q.defer();
	var query = "SELECT ?c WHERE {"
	             + "<" + concept + "> <http://www.w3.org/2000/01/rdf-schema#subClassOf> ?c ."
	             + "}";

	var client = new ldf.FragmentsClient(config.sparqlendpoint);
	var iterator = new ldf.SparqlIterator(query, {fragmentsClient: client});
	var results = [];

	var cb = function(data){
			results.push(data['?c']);
	};

	var end = function(){
		deferred.resolve(results);
	};

	iterator.on('data', cb);
	iterator.on('error', console.log);
	iterator.on('end', end);
	
	return deferred.promise;
};

var getClasses = module.exports.getClasses = function(uri) {
    var deferred = Q.defer();
    var query = "SELECT ?c WHERE {"
                + "<" + uri + "> a ?c ."
                + "FILTER regex (?c, '^http:\/\/dbpedia.org\/ontology|http://schema.org')"
                + "}";


    var client = new ldf.FragmentsClient(config.sparqlendpoint);
	var iterator = new ldf.SparqlIterator(query, {fragmentsClient: client});
	var results = [];

	var cb = function(data) {
			results.push(data['?c']);
	};

	var end = function() {
		deferred.resolve(results);
	};

	iterator.on('data', cb);
	iterator.on('end', end);

    return deferred.promise;
}
