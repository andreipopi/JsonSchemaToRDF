"use strict";
exports.__esModule = true;
var Configuration_1 = require("./Configuration");
var rdfVocabulary_1 = require("./rdfVocabulary");
//import {ShaclShape} from './shaclShape';
var files = ['./files/station_information.json', './files/free_bike_status.json', './files/system_alerts.json', './files/system_regions.json', './files/vehicle_types.json', './files/system_pricing_plan.json', './files/gbfs_versions.json', './files/system_calendar.json'];
var objects = ['gbfsvcb:Station', 'gbfsvcb:Bike', 'gbfsvcb:Alert', 'gbfsvcb:Region', 'gbfsvcb:VehicleType', 'gbfsvcb:PricingPlan', 'gbfsvcb:Version', 'gbfsvcb:Calendar'];
var fs = require('fs');
var i = 0;
for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
    var obj = objects_1[_i];
    var config_1 = new Configuration_1.Configuration(files[i]);
    i += 1;
    var rdfVocab_1 = new rdfVocabulary_1.RDFVocabulary(config_1.getTermMapping(), config_1.getJsonSource(), obj);
    console.log(config_1.getVocabURI());
    rdfVocab_1.parseBasicsToQuads();
    rdfVocab_1.parseMainObjectPropertiesToQuads();
}
/**
 * Creating the json-ld context: hard-coded since common to all files. A static solution could be found.
 */
var config = new Configuration_1.Configuration(files[0]);
var rdfVocab = new rdfVocabulary_1.RDFVocabulary(config.getTermMapping(), config.getJsonSource(), objects[0]);
var prefixes = rdfVocab.getPrefixes().prefixes;
var mapping = config.getTermMapping();
//const size=  Object.keys(prefixes).length;
var context = "{ \n \t \"@context\": { \n \t";
for (var prefix in prefixes) {
    //if( prefix != Array.from(Object.keys(prefixes))[size-1])
    context += "\t \t \"" + prefix + "\": " + ("\"" + prefixes[prefix] + "\"") + ", \n";
}
;
for (var _a = 0, _b = Array.from(mapping.entries()); _a < _b.length; _a++) {
    var _c = _b[_a], key = _c[0], value = _c[1];
    if (key != Array.from(mapping.keys()).pop()) {
        context += "\t \t \"" + key + "\": " + ("\"" + value + "\"") + ", \n";
    }
    else {
        context += "\t \t \"" + key + "\": " + ("\"" + value + "\"") + "\n";
    }
}
;
context += "\n  \t\u00A0} \n }";
// Write the Shacl shape on file
fs.writeFileSync("build/ldContext.json", context, function (err) {
    if (err) {
        return console.log("error");
    }
});
