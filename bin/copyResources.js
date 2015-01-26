#!/usr/bin/env node

var mkdirp = require('mkdirp');
var fs = require('fs');
var fse = require('fs-extra');
var folder = process.env['HOME'] + "/.config/dcat-merger";

//fs.mkdirSync(folder);
//fse.ensureFileSync(folder + '/mappingDBpediaTDTTaxonomy.ttl');
///fs.writeFileSync(folder + '/mappingDBpediaTDTTaxonomy.ttl', '');
//fs.createReadStream(__dirname + "/../resources/mappingDBpediaTDTTaxonomy.ttl").pipe(fs.createWriteStream(folder + '/mappingDBpediaTDTTaxonomy.ttl'));
//fse.ensureFileSync(folder + '/spatialConfig.json');
//fs.writeFileSync(folder + '/spatialConfig.json', '');

//fs.createReadStream(__dirname + "/../resources/spatialConfig.json").pipe(fs.createWriteStream(folder + '/spatialConfig.json'));
