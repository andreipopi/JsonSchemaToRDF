"use strict";
exports.__esModule = true;
var rdfTools_1 = require("./rdfTools");
var traverse_1 = require("./traverse");
var N3 = require('n3');
var DataFactory = N3.DataFactory;
// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
var schema_object = new Map();
var config = require('./configs/config-gbfs.json');
//const config = require('./configs/config-smartdatamodel.json');
//const config = require('./configs/config-battery.json');
for (var object in config.sources) {
    schema_object.set(object, config.sources[object]);
}
// main Function for recursive jsonProcessor
for (var _i = 0, _a = Array.from(schema_object); _i < _a.length; _i++) {
    var _b = _a[_i], schemaPath = _b[0], object = _b[1];
    console.log("schemaPath", schemaPath, "object:", object);
    var schema = require(schemaPath.toString());
    var writer = new N3.Writer({ prefixes: config.prefixes });
    traverse_1.Traverse.initialise(writer);
    //JsonProcessor.initialise(schema, object);
    rdfTools_1.RDFTools.initialise(object); //initialising the filename written by RDF tools with the name of the main object
    //                      filename                   , 
    //ShaclTools.initialise(JsonProcessor.getMainObject(), JsonProcessor.mainObject );
    //JsonProcessor.callJsonTraverseRecursive();
    traverse_1.Traverse.traverse('schema', schema, []);
    rdfTools_1.RDFTools.writeTurtle(traverse_1.Traverse.getWriter());
    //ShaclTools.writeShacl(JsonProcessor.getMainObject(), JsonProcessor.getShaclFileText());
}
