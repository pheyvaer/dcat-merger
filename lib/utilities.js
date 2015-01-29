var Q = require('q');
var colors = require('colors');
var ldf = require('ldf-client');
ldf.Logger.setLevel("warning");

var config;
var spatialDetector;
var themeMatcher;

var setConfig = module.exports.setConfig = function(conf) {
	config = conf;
};

var getConfig = module.exports.getConfig = function(){
	return config;
};

var setSpatialDetector = module.exports.setSpatialDetector = function(sd) {
	spatialDetector = sd;
};

var getSpatialDetector = module.exports.getSpatialDetector = function() {
	return spatialDetector;
};

var setThemeMatcher = module.exports.setThemeMatcher = function(tm) {
	themeMatcher = tm;
};

var getThemeMatcher = module.exports.getThemeMatcher = function() {
	return themeMatcher;
};

var getUpperClasses = module.exports.getUpperClasses = function(concept) {
  var deferred = Q.defer();
  var query = "SELECT ?c WHERE {" + "<" + concept + "> <http://www.w3.org/2000/01/rdf-schema#subClassOf> ?c ." + "}";

  var client = new ldf.FragmentsClient(config.startFragment);
  var iterator = new ldf.SparqlIterator(query, {
    fragmentsClient: client
  });
  var results = [];

  var cb = function(data) {
    results.push(data['?c']);
  };

  var end = function() {
    if (results.length == 0) {
      deferred.resolve(results);
    } else {
      var promises = [];
      var allUpperClasses = [];

      results.forEach(function(result) {
        var rDeferred = Q.defer();
        promises.push(rDeferred.promise);
        getUpperClasses(result).then(function(upperClasses) {
          allUpperClasses.concat(upperClasses);
          rDeferred.resolve();
        });
      });

      Q.all(promises).then(function() {
        deferred.resolve(removeDuplicateElements(allUpperClasses.concat(results)));
      });
    }
  };

  iterator.on('data', cb);
  iterator.on('error', console.log);
  iterator.on('end', end);

  return deferred.promise;
};

var getClasses = module.exports.getClasses = function(uri) {
  var deferred = Q.defer();
  var query = "SELECT ?c WHERE {" + "<" + uri + "> a ?c ." + "FILTER regex (?c, '^http:\/\/dbpedia.org\/ontology|http://schema.org')" + "}";


  var client = new ldf.FragmentsClient(config.startFragment);
  var iterator = new ldf.SparqlIterator(query, {
    fragmentsClient: client
  });
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

var removeDuplicateElements = function(array) {
  newArray = [];

  array.forEach(function(el) {
    if (newArray.indexOf(el) == -1) {
      newArray.push(el);
    }
  });

  return newArray;
};

var getTodayFormatted = module.exports.getTodayFormatted = function() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  return mm + '/' + dd + '/' + yyyy;
};
