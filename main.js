"use strict";
exports.__esModule = true;
var Configuration_1 = require("./Configuration");
var rdfVocabulary_1 = require("./rdfVocabulary");
//import {ShaclShape} from './shaclShape';
var files = ['./files/station_information.json', './files/free_bike_status.json', './files/system_alerts.json'];
var objects = ['gbfsvcb:Station', 'gbfsvcb:Bike', 'gbfsvcb:Alert'];
var i = 0;
for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
    var obj = objects_1[_i];
    var config = new Configuration_1.Configuration(files[i]);
    i += 1;
    var rdfVocab = new rdfVocabulary_1.RDFVocabulary(config.getTermMapping(), config.getJsonSource(), obj);
    console.log(config.getVocabURI());
    rdfVocab.parseBasicsToQuads();
    rdfVocab.parseMainObjectPropertiesToQuads();
}
// Create a configuration object that will take care of preprocessing
// Create a shaclShape object
// Create an RDFVocab object
