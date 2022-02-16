import {Configuration}  from './Configuration';
import {RDFVocabulary} from './rdfVocabulary';
import {ShaclShape} from './shaclShape';

//import {ShaclShape} from './shaclShape';
const files: string[] = ['./files/station_information.json', './files/free_bike_status.json', './files/system_alerts.json', './files/system_regions.json', './files/vehicle_types.json', './files/system_pricing_plan.json', './files/gbfs_versions.json', './files/system_calendar.json', './files/system_hours.json'];
// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
const objects: string[] = [ 'gbfsvcb:Station', 'gbfsvcb:Bike', 'gbfsvcb:Alert', 'gbfsvcb:Region', 'gbfsvcb:VehicleType', 'gbfsvcb:PricingPlan', 'gbfsvcb:Version', 'gbfsvcb:Calendar', 'gbfsvcb:RentalHour' ];
const  fs = require('fs');

let hiddenClasses = []
let i = 0;
for (const obj of objects){
    const config = new Configuration(files[i]);
    i +=1;
    const rdfVocab = new RDFVocabulary(config.getTermMapping(), config.getJsonSource(), obj);
    console.log(config.getVocabURI());
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
/**
 * Creating the json-ld context: hard-coded since common to all files. A static solution could be found.
 */
const config = new Configuration(files[0]);
const rdfVocab = new RDFVocabulary(config.getTermMapping(), config.getJsonSource(), objects[0]);
const prefixes:Map<string, string> = rdfVocab.getPrefixes().prefixes;
const mapping:Map<string, string> = config.getTermMapping();
//const size=  Object.keys(prefixes).length;
let context = `{ \n \t "@context": { \n \t`;
for(const prefix in prefixes){
    //if( prefix != Array.from(Object.keys(prefixes))[size-1])
    context += `\t \t "${prefix}": `+`"${prefixes[prefix]}"`+`, \n`;
};
for(const [key, value] of Array.from(mapping.entries())){
    if (key != Array.from(mapping.keys()).pop()){
        context += `\t \t "${key}": `+`"${value}"`+`, \n`;
    }
    else{
        context += `\t \t "${key}": `+`"${value}"`+`\n`;
    }
};
context += `\n  \t } \n }`;
// Write the Shacl shape on file
fs.writeFileSync(`build/ldContext.json`, context , function(err){
    if(err){
        return console.log("error");
    }
});