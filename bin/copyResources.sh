#!/bin/bash

if [ ! -d "~/.dcat-merger" ]; then
	mkdir ~/.dcat-merger
fi

cp ./resources/mappingDBpediaTDTTaxonomy.ttl ~/.dcat-merger
cp ./resources/spatialConfig.json ~/.dcat-merger
