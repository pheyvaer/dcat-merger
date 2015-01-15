## DCAT Merger ##

This [Node.js](http://nodejs.org) application allows to merge the [DCAT](http://www.w3.org/TR/vocab-dcat/) information of serveral sources into one single Turtle file.

### Installation ###

- Install Node.js
- Clone this repo
- Navigate to the folder of the repo
- Execute `npm install`

### Usage ###

- Edit `config.json` with the sources you want to merge. For every source you need to provide the name and the url or file. You want to choose the option 'file' if you want to read a local Turtle file.
- Execute `node index.js [output file]`. If no output file is specified all the output will go to `stdout`.

*In the folder `data` you can find some example Turtle files.*

### License ###
