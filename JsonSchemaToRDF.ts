import { RDFTools } from './rdfTools';
import {ShaclTools} from './shaclTools';
import { Traverse }   from './traverse';
const N3 = require('n3');
const { DataFactory } = N3;

// Main objects that are passed to the rdfVocabulary.ts.
// there is one per json schema.
let schema_object = new Map<string, string>();
const config = require('./configs/config-gbfs.json');
//const config = require('./configs/config-smartdatamodel.json');
//const config = require('./configs/config-battery.json');

for( let object in config.sources){
    schema_object.set(object, config.sources[object]);
}

// main Function for recursive jsonProcessor
for (let [schemaPath,object] of Array.from(schema_object)){

   console.log("schemaPath", schemaPath, "object:", object);

    let schema = require(schemaPath.toString());

    let writer = new N3.Writer({prefixes:config.prefixes});
    Traverse.initialise(writer);

    //JsonProcessor.initialise(schema, object);
    RDFTools.initialise(object); //initialising the filename written by RDF tools with the name of the main object
    //                      filename                   , 
    //ShaclTools.initialise(JsonProcessor.getMainObject(), JsonProcessor.mainObject );
    //JsonProcessor.callJsonTraverseRecursive();
   
    Traverse.traverse('schema', schema, []);
    RDFTools.writeTurtle(Traverse.getWriter());
    
    //ShaclTools.writeShacl(JsonProcessor.getMainObject(), JsonProcessor.getShaclFileText());



}

