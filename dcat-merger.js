if (!global.resources) {
  global.resources = __dirname + "/resources";
}

if (!global.verbose) {
	global.verbose = false;
}

if (!global.print) {
  global.print = false;
}

var loader = require('./lib/loader.js');
var cataloger = require('./lib/cataloger.js');
var Q = require('q');
var Util = require('./lib/utilities.js');

var merge = module.exports.merge = function() {
  var deferred = Q.defer();

  loader.load().then(function(store) {
    if (global.print) {
      console.log("Loading & parsing finished");

      if (global.verbose) {
        console.log("Cataloging started");
      } else {
        process.stdout.write("Cataloging ... ");
      }
    }

    cataloger.catalog(store, verbose).then(function(triples) {
      if (global.verbose) {
        console.log("Cataloging finished");
      } else {
        console.log("done");
      }

      deferred.resolve(triples);
    });
  });

  return deferred.promise;
};

var setConfig = module.exports.setConfig = Util.setConfig;

var setSpatialDetector = module.exports.setSpatialDetector = Util.setSpatialDetector;

var setThemeMatcher = module.exports.setThemeMatcher = Util.setThemeMatcher;
