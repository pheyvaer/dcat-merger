var Q = require('q');
var Util = require('./utilities.js');

var detect = module.exports.detect = function(resourceClass) {
	var deferred = Q.defer();
	
	Util.getUpperClasses(resourceClass).then(function(allClasses){
		var results = [];
		allClasses.push(resourceClass);

		var i = 0;

		while(i < allClasses.length && allClasses[i] != "http://dbpedia.org/ontology/Place") {
			i ++;
		}

		deferred.resolve(i < allClasses.length);
	});

	return deferred.promise;
}
