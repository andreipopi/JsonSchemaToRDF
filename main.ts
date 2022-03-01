import {GbfsPattern} from './gbfsPattern';
import {ShaclShape} from './shaclShape';
import {SMDPattern} from './smdPattern';

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
    const gbfsPattern = new GbfsPattern(schema, object);
    rdfVocab.basicsToQuads();
    hiddenClasses = gbfsPattern.propertiesToRDF(0);
    // New classes might be have been added as range value for some properties. It is now time to explore those classes, 
    // e.g. "per_km_pricing" in system_pricing.json
    for (const cls of hiddenClasses){
        rdfVocab.setMainObject(cls);
        rdfVocab.propertiesToRDF(1);
    }
    gbfsPattern.writeTurtle();
    gbfsPattern.writeShacl();
}
*/


for (let [schema,object] of Array.from(schema_object)){
    i +=1;
    const rdfVocab = new SMDPattern(schema, object);
    rdfVocab.basicsToQuads();
    hiddenClasses = rdfVocab.propertiesToRDF(0);
    // New classes might be have been added as range value for some properties. It is now time to explore those classes, 
    // e.g. "per_km_pricing" in system_pricing.json
    
    
    for (const cls of hiddenClasses){
        rdfVocab.setMainObject(cls);
        console.log("main object", cls);
        rdfVocab.propertiesToRDF(1);
    }
    
    rdfVocab.writeTurtle();
    rdfVocab.writeShacl();
}