"use strict";
exports.__esModule = true;
var Configuration_1 = require("./Configuration");
var rdfVocabulary_1 = require("./rdfVocabulary");
//import {ShaclShape} from './shaclShape';
// Create a configuration object that will take care of preprocessing
var config = new Configuration_1.Configuration();
var rdfVocab = new rdfVocabulary_1.RDFVocabulary();
//console.log(config.getTermMapping());
console.log(config.getVocabURI());
console.log(rdfVocab.getQuads);
config.traverse();
rdfVocab.addQuadsToStore();
rdfVocab.writeQuads();
// Create a shaclShape object
// Create an RDFVocab object