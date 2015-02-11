var fs = require('fs');
var validator = require('validator');
var N3 = require('n3');
var write = module.exports.write = function(triples, outputFile) {
  var wstream;
  if (outputFile) {
    wstream = fs.createWriteStream(outputFile);
  } else {
    wstream = process.stdout;
    console.error("===== RESULT START =====\n");
  }
  var streamWriter = new N3.Writer(wstream, {});

  triples.forEach(function(triple) {
    streamWriter.addTriple(triple);
  });

  streamWriter.end();

  if (!outputFile) {
    console.error("===== RESULT END =====\n");
  }
}