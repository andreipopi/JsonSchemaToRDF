import { RDFTools } from "./rdfTools";

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class JsonProcessor {

    // From config.json, we get:
    // prefixes, terms, , schema_objects(in the main)
    static config = require('./configs/config-smartdatamodel.json');
    static jsonSource: any;
    static jsonSchema: any;
    static mainObject: any;
    static mainJsonObject: any;
    static fileName: any;
    static rdf_json_objects = new Map<string, string>();
    static termMap = new Map<string, string>();
    static writer: any;
    static path: any;

    static initialise ( source:string, mainObj: string ){
        // Getting configuration elements
        for( let object in this.config.jsonObjects){
            this.rdf_json_objects.set(object, this.config.rdf_json[object]);
        }
        for( let object in this.config.terms){
            this.termMap.set(object, this.config.terms[object]);
        }
        this.writer = new N3.Writer({prefixes:this.config.prefixes});
        // Setting up basic info
        this.jsonSource = source; // Needed when creating a ShaclShape object
        this.jsonSchema = require(source);
        this.mainObject = mainObj; 
        this.mainJsonObject = this.getJsonObject(this.mainObject);
        this.fileName = mainObj;

        // Set path (TODO: set from confi.json)
        this.path = this.jsonSchema[this.mainJsonObject];
    }

    static callParseJsonRecursive(path){
        let depth = 0;
        let hiddenClasses = this.parseJsonRecursive(this.writer, depth, path);
        //path ?
        return hiddenClasses; // these will be modified 
    }

    static parseJsonRecursive (writer, depth, path){

        if (depth > 2){ // base case
            return
        }
        else{
            for (const prop in properties){
                if (this.termMap.has(prop)){
                    return // base case
                }

                else{
                    // Base cases
                    if(pattern4):
                        this.writer.addQuad(RDFTools.node_node_node('sdm:'+term, 'rdf:type', 'rdf:Property')); // Add the property and its label
                        return
                    if(pattern5):
                        writer.write
                        return
                    if(pattern6):
                        writer.write
                        return
                    // Recursive calls
                    if(pattern1 or patter 2):
                        hiddenClasses = hiddenClasses.concat('sdm:'+newClassName);
                        writer.write
                        return
                }
            }
        }
    }
    
    static getJsonObject (mainObject: string){
        for(let entry of Array.from(this.rdf_json_objects.entries())){
            const key = entry[0];
            const value = entry[1];
            if( key == mainObject){
                return this.rdf_json_objects.get(key);
            }
        }
    }
}