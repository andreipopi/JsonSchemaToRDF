"use strict";
exports.__esModule = true;
var Configuration_1 = require("./Configuration");
var rdfVocabulary_1 = require("./rdfVocabulary");
//import {ShaclShape} from './shaclShape';
var files = ['./files/station_information.json', './files/free_bike_status.json', './files/system_alerts.json', './files/system_regions.json', './files/vehicle_types.json', './files/system_pricing_plan.json', './files/gbfs_versions.json', './files/system_calendar.json', './files/system_hours.json'];
var objects = ['gbfsvcb:Station', 'gbfsvcb:Bike', 'gbfsvcb:Alert', 'gbfsvcb:Region', 'gbfsvcb:VehicleType', 'gbfsvcb:PricingPlan', 'gbfsvcb:Version', 'gbfsvcb:Calendar', 'gbfsvcb:RentalHour'];
var fs = require('fs');
var hiddenClasses = [];
var i = 0;
for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
    var obj = objects_1[_i];
    var config_1 = new Configuration_1.Configuration(files[i]);
    i += 1;
    var rdfVocab_1 = new rdfVocabulary_1.RDFVocabulary(config_1.getTermMapping(), config_1.getJsonSource(), obj);
    console.log(config_1.getVocabURI());
    rdfVocab_1.parseBasicsToQuads();
    hiddenClasses = rdfVocab_1.parseMainObjectPropertiesToQuads(0);
    // New classes might be have been added as range value for some properties. It is now time to explore those classes, 
    // e.g. "per_km_pricing" in system_pricing.json
    for (var _a = 0, hiddenClasses_1 = hiddenClasses; _a < hiddenClasses_1.length; _a++) {
        var cls = hiddenClasses_1[_a];
        rdfVocab_1.setMainObject(cls);
        rdfVocab_1.parseMainObjectPropertiesToQuads(1);
    }
    rdfVocab_1.writeTurtle();
    rdfVocab_1.writeShacl();
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
for (var _b = 0, _c = Array.from(mapping.entries()); _b < _c.length; _b++) {
    var _d = _c[_b], key = _d[0], value = _d[1];
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
