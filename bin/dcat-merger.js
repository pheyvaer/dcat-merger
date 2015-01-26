#!/usr/bin/env node

global.verbose = false;
global.print = true;

var nodePrefix = require('node-prefix');

global.resources = nodePrefix.global('dcat-merger') + "/resources";

var dcatMerger = require('../dcat-merger.js');
var writer = require('../lib/writer.js');
var N3 = require('n3');
var pkg = require('../package.json');

var outputFile;
var outputFileIndex;
var errorMessage = "Incorrect parameter usage.".red;
var helpMessage = "dcat-merger [OPTION]...\n\n" +
  "output control\n" +
  "\t-v, --verbose: verbose\n" +
  "\t-o, --output: output file, if no output file is specified output is redirect to `stdout`.\n" +
  "\t-h, --help: show help (that is, this)\n" +
  "\t--version: show version information";

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
    } else {
      badExit();
    }
  }
});

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
