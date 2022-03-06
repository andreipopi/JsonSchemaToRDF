"use strict";
exports.__esModule = true;
var rdfTools_1 = require("./rdfTools");
var jsonProcessor_1 = require("./jsonProcessor");
// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
var schema_object = new Map();
//const config = require('./configs/config-gbfs.json');
var config = require('./configs/config-smartdatamodel.json');
for (var object in config.sources) {
    schema_object.set(object, config.sources[object]);
}
var hiddenClasses = [];
var i = 0;
/*
for (let [schema,object] of Array.from(schema_object)){
    i +=1;
    //const smdPattern = new SMDPattern(schema, object);
    const smdPattern = new SMDPattern(schema, object);

    RDFTools.initialise(smdPattern.getFileName());
    ShaclTools.initialise(smdPattern.getFileName(), smdPattern.getRequiredProperties(), smdPattern.jsonSource, smdPattern.mainObject );
    smdPattern.basicsToQuads();
    hiddenClasses = smdPattern.propertiesToRDF(0);
    // New classes might be have been added as range value for some properties. It is now time to explore those classes,
    // e.g. "per_km_pricing" in system_pricing.json
    for (const cls of hiddenClasses){
        smdPattern.setMainObject(cls);
        console.log("main object", cls);
        smdPattern.propertiesToRDF(1);
    }
    RDFTools.writeTurtle(smdPattern.getWriter());
    ShaclTools.writeShacl(smdPattern.getFileName(), smdPattern.getShaclFileText(),);
}
*/
// main Function for recursive jsonProcessor
for (var _i = 0, _a = Array.from(schema_object); _i < _a.length; _i++) {
    var _b = _a[_i], schema = _b[0], object = _b[1];
    jsonProcessor_1.JsonProcessor.initialise(schema, object);
    rdfTools_1.RDFTools.initialise(jsonProcessor_1.JsonProcessor.getMainObject()); //initialising the filename written by RDF tools with the name of the main object
    //TODO: where to write these ? smdPattern.basicsToQuads();
    //JsonProcessor.callParseJsonRecursive(); //this method will need to recursively call the parse method.
    jsonProcessor_1.JsonProcessor.callJsonTraverseRecursive();
    rdfTools_1.RDFTools.writeTurtle(jsonProcessor_1.JsonProcessor.getWriter());
}
