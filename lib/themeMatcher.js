var N3 = require('n3');
var fs = require('fs');
var Q = require('q');
var Util = require('./utilities.js');

var themeStore = N3.Store();
var loadingDone = false;

fs.readFile('resources/mappingDBpediaTDTTaxonomy.ttl', {
  encoding: "utf8"
}, function(err, data) {
  if (err) {
    console.log("themeMathcer: required file for themeMatcher was not found.".red);
    process.exit(1);
  } else {
    process.stdout.write("themeMather: loading ... ");
    var parser = N3.Parser();
    parser.parse(data, function(error, triple, prefixes) {
      if (triple) {
        themeStore.addTriple(triple.subject, triple.predicate, triple.object);
      } else {
        console.log('done');
        loadingDone = true;
      }
    });
  }
});

var match = module.exports.match = function(concept) {
  var deferred = Q.defer();

  if (loadingDone) {
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
  } else {
    console.log('themeMatcher: loading was not done yet ...'.red);
    process.exit(1);
  }

  return deferred.promise;
}
