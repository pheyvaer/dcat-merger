## DCAT Merger ##

This [Node.js](http://nodejs.org) package allows to merge the [DCAT](http://www.w3.org/TR/vocab-dcat/) information of several sources into one single Turtle file. Below you can find a short summary of what happens under the hood.

- We connect the existing datasets to the new catalog.
- We create the necessary Catalog Records, between the catalog and the datasets.
- We enhance the information of the datasets by using the available keywords and descriptions together with *named entity recognition (NER)*. NER is facilitated through DBpedia Spotlight.
- We expand the information provided by DBpedia spotlight by querying DBpedia itself. This is done using [Linked Data Fragments](http://linkeddatafragments.org/) (via <http://fragments.dbpedia.org/2014/en>).

### Installation ###

- Install [Node.js](http://nodejs.org)
- Clone this repo
- Navigate to the folder of the repo
- Execute `npm install . -g`

### Usage ###

Create a `config.json` with the sources you want to merge. An example `config.json` can be found in the repo. For every source you need to provide the name and the url or file. You want to choose the option 'file' if you want to read a local Turtle file. Here, you can also set the DBpedia spotlight instances you want to use for NER. *In the folder `data` you can find some example Turtle files.*

#### Stand Alone Application ####
- Execute `dcat-merger [OPTION]...`.

Output control

- `-v, --verbose`: verbose
- `-c, --config` : config file, if not specified the program will look for 'config.json' in the current directory.
- `-o, --output` : output file, if no output file is specified output is redirect to `stdout`.
- `-t, --theme`  : config file for the themeMatcher, if not specified the default one will be used.
- `-s, --spatial`: config file for the spatialDetector, if not specified the default one will be used.
- `-h`, `--help` : show help
- `--version`: show version information

#### Node.js Module ####

You can also use the module via 

```javascript
var dcatMerger = require('dcat-merger');

//here you can choose your own custom 'helpers'
//or the ones that came with this package, those can be found 
//in the 'lib' folder
//for this examples we use the ones from this package

var spatialDetector = require('../lib/spatialDetector.js');
var themeMatcher = require('../lib/themeMatcher.js');

//you also need to call some methods before they are ready for use
//ttl is a string containing all the triples in Turtle format,
//example in 'resources' folder
themeMatcher.setMappingTriples(ttl);

//spatialFile is a json file, example in  'resources' folder
spatialDetector.setConfig(require(spatialFile));

//you also need to set the config, example in config.json
dcatMerger.setConfig(getConfigFromFile());
dcatMerger.setThemeMatcher(themeMatcher);
dcatMerger.setSpatialDetector(spatialDetector);

dcatMerger.merge().then(function(triples){
	console.log(triples);
});	
```

The variable `triples` is an array containing objects with the following elements: subject, predicate, object and graph (= one triple).

### Remarks ###

- To match the different concepts from DBpedia with those from the TDT/dcat taxonomy, we created a basic mapping between the two. Replacing themeMatcher.js with a custom implementation allows to inject your own dynamic/static mapping.
- To define the spatial property of a dataset, we created a spatialDetector.js. Based on the found resources (using NER), we determine if the resources point to a place/location etc. If you want to determine which types of classes are recognised as spatial, you can edit `resources/spatialConfig.js` (if you run it in a Node.js Application).
- Tested on Ubuntu 14.04.

### License ###

MIT licensed

Authors:
 * Pieter Heyvaert <pheyvaer.heyvaert@ugent.be> - [@PHaDventure](http://www.twitter.com/PHaDventure)
 * Pieter Colpaert <pieter.colpaert@ugent.be>
