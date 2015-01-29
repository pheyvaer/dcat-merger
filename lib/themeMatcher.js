var N3 = require('n3');
var fs = require('fs');
var Q = require('q');
var Util = require('./utilities.js');

var themeStore = N3.Store();

var setMappingTriples = module.exports.setMappingTriples = function(triples) {
  triples.forEach(function(triple) {
    themeStore.addTriple(triple.subject, triple.predicate, triple.object);
  });
};

var match = module.exports.match = function(concept) {
  var deferred = Q.defer();

  Util.getUpperClasses(concept).then(function(allClasses) {
    var results = []
    allClasses.push(concept);

    allClasses.forEach(function(c) {
      var themes = themeStore.find(c, "http://www.w3.org/2004/02/skos/core#closeMatch", null);

      themes.forEach(function(theme) {
        results.push(theme.object);
      });
    });

    deferred.resolve(results);
  });

  return deferred.promise;
}
