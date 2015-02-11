#!/usr/bin/env node

var nodePrefix = require('node-prefix');
var pkg = require('../package.json');
var colors = require('colors');
var Q = require('q');
var fs = require('fs');
var N3 = require('n3');
var path = require('path');

global.verbose = false;
global.print = true;
global.resources = nodePrefix.global('dcat-merger') + "/resources";

var outputFile;
var outputFileIndex;
//default location for the spatial file
var spatialFile = global.resources + '/spatialConfig.json';
var spatialFileIndex;
//default location for the theme file
var themeFile = global.resources + '/mappingDBpediaTDTTaxonomy.ttl';
var themeFileIndex;
//default location for the config file
var configFile = process.cwd() + "/config.json";
var configFileIndex;

var errorMessage = "Incorrect parameter usage.".red;
var helpMessage = "dcat-merger [OPTION]...\n\n" +
  "output control\n" +
  "\t-v, --verbose: verbose\n" +
  "\t-c, --config : config file, if not specified the program will look for 'config.json' in the current directory.\n" +
  "\t-o, --output : output file, if no output file is specified output is redirected to 'stdout'.\n" +
  "\t-t, --theme  : config file for the themeMatcher, if not specified the default one will be used.\n" +
  "\t-s, --spatial: config file for the spatialDetector, if not specified the default one will be used.\n" +
"\t-h, --help   : show help (that is, this)\n" +
"\t--version    : show version information";

var badExit = function() {
  console.log(errorMessage + "\n");
  console.log(helpMessage);
  process.exit(1);
}

process.argv.forEach(function(val, index, array) {
  if (!(index === 0 || index === 1)) {
    if (val === "-h" || val === "--help") {
      console.log(helpMessage);
      process.exit(0);
    } else if (val === "--version") {
      console.log(pkg.version);
      process.exit(0)
    } else if (val === "-o" || val === "--output") {
      if (outputFileIndex || index == array.length - 1) {
        badExit();
      } else {
        outputFileIndex = index + 1;
      }
    } else if (val === "-v" || val === "--verbose") {
      global.verbose = true;
    } else if (index === outputFileIndex) {
      if (val === "-o" || val === "--output") {
        badExit();
      }

      outputFile = val;
    } else if (val === "-s" || val === "--spatial") {
      if (spatialFileIndex || index == array.length - 1) {
        badExit();
      } else {
        spatialFileIndex = index + 1;
      }
    } else if (index === spatialFileIndex) {
      if (val === "-s" || val === "--spatial") {
        badExit();
      }

      spatialFile = path.resolve(val);
    } else if (val === "-t" || val === "--theme") {
      if (themeFileIndex || index == array.length - 1) {
        badExit();
      } else {
        themeFileIndex = index + 1;
      }
    } else if (index === themeFileIndex) {
      if (val === "-t" || val === "--theme") {
        badExit();
      }

      themeFile = path.resolve(val);
    } else if (val === "-c" || val === "--config") {
      if (configFileIndex || index == array.length - 1) {
        badExit();
      } else {
        configFileIndex = index + 1;
      }
    } else if (index === configFileIndex) {
      if (val === "-c" || val === "--config") {
        badExit();
      }

      configFile = path.resolve(val);
    } else {
      badExit();
    }
  }
});

var getConfigFromFile = function() {
  try {
    return require(configFile);
  } catch (err) {
    var str = "The config file was not found ('" + configFile + "').";
    console.log(str.red);
    process.exit(1);
  }
};

var getMappingTriplesFromFile = function() {
  var deferred = Q.defer();
  fs.readFile(themeFile, {
    encoding: "utf8"
  }, function(err, data) {
    if (err) {
      var str = "themeMatcher: the file '" + themeFile + "' was not valid/found.";
      console.log(str.red);
      process.exit(1);
    } else {
      var parser = N3.Parser();
      var triples = [];
      parser.parse(data, function(error, triple, prefixes) {
        if (triple) {
          triples.push(triple);
        } else {
          deferred.resolve(triples);
        }
      });
    }
  });

  return deferred.promise;
};

var spatialDetector = require('../lib/spatialDetector.js');
var themeMatcher = require('../lib/themeMatcher.js');
var dcatMerger = require('../dcat-merger.js');
var writer = require('../lib/writer.js');

getMappingTriplesFromFile().then(function(ttl) {
  themeMatcher.setMappingTriples(ttl);

  try {
    spatialDetector.setConfig(require(spatialFile));
  } catch (err) {
    var str = "spatialDetector: the file '" + spatialFile + "' was not valid/found.";
    console.log(str.red);
    process.exit(1);
  }

  dcatMerger.setConfig(getConfigFromFile());
  dcatMerger.setThemeMatcher(themeMatcher);
  dcatMerger.setSpatialDetector(spatialDetector);

  console.log("Loading & parsing started ");

  dcatMerger.merge().then(function(triples) {
    if (outputFile) {
      if (global.verbose) {
        console.log("Writing to '" + outputFile + "' started");
      } else {
        process.stdout.write("Writing to '" + outputFile + "' ... ");
      }
    }

    writer.write(triples, outputFile);

    if (outputFile) {
      if (global.verbose) {
        console.log("Writing to '" + outputFile + "' finished");
      } else {
        console.log("done");
      }
    }
  });
});
