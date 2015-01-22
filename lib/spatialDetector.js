var Q = require('q');
var Util = require('./utilities.js');
var config = require('../resources/spatialConfig.json');
var spatialClasses = config.classes;

var detect = module.exports.detect = function(resourceClass) {
  var deferred = Q.defer();

  Util.getUpperClasses(resourceClass).then(function(allClasses) {
    var results = [];
    allClasses.push(resourceClass);

    var i = 0;

    while (i < allClasses.length && !isSpatialClass(allClasses[i])) {
      i++;
    }

    deferred.resolve(i < allClasses.length);
  });

  return deferred.promise;
}

var isSpatialClass = function(testClass) {
  return (spatialClasses.indexOf(testClass) != -1);
};
