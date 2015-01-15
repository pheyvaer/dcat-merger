var N3 = require('n3');

var store = N3.Store();

var prefixes = {
	dcat : "http://www.w3.org/ns/dcat#",
	dc : "http://purl.org/dc/terms/",
	foaf : "http://xmlns.com/foaf/0.1/",
	rdf : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	xsd : "http://www.w3.org/2001/XMLSchema#"
};

var catalogURI = "http://www.example.com/api/dcat";

var catalog = module.exports.catalog = function(loadStore){
	//add our own catalog
	store.addTriple(catalogURI, prefixes.rdf + "type", prefixes.dcat + "Catalog");
	//add title to our catalog
	store.addTriple(catalogURI, prefixes.dc + "title", "\"Merged DCAT\"^^" + prefixes.xsd + "string");
	//add description to our catalog
	store.addTriple(catalogURI, prefixes.dc + "description", "\"The result DCAT of the DCAT Merger.\"^^" + prefixes.xsd + "string");
	//add issued to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "issued", "");
	//add modified to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "modified", "");
	//add language to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "language", "");
	//add license to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "license", "");
	//add rights to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "rights", "");
	//add spatial to our catalog
	//store.addTriple(catalogURI, prefixes.dc + "spatial", "");
	//add homepage to our catalog
	//store.addTriple(catalogURI, prefixes.foaf + "homepage", "");
	
	//we link all loaded datasets to the newly created catalog
	//var allDatasets = loadStore.find("null", prefixes.rdf + "type", prefixes.dcat + "Dataset");

	//allDatasets.forEach(function(ds){
	//	store.addTriple(catalogURI, prefixes.dcat + "dataset", ds.subject);
	//});

	return store;
};
