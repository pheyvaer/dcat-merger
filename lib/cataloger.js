var N3 = require('n3');
var spotlight = require('dbpedia-spotlight');
var colors = require('colors');
var SparqlClient = require('sparql-client');
var sparqlEndpoint = 'http://dbpedia.org/sparql';
var Q = require('q');
var ThemeMatcher = require('./themeMatcher.js');

var maxTimeout = 10000.00;
var store = N3.Store();

var prefixes = {
	dcat : "http://www.w3.org/ns/dcat#",
	dc : "http://purl.org/dc/terms/",
	foaf : "http://xmlns.com/foaf/0.1/",
	rdf : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	xsd : "http://www.w3.org/2001/XMLSchema#"
};

var catalogURI = "http://www.example.com/api/dcat";

var catalog = module.exports.catalog = function(loadStore){
	//add our own catalog
	store.addTriple(catalogURI, prefixes.rdf + "type", prefixes.dcat + "Catalog");
	//add title to our catalog
	store.addTriple(catalogURI, prefixes.dc + "title", "\"Merged DCAT\"");
	//add description to our catalog
	store.addTriple(catalogURI, prefixes.dc + "description", "\"The result DCAT of the DCAT Merger.\"");
	//add themeTaxonomy to our catalog
	store.addTriple(catalogURI, prefixes.dcat + "themeTaxonomy", "http://ns.thedatatank.com/dcat/themes#Taxonomy");
	//add issued to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "issued", "");
	//add modified to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "modified", "");
	//add language to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "language", "");
	//add license to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "license", "");
	//add rights to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "rights", "");
	//add spatial to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "spatial", "");
	//add homepage to our catalog
	//store.addTriple(catalogURI, prefixes.foaf + "homepage", "");
	
	//we link all loaded datasets to the newly created catalog
	var allDatasets = loadStore.find(null, prefixes.rdf + "type", prefixes.dcat + "Dataset");
	
	var deferred = Q.defer();
	var promises = [];

	allDatasets.forEach(function(ds){
		var dDeferred = Q.defer();
		promises.push(dDeferred.promise);

		store.addTriple(catalogURI, prefixes.dcat + "dataset", ds.subject);

		getConcept(loadStore, ds).then(function(){
			dDeferred.resolve();
		});
	});

	Q.all(promises).then(function(){
		deferred.resolve(store);
	});

	return deferred.promise;
};

var getConcept = function(loadStore, dataset) {
	var deferred = Q.defer();
	var promises = [];

	var r = loadStore.find(dataset.subject, prefixes.dc + "description", null);
	

	if (r.length > 0) {
		var dDeferred = Q.defer();
		promises.push(dDeferred.promise);

		var description = N3.Util.getLiteralValue(r[0].object);

		spotlight.annotate(description, function(output){
			var t = function(){
				if (output.response.Resources) {
					output.response.Resources.forEach(function(resource) {
						getClasses(resource['@URI']).then(function(results){
							results.forEach(function(result){
								var theme = ThemeMatcher.match(result);
								store.addTriple(dataset.subject, prefixes.dcat + "theme", theme);
							});

							dDeferred.resolve();
						});
					});
				} else {
					if (global.verbose) {
						var str = 'No resources where found for the description "' + description  + '" of ' + dataset.subject + ".";
						console.log(str.red);
					}

					dDeferred.resolve();
				}
			};

	        setTimeout(t, Math.random()*maxTimeout);
		});
	}

	r = loadStore.find(dataset.subject, prefixes.dcat + "keyword", null);

	r.forEach(function(triple){
		var rDeferred = Q.defer();
		promises.push(rDeferred.promise);

		var t = function(){
			var keyword = N3.Util.getLiteralValue(triple.object);

			spotlight.annotate(keyword, function(output){
			if (output.response.Resources) {
				output.response.Resources.forEach(function(resource) {
				    getClasses(resource['@URI']).then(function(results){
				    	results.forEach(function(result){
							var theme = ThemeMatcher.match(result);
					    	store.addTriple(dataset.subject, prefixes.dcat + "theme", theme);
						});

						rDeferred.resolve();
					});
				});
			} else {
		        if (global.verbose) {
					var str = "No resources where found for keyword '" + keyword + "' for " + dataset.subject + ".";
		    		console.log(str.red);
				}

				rDeferred.resolve();
			}

			});
		};
		
		//we use this to introduce some latency between the request, because there is a query limit at DBpedia
		setTimeout(t, Math.random()*maxTimeout);
	});

	Q.all(promises).then(function(){
		deferred.resolve();
	});

	return deferred.promise;
};

var getClasses = function(uri) {
	var deferred = Q.defer();
	var query = "SELECT ?c FROM <http://dbpedia.org> WHERE {"
    			+ "<" + uri + "> a ?c "
				+ "FILTER regex (?c, '^http:\/\/dbpedia.org\/ontology|http://schema.org')"
				+ "}";

	var client = new SparqlClient(sparqlEndpoint);

	client.query(query).execute(function(error, response){
		var results = [];
		response.results.bindings.forEach(function(binding){
			results.push(binding.c.value);
		});

		deferred.resolve(results);
	});

	return deferred.promise;
}


