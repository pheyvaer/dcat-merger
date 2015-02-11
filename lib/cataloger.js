var N3 = require('n3');
var spotlight = require('dbpedia-spotlight');
var colors = require('colors');
var Q = require('q');
var Util = require('./utilities.js');

var store = N3.Store();
var config;

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

var catalogProperties = [{
    predicate: prefixes.dc + "title",
    object: "title"
  },

  {
    predicate: prefixes.dc + "description",
    object: "description"
  },

  {
    predicate: prefixes.dcat + "themeTaxonomy",
    object: "themeTaxonomy"
  },

  {
    predicate: prefixes.dc + "issued",
    object: "issued"
  },

  {
    predicate: prefixes.dc + "modified",
    object: "modified"
  },

  {
    predicate: prefixes.dc + "language",
    object: "language"
  },

  {
    predicate: prefixes.dc + "license",
    object: "license"
  },

  {
    predicate: prefixes.dc + "rights",
    object: "rights"
  },

  {
    predicate: prefixes.dc + "spatial",
    object: "spatial"
  },

  {
    predicate: prefixes.foaf + "homepage",
    object: "homepage"
  },

  {
    predicate: prefixes.dc + "publisher",
    object: "publisher"
  }
];

var catalog = module.exports.catalog = function(loadStore) {
  config = Util.getConfig();

  if (config.spotlightEndpoints) {
    spotlight.configEndpoints(config.spotlightEndpoints);
  }


  //add our own catalog
  store.addTriple(config.catalog.baseURI, prefixes.rdf + "type", prefixes.dcat + "Catalog");

  catalogProperties.forEach(function(prop) {
    if (config.catalog[prop.object]) {
      store.addTriple(config.catalog.baseURI, prop.predicate, config.catalog[prop.object]);
    }
  });

  //we link all loaded datasets to the newly created catalog
  var allDatasets = loadStore.find(null, prefixes.rdf + "type", prefixes.dcat + "Dataset");

  var deferred = Q.defer();
  var promises = [];

  allDatasets.forEach(function(ds) {
    store.addTriple(config.catalog.baseURI, prefixes.dcat + "dataset", ds.subject);
    store.addTriple(ds.subject, prefixes.rdf + "type", prefixes.dcat + "Dataset");

    datasetProperties.forEach(function(prop) {
      var triples = loadStore.find(ds.subject, prop, null);

      triples.forEach(function(triple) {
        store.addTriple(triple.subject, triple.predicate, triple.object);
      });
    });

    copyOriginalDistributions(ds, loadStore);

    if (config.useNER) {
      var dDeferred = Q.defer();
      promises.push(dDeferred.promise);
      getConcept(loadStore, ds).then(function() {
        dDeferred.resolve();
      });
    }
  });

  Q.all(promises).then(function() {
    deferred.resolve(store.find(null, null, null));
  });

  generateCatalogRecords();

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
    });
  }

  r = loadStore.find(dataset.subject, prefixes.dcat + "keyword", null);

  r.forEach(function(triple) {
    var rDeferred = Q.defer();
    promises.push(rDeferred.promise);

    var keyword = N3.Util.getLiteralValue(triple.object);

    spotlight.annotate(keyword, function(output) {
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

        Util.getThemeMatcher().match(result).then(function(themes) {
          themes.forEach(function(theme) {
            store.addTriple(dataset.subject, prefixes.dcat + "theme", theme);
          });

          x1Deferred.resolve();
        });

        Util.getSpatialDetector().detect(result).then(function(isSpatial) {
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

var appendZeros = function(number, total) {
  var str = "" + number;
  var neededZeros = total - str.length;

  while (neededZeros > 0) {
    str = "0" + str;
    neededZeros--;
  }

  return str;
}

var generateCatalogRecords = function() {
  //count the number of datasets in the new catalog
  var datasets = store.find(null, prefixes.rdf + "type", prefixes.dcat + "Dataset");
  var count = datasets.length;
  var countStr = "" + count;
  var today = '"' + Util.getTodayFormatted() + '"^^' + prefixes.xsd + "date";

  //console.log(datasets.length);

  for (var i = 0; i < datasets.length; i++) {
    var uri = config.catalog.baseURI + "/record-" + appendZeros(i, countStr.length);
    //console.log(uri);
    store.addTriple(uri, prefixes.rdf + "type", prefixes.dcat + "CatalogRecord");
    store.addTriple(config.catalog.baseURI, prefixes.dcat + "record", uri);
    store.addTriple(uri, prefixes.foaf + "primaryTopic", datasets[i].subject);
    store.addTriple(uri, prefixes.dc + "issued", today);
    store.addTriple(uri, prefixes.dc + "modified", today);
  }

  //we do the following for each record
  //1) we create the uri for the record
  //2) we say that the uri is a record
  //3) we add the issue date (current date)
  //4) we add the modified date (current date)
  //5) connect record to dataset
};
