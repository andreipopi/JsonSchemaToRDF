"use strict";
exports.__esModule = true;
var Configuration_1 = require("./Configuration");
var rdfVocabulary_1 = require("./rdfVocabulary");
var shaclShape_1 = require("./shaclShape");
//import {ShaclShape} from './shaclShape';
// Create a configuration object that will take care of preprocessing
var config = new Configuration_1.Configuration();
var rdfVocab = new rdfVocabulary_1.RDFVocabulary(config.getTermMapping(), config.getJsonSource());
console.log(config.getVocabURI());
rdfVocab.parseBasicsToQuads();
rdfVocab.parseMainObjectPropertiesToQuads();
var shape = new shaclShape_1.ShaclShape(rdfVocab.getRequiredProperties(), config.getJsonSource());
shape.writeConstraints();
// Create a shaclShape object
// Create an RDFVocab object
