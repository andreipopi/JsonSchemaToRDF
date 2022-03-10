"use strict";
exports.__esModule = true;
var rdfTools_1 = require("./rdfTools");
var shaclTools_1 = require("./shaclTools");
var jsonProcessor_1 = require("./jsonProcessor");
// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
var schema_object = new Map();
var config = require('./configs/config-gbfs.json');
//const config = require('./configs/config-smartdatamodel.json');
for (var object in config.sources) {
    schema_object.set(object, config.sources[object]);
}
// main Function for recursive jsonProcessor
for (var _i = 0, _a = Array.from(schema_object); _i < _a.length; _i++) {
    var _b = _a[_i], schema = _b[0], object = _b[1];
    jsonProcessor_1.JsonProcessor.initialise(schema, object);
    rdfTools_1.RDFTools.initialise(jsonProcessor_1.JsonProcessor.getMainObject()); //initialising the filename written by RDF tools with the name of the main object
    console.log("Filenam", jsonProcessor_1.JsonProcessor.getMainObject());
    //                      filename                   , 
    shaclTools_1.ShaclTools.initialise(jsonProcessor_1.JsonProcessor.getMainObject(), jsonProcessor_1.JsonProcessor.mainObject);
    jsonProcessor_1.JsonProcessor.callJsonTraverseRecursive();
    rdfTools_1.RDFTools.writeTurtle(jsonProcessor_1.JsonProcessor.getWriter());
    shaclTools_1.ShaclTools.writeShacl(jsonProcessor_1.JsonProcessor.getMainObject(), jsonProcessor_1.JsonProcessor.getShaclFileText());
}
