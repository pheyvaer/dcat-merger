var N3 = require('n3');
var spotlight = require('dbpedia-spotlight');
var colors = require('colors');
var Q = require('q');
var ThemeMatcher = require('./themeMatcher.js');
var SpatialDetector = require('./spatialDetector.js');
var Util = require('./utilities.js');
var config = require('../config.json');
var store = N3.Store();

spotlight.configEndpoints(config.spotlightEndpoints);

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

		var themes = loadStore.find(ds.subject, prefixes.dcat + "theme", null);

		themes.forEach(function(theme){
			store.addTriple(theme.ds, theme.predicate, theme.object);
		});

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
					parseAnnotation(output.response.Resources, dataset).then(function(){
						dDeferred.resolve();
					});
				} else {
					if (global.verbose) {
						var str = 'No resources where found for the description "' + description  + '" of ' + dataset.subject + ".";
						console.log(str.yellow);
					}

					dDeferred.resolve();
				}
			};

	        setTimeout(t, Math.random()*global.maxTimeout);
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
				parseAnnotation(output.response.Resources, dataset).then(function(){
					rDeferred.resolve();
				});
			} else {
		        if (global.verbose) {
					var str = "No resources where found for keyword '" + keyword + "' for " + dataset.subject + ".";
		    		console.log(str.yellow);
				}

				rDeferred.resolve();
			}

			});
		};
		
		//we use this to introduce some latency between the request, because there is a query limit at DBpedia
		setTimeout(t, Math.random()*global.maxTimeout);
	});

	Q.all(promises).then(function(){
		deferred.resolve();
	});

	return deferred.promise;
};

var parseAnnotation = function(annotation, dataset) {
	var deferred = Q.defer();
	var promises = []

	annotation.forEach(function(resource) {
	    var uri = resource['@URI'];
		store.addTriple(dataset.subject, prefixes.dc + "subject", uri);
		var tDeferred = Q.defer();
		promises.push(tDeferred.promise);

		Util.getClasses(uri).then(function(results){
			var rPromises = [];

	        results.forEach(function(result){
				var rDeferred = Q.defer();
				rPromises.push(rDeferred.promise);

				var xPromises = [];
				var x1Deferred = Q.defer();
				var x2Deferred = Q.defer();
				xPromises.push(x1Deferred.promise);
				xPromises.push(x2Deferred.promise);

				ThemeMatcher.match(result).then(function(themes){
					themes.forEach(function(theme){
						store.addTriple(dataset.subject, prefixes.dcat + "theme", theme);
					});
					
					x1Deferred.resolve();
				});

				SpatialDetector.detect(result).then(function(isSpatial){
					if (isSpatial) {
						store.addTriple(dataset.subject, prefixes.dc + "spatial", uri);
					}

					x2Deferred.resolve();
				});
				
				Q.all(xPromises).then(function(){
					rDeferred.resolve();
				});

			});

			Q.all(rPromises).then(function(){
				tDeferred.resolve();
			});
   		 });
	});

	Q.all(promises).then(function(){
		deferred.resolve();				
	});

	return deferred.promise;
};
