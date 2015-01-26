var path = require('path');
var Util = require('./utilities.js');
var config = Util.getConfig();
var N3 = require('n3');
var http = require('http');
var Q = require('q');
var fs = require('fs');

var store = N3.Store();

var load = module.exports.load = function() {
  //we iterate over the different sources
  //1) we download them
  //2) we put them in the N3 store

  var sources = config.sources;
  var promises = [];
  var deferred = Q.defer();

  sources.forEach(function(source) {
    var sDeferred = Q.defer();
    promises.push(sDeferred.promise);

    if (source.url) {
      http.get(source.url, function(response) {
        var callback = function() {
          if (global.verbose) {
            console.log("All triples of '" + source.name + "' (" + source.url + ") were parsed.");
          }

          sDeferred.resolve();
        }

        parseFileContent(response, callback);
      });
    } else if (source.file) {
      fs.readFile(source.file, {
        encoding: "utf8"
      }, function(err, data) {
        if (err) {
          var str = "Error occured when reading file of source '" + source.name + "': " + err;
          console.log(str.red);
        } else {
          var callback = function() {
            console.log("All triples of '" + source.name + "' (" + source.file + ") were parsed.");
            sDeferred.resolve();
          }

          parseFileContent(data, callback);
        }
      });
    } else {
      console.log("Config.json contains invalid source. Source skipped.".red);
    }
  });

  Q.all(promises).then(function() {
    deferred.resolve(store);
  });

  return deferred.promise;
};

var parseFileContent = function(content, callback) {
  var parser = N3.Parser();

  parser.parse(content, function(error, triple, prefixes) {
    if (triple) {
      store.addTriple(triple.subject, triple.predicate, triple.object);
    } else {
      callback();
    }
  });
};

var printStore = module.exports.printStore = function() {
  var all = store.find(null, null, null);

  all.forEach(function(triple) {
    console.log(triple.subject, triple.predicate, triple.object, ".");
  });
}
