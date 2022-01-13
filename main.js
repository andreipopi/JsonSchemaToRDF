"use strict";
exports.__esModule = true;
var Configuration_1 = require("./Configuration");
var rdfVocabulary_1 = require("./rdfVocabulary");
//import {ShaclShape} from './shaclShape';
var files = ['./files/station_information.json'];
var objects = ['gbfsvcb:Station'];
var i = 0;
for (var obj in objects) {
    var config = new Configuration_1.Configuration(files[i]);
    i++;
    var rdfVocab = new rdfVocabulary_1.RDFVocabulary(config.getTermMapping(), config.getJsonSource(), obj);
    console.log(config.getVocabURI());
    rdfVocab.parseBasicsToQuads();
    rdfVocab.parseMainObjectPropertiesToQuads();
}
// Create a configuration object that will take care of preprocessing
// Create a shaclShape object
// Create an RDFVocab object
