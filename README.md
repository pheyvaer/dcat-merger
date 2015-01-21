## DCAT Merger ##

This [Node.js](http://nodejs.org) application allows to merge the [DCAT](http://www.w3.org/TR/vocab-dcat/) information of several sources into one single Turtle file.

### Installation ###

- Install [Node.js](http://nodejs.org)
- Clone this repo
- Navigate to the folder of the repo
- Execute `npm install`

### Usage ###

- Edit `config.json` with the sources you want to merge. For every source you need to provide the name and the url or file. You want to choose the option 'file' if you want to read a local Turtle file.
- Execute `node index.js [OPTION]...`.

Output control

- `-v`: verbose
- `-o`: output file, if no output file is specified output is redirect to `stdout`.

*In the folder `data` you can find some example Turtle files.*

### Remarks ###

- We use DBpedia spotlight to perform NER, however, there is a query limit. That's why we introduce random latency between requests to 'bypass' this. However, sometimes you might still get errors if the random latencies were not big enough.
- To match the different concepts from DBpedia with those form the TDT/dcat taxonomy, we created a basic mapping between the two. Replacing themeMatcher.js with a custom implementation allows to inject your own dynamic/static mapping.

### License ###

MIT licensed

Authors:
 * Pieter Heyvaert <pheyvaer.heyvaert@ugent.be>
 * Pieter Colpaert <pieter.colpaert@ugent.be>
