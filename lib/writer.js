var fs = require('fs');
var validator = require('validator');

var write = module.exports.write = function(triples, outputFile) {
  var wstream;

  if (outputFile) {
    wstream = fs.createWriteStream(outputFile);
  } else {
    wstream = process.stdout;
    wstream.write("===== RESULT START =====\n");
  }

  triples.forEach(function(triple) {
    var subject = goodURI(triple.subject);
    var object = goodURI(triple.object);
    var predicate = goodURI(triple.predicate);

    wstream.write(subject + " " + predicate + " " + object + " .\n");
  });

  if (!outputFile) {
    wstream.write("===== RESULT END =====\n");
  }
}

var goodURI = function(uri) {
  if (validator.isURL(uri)) {
    return "<" + uri + ">";
  } else {
    return uri;
  }
}
