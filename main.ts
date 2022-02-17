import {RDFVocabulary} from './rdfVocabulary';
import {ShaclShape} from './shaclShape';
//import {ShaclShape} from './shaclShape';

// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
let schema_object = new Map<string, string>();
schema_object.set('./files/station_information.json', 'gbfsvcb:Station');
schema_object.set('./files/free_bike_status.json', 'gbfsvcb:Bike');
schema_object.set('./files/system_alerts.json', 'gbfsvcb:Alert');
schema_object.set('./files/system_regions.json', 'gbfsvcb:Region');
schema_object.set('./files/vehicle_types.json', 'gbfsvcb:VehicleType');
schema_object.set('./files/system_pricing_plan.json', 'gbfsvcb:PricingPlan');
schema_object.set('./files/gbfs_versions.json', 'gbfsvcb:Version');
schema_object.set('./files/system_calendar.json', 'gbfsvcb:Calendar');
schema_object.set('./files/system_hours.json', 'gbfsvcb:RentalHour');

const fs = require('fs');

let hiddenClasses = []
let i = 0;
for (let [schema,object] of Array.from(schema_object)){
    console.log(object);
   // const config = new Configuration(files[i]);

    i +=1;
    const rdfVocab = new RDFVocabulary(schema, object);
    rdfVocab.basicsToQuads();
    hiddenClasses = rdfVocab.objectPropertiesToQuads(0);

    // New classes might be have been added as range value for some properties. It is now time to explore those classes, 
    // e.g. "per_km_pricing" in system_pricing.json

    for (const cls of hiddenClasses){
        rdfVocab.setMainObject(cls);
        rdfVocab.objectPropertiesToQuads(1);
    }
    rdfVocab.writeTurtle();
    rdfVocab.writeShacl();
}