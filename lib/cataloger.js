var N3 = require('n3');
var spotlight = require('dbpedia-spotlight');
var colors = require('colors');
var Q = require('q');
var ThemeMatcher = require('./themeMatcher.js');
var SpatialDetector = require('./spatialDetector.js');
var Util = require('./utilities.js');
var config = require('../config.json');

var store = N3.Store();

if (config.spotlightEndpoints) {
  spotlight.configEndpoints(config.spotlightEndpoints);
}

var prefixes = {
  dcat: "http://www.w3.org/ns/dcat#",
  dc: "http://purl.org/dc/terms/",
  foaf: "http://xmlns.com/foaf/0.1/",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  xsd: "http://www.w3.org/2001/XMLSchema#"
};

//original properties of the dataset that need to copied to the new catalog.
var datasetProperties = [
  prefixes.dc + "title",
  prefixes.dc + "description",
  prefixes.dc + "issued",
  prefixes.dc + "modified",
  prefixes.dc + "identifier",
  prefixes.dcat + "keyword",
  prefixes.dc + "language",
  prefixes.dcat + "contactPoint",
  prefixes.dc + "temporal",
  prefixes.dc + "spatial",
  prefixes.dc + "accrualPeriodicity",
  prefixes.dcat + "landingPage",
  prefixes.dc + "publisher"
];

var distributionProperties = [
  prefixes.dc + "title",
  prefixes.dc + "description",
  prefixes.dc + "issued",
  prefixes.dc + "modified",
  prefixes.dc + "rights",
  prefixes.dcat + "accessURL",
  prefixes.dcat + "downloadURL",
  prefixes.dcat + "mediaType",
  prefixes.dc + "format",
  prefixes.dcat + "byteSize"
];

var catalog = module.exports.catalog = function(loadStore) {
  //add our own catalog
  store.addTriple(config.catalog.baseURI, prefixes.rdf + "type", prefixes.dcat + "Catalog");
  //add title to our catalog
  if (config.catalog.title) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "title", config.catalog.title);
  }
  //add description to our catalog
  if (config.catalog.description) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "description", config.catalog.description);
  }
  //add themeTaxonomy to our catalog
  if (config.catalog.themeTaxonomy) {
    store.addTriple(config.catalog.baseURI, prefixes.dcat + "themeTaxonomy", config.catalog.themeTaxonomy);
  }
  //add issued to our catalog
  if (config.catalog.issued) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "issued", config.catalog.issued);
  }
  //add modified to our catalog
  if (config.catalog.modified) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "modified", config.catalog.modified);
  }
  //add language to our catalog
  if (config.catalog.language) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "language", config.catalog.language);
  }
  //add license to our catalog
  if (config.catalog.license) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "license", config.catalog.license);
  }
  //add rights to our catalog
  if (config.catalog.rights) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "rights", config.catalog.rights);
  }
  //add spatial to our catalog
  if (config.catalog.spatial) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "spatial", config.catalog.spatial);
  }
  //add homepage to our catalog
  if (config.catalog.homepage) {
    store.addTriple(config.catalog.baseURI, prefixes.foaf + "homepage", config.catalog.homepage);
  }
  //add publisher to our catalog
  if (config.catalog.puhlisher) {
    store.addTriple(config.catalog.baseURI, prefixes.dc + "publisher", config.catalog.publisher);
  }

  //we link all loaded datasets to the newly created catalog
  var allDatasets = loadStore.find(null, prefixes.rdf + "type", prefixes.dcat + "Dataset");

  var deferred = Q.defer();
  var promises = [];

  allDatasets.forEach(function(ds) {
    var dDeferred = Q.defer();
    promises.push(dDeferred.promise);

    store.addTriple(config.catalog.baseURI, prefixes.dcat + "dataset", ds.subject);

    datasetProperties.forEach(function(prop) {
      var triples = loadStore.find(ds.subject, prop, null);

      triples.forEach(function(triple) {
        store.addTriple(triple.subject, triple.predicate, triple.object);
      });
    });

    copyOriginalDistributions(ds, loadStore);

    getConcept(loadStore, ds).then(function() {
      dDeferred.resolve();
    });
  });

  Q.all(promises).then(function() {
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

    spotlight.annotate(description, function(output) {
      var t = function() {
        if (output.response.Resources) {
          parseAnnotation(output.response.Resources, dataset).then(function() {
            dDeferred.resolve();
          });
        } else {
          if (global.verbose) {
            var str = 'No resources where found for the description "' + description + '" of ' + dataset.subject + ".";
            console.log(str.yellow);
          }

          dDeferred.resolve();
        }
      };

      setTimeout(t, Math.random() * 1000.00);
    });
  }

  r = loadStore.find(dataset.subject, prefixes.dcat + "keyword", null);

  r.forEach(function(triple) {
    var rDeferred = Q.defer();
    promises.push(rDeferred.promise);

    var keyword = N3.Util.getLiteralValue(triple.object);

    spotlight.annotate(keyword, function(output) {
      var t = function() {
        if (output.response.Resources) {
          parseAnnotation(output.response.Resources, dataset).then(function() {
            rDeferred.resolve();
          });
        } else {
          if (global.verbose) {
            var str = "No resources where found for keyword '" + keyword + "' for " + dataset.subject + ".";
            console.log(str.yellow);
          }

          rDeferred.resolve();
        }
      };

      setTimeout(t, Math.random() * 1000.0);
    });
  });

  Q.all(promises).then(function() {
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

    Util.getClasses(uri).then(function(results) {
      var rPromises = [];

      results.forEach(function(result) {
        var rDeferred = Q.defer();
        rPromises.push(rDeferred.promise);

        var xPromises = [];
        var x1Deferred = Q.defer();
        var x2Deferred = Q.defer();
        xPromises.push(x1Deferred.promise);
        xPromises.push(x2Deferred.promise);

        ThemeMatcher.match(result).then(function(themes) {
          themes.forEach(function(theme) {
            store.addTriple(dataset.subject, prefixes.dcat + "theme", theme);
          });

          x1Deferred.resolve();
        });

        SpatialDetector.detect(result).then(function(isSpatial) {
          if (isSpatial) {
            store.addTriple(dataset.subject, prefixes.dc + "spatial", uri);
          }

          x2Deferred.resolve();
        });

        Q.all(xPromises).then(function() {
          rDeferred.resolve();
        });

      });

      Q.all(rPromises).then(function() {
        tDeferred.resolve();
      });
    });
  });

  Q.all(promises).then(function() {
    deferred.resolve();
  });

  return deferred.promise;
};

var copyOriginalDistributions = function(dataset, loadStore) {
  var distributions = loadStore.find(dataset.subject, prefixes.dcat + "distribution", null);

  distributions.forEach(function(distribution) {
    distributionProperties.forEach(function(prop) {
      var triples = loadStore.find(distribution.subject, prop, null);

      triples.forEach(function(triple) {
        store.addTriple(triple.subject, triple.predicate, triple.object);
      });
    });
  });
};
