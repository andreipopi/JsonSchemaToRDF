"use strict";
exports.__esModule = true;
var rdfVocabulary_1 = require("./rdfVocabulary");
// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
var schema_object = new Map();
var config = require('./config-gbfs.json');
for (var object in config.sources) {
    schema_object.set(object, config.sources[object]);
}
var hiddenClasses = [];
var i = 0;
for (var _i = 0, _a = Array.from(schema_object); _i < _a.length; _i++) {
    var _b = _a[_i], schema = _b[0], object = _b[1];
    i += 1;
    var rdfVocab = new rdfVocabulary_1.RDFVocabulary(schema, object);
    rdfVocab.basicsToQuads();
    hiddenClasses = rdfVocab.propertiesToRDF(0);
    // New classes might be have been added as range value for some properties. It is now time to explore those classes, 
    // e.g. "per_km_pricing" in system_pricing.json
    for (var _c = 0, hiddenClasses_1 = hiddenClasses; _c < hiddenClasses_1.length; _c++) {
        var cls = hiddenClasses_1[_c];
        rdfVocab.setMainObject(cls);
        rdfVocab.propertiesToRDF(1);
    }
    rdfVocab.writeTurtle();
    rdfVocab.writeShacl();
}
