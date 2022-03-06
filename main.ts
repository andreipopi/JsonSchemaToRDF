import {GbfsPattern} from './gbfsPattern';
import { RDFTools } from './rdfTools';
import {ShaclTools} from './shaclTools';
import {SMDPattern} from './smdPattern';
import {JsonProcessor} from './jsonProcessor';

// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
let schema_object = new Map<string, string>();

//const config = require('./configs/config-gbfs.json');
const config = require('./configs/config-smartdatamodel.json');
for( let object in config.sources){
    schema_object.set(object, config.sources[object]);
}


let hiddenClasses = []
let i = 0;

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

for (let [schema,object] of Array.from(schema_object)){

    JsonProcessor.initialise(schema, object);
    RDFTools.initialise(JsonProcessor.getMainObject()); //initialising the filename written by RDF tools with the name of the main object

    //TODO: where to write these ? smdPattern.basicsToQuads();

    //JsonProcessor.callParseJsonRecursive(); //this method will need to recursively call the parse method.
    
    JsonProcessor.callJsonTraverseRecursive();

    RDFTools.writeTurtle(JsonProcessor.getWriter());
}


