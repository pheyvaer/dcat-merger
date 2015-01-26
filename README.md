## DCAT Merger ##

This [Node.js](http://nodejs.org) application allows to merge the [DCAT](http://www.w3.org/TR/vocab-dcat/) information of several sources into one single Turtle file.

### Installation ###

- Install [Node.js](http://nodejs.org)
- Clone this repo
- Navigate to the folder of the repo
- Execute `npm install . -g`

### Usage ###

Create a `config.json` with the sources you want to merge. An example `config.json` can be found in the repo. For every source you need to provide the name and the url or file. You want to choose the option 'file' if you want to read a local Turtle file. Here, you can also set the DBpedia spotlight instances you want to use for NER. *In the folder `data` you can find some example Turtle files.*

#### Stand alone ####
- Execute `dcat-merger [OPTION]...`.

Output control

- `-v, --verbose`: verbose
- `-o, --output`: output file, if no output file is specified output is redirect to `stdout`.
- `-h`, `--help`: show help
- `--version`: show version information

#### In Node.js Application ####

You can also use the module via 

```
var dcatMerger = require('dcat-merger');

dcatMerger.merge().then(function(triples){
	console.log(triples);
});	
```

The variable `triples` is an array containing objects with the following elements: subject, predicate, object and graph (= one triple).

### Remarks ###

- To match the different concepts from DBpedia with those form the TDT/dcat taxonomy, we created a basic mapping between the two. Replacing themeMatcher.js with a custom implementation allows to inject your own dynamic/static mapping.
- To define the spatial property of a dataset, we created a spatialDetector.js. Based on the found resources (using NER), we determine if the resources point to a place/location etc. If you want to determine which types of classes are recognised as spatial, you can edit `resources/spatialConfig.js` (if you run it in a Node.js Application).
- Tested on Ubuntu 14.04.

### License ###

MIT licensed

Authors:
 * Pieter Heyvaert <pheyvaer.heyvaert@ugent.be> - [@PHaDventure](http://www.twitter.com/PHaDventure)
 * Pieter Colpaert <pieter.colpaert@ugent.be>
