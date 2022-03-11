import { RDFTools } from './rdfTools';
import {ShaclTools} from './shaclTools';
import {JsonProcessor} from './jsonProcessor';

// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
let schema_object = new Map<string, string>();
const config = require('./configs/config-gbfs.json');
//const config = require('./configs/config-smartdatamodel.json');
for( let object in config.sources){
    schema_object.set(object, config.sources[object]);
}
// main Function for recursive jsonProcessor
for (let [schema,object] of Array.from(schema_object)){
    JsonProcessor.initialise(schema, object);
    RDFTools.initialise(JsonProcessor.getMainObject()); //initialising the filename written by RDF tools with the name of the main object
    //                      filename                   , 
    ShaclTools.initialise(JsonProcessor.getMainObject(), JsonProcessor.mainObject );
    JsonProcessor.callJsonTraverseRecursive();
    RDFTools.writeTurtle(JsonProcessor.getWriter());
    ShaclTools.writeShacl(JsonProcessor.getMainObject(), JsonProcessor.getShaclFileText());
}