import { RDFTools } from './rdfTools';
import {ShaclTools} from './shaclTools';
import { Traverse }   from './traverse';
const N3 = require('n3');
const { DataFactory } = N3;


let schema_object = new Map<string, string>();
const config = require('./configs/config-gbfs.json');
//const config = require('./configs/config-smartdatamodel.json');

for( let object in config.sources){
    schema_object.set(object, config.sources[object]);
}

// For each schema in the system, traverse and RDF it.
for (let [schemaPath,object] of Array.from(schema_object)){
    let schema = require(schemaPath.toString());
    let writer = new N3.Writer({prefixes:config.prefixes});
    let prefix = config.prefix;
    Traverse.initialise(writer, prefix);
    RDFTools.initialise(object, config.terms); //initialising the filename written by RDF tools with the name of the main object
    //                      filename                   , 
    ShaclTools.initialise(object, object );
    Traverse.traverse('schema', schema);
    RDFTools.writeTurtle(Traverse.getWriter());
    ShaclTools.writeShacl();

    //ShaclTools.writeShacl(JsonProcessor.getMainObject(), JsonProcessor.getShaclFileText());
}

