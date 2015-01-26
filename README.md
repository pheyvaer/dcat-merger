## DCAT Merger ##

This [Node.js](http://nodejs.org) application allows to merge the [DCAT](http://www.w3.org/TR/vocab-dcat/) information of several sources into one single Turtle file.

### Installation ###

- Install [Node.js](http://nodejs.org)
- Clone this repo
- Navigate to the folder of the repo
- Execute `npm install`

### Usage ###

- Edit `config.json` with the sources you want to merge. For every source you need to provide the name and the url or file. You want to choose the option 'file' if you want to read a local Turtle file. Here, you can also set the DBpedia spotlight instances you want to use for NER.
- Execute `node dcat-merger.js [OPTION]...`.

Output control

- `-v, --verbose`: verbose
- `-o, --output`: output file, if no output file is specified output is redirect to `stdout`.
- `-h`, `--help`: show help
- `--version`: show version information

*In the folder `data` you can find some example Turtle files.*

### Remarks ###

- To match the different concepts from DBpedia with those form the TDT/dcat taxonomy, we created a basic mapping between the two. Replacing themeMatcher.js with a custom implementation allows to inject your own dynamic/static mapping.
- To define the spatial property of a dataset, we created a spatialDetector.js. Based on the found resources (using NER), we determine if the resources point to a place/location etc. If you want to determine which types of classes are recognised as spatial, you can edit `resources/spatialConfig.js`.
- Tested on Ubuntu 14.04.

### License ###

MIT licensed

Authors:
 * Pieter Heyvaert <pheyvaer.heyvaert@ugent.be> - [@PHaDventure](http://www.twitter.com/PHaDventure)
 * Pieter Colpaert <pieter.colpaert@ugent.be>
