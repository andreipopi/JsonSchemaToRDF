"use strict";
exports.__esModule = true;
var rdfVocabulary_1 = require("./rdfVocabulary");
//import {ShaclShape} from './shaclShape';
// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
var schema_object = new Map();
schema_object.set('./files/station_information.json', 'gbfsvcb:Station');
schema_object.set('./files/free_bike_status.json', 'gbfsvcb:Bike');
schema_object.set('./files/system_alerts.json', 'gbfsvcb:Alert');
schema_object.set('./files/system_regions.json', 'gbfsvcb:Region');
schema_object.set('./files/vehicle_types.json', 'gbfsvcb:VehicleType');
schema_object.set('./files/system_pricing_plan.json', 'gbfsvcb:PricingPlan');
schema_object.set('./files/gbfs_versions.json', 'gbfsvcb:Version');
schema_object.set('./files/system_calendar.json', 'gbfsvcb:Calendar');
schema_object.set('./files/system_hours.json', 'gbfsvcb:RentalHour');
var fs = require('fs');
var hiddenClasses = [];
var i = 0;
for (var _i = 0, _a = Array.from(schema_object); _i < _a.length; _i++) {
    var _b = _a[_i], schema = _b[0], object = _b[1];
    console.log(object);
    // const config = new Configuration(files[i]);
    i += 1;
    var rdfVocab = new rdfVocabulary_1.RDFVocabulary(schema, object);
    rdfVocab.basicsToQuads();
    hiddenClasses = rdfVocab.objectPropertiesToQuads(0);
    // New classes might be have been added as range value for some properties. It is now time to explore those classes, 
    // e.g. "per_km_pricing" in system_pricing.json
    for (var _c = 0, hiddenClasses_1 = hiddenClasses; _c < hiddenClasses_1.length; _c++) {
        var cls = hiddenClasses_1[_c];
        rdfVocab.setMainObject(cls);
        rdfVocab.objectPropertiesToQuads(1);
    }
    rdfVocab.writeTurtle();
    rdfVocab.writeShacl();
}
