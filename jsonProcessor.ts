import { RDFTools } from "./rdfTools";
import { NamedNode } from "n3/lib/N3DataFactory";


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
    static rdf_json_objects = new Map<string, string>();
    static termMap = new Map<string, string>();
    static writer: any;
    static path: any;
    static properties: any;

    static initialise ( source:string, mainObj: string ){
        // Getting configuration elements
        for( let object in this.config.jsonObjects){
            this.rdf_json_objects.set(object, this.config.jsonObjects[object]);
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

        // Set path (TODO: set from confi.json)
        this.path = this.jsonSchema[this.mainJsonObject];
        this.properties = this.path[2].properties; // Path to the properties of the main object

    }
    
    static callJsonTraverseRecursive(){
        let depth = 0;
        for (let prop in this.properties){
            this.mainJsonObject = JsonProcessor.getJsonObject('sdm:'+ RDFTools.capitalizeFirstLetter(prop));
            this.jsonTraverseRecursive(this.writer, depth, this.path, this.mainJsonObject, prop);
        };
        return;
    }

    static jsonTraverseRecursive (writer, depth, path, mainJsonObject, prop){
        
        // We only deal to depths <= 1; the following setups take care of that.
        let tmpPath;
        let propType;
        let subProperties;
        let propDescription;
        let directEnum;
        if (depth == 0){
            propType = path[2].properties[prop].type;
            subProperties = path[2].properties[prop].properties; //
            propDescription = path[2].properties[prop].description;
            directEnum = path[2].properties[prop].enum;
                    //let subSubProperties = path[2].properties[prop].properties;
                    //let subSubItems = path[2].properties[prop].items;
        }
        if (depth == 1){
            tmpPath = path[2].properties[mainJsonObject]; // adapt the path at depth 1 for the currently mainObject            
            
            console.log(mainJsonObject);
            console.log("property", prop);
            console.log("prop", tmpPath);
            propType = tmpPath.properties[prop].type;
            console.log("proptype", propType);
            subProperties = tmpPath.properties;
            propDescription = tmpPath.description;
            directEnum = tmpPath.properties[prop].enum;
                    //let subSubProperties = path.properties[prop].properties;
                    //let subItems = path.properties[prop].items;
        }


        // Base cases 
        if(depth > 2){
            return;
        }

        if (propType == 'number'){
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, 'sdm:'+prop);
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdfs:range', 'xsd:integer'));
                if(propDescription != undefined ){
                    this.writer.addQuad(RDFTools.node_node_literal('sdm:'+prop, 'rdfs:label', propDescription.toString()));
                }
            }
            return;
        }
        if (propType == 'boolean'){
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, 'sdm:'+prop);
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdfs:range', 'xsd:boolean'));
                if(propDescription != undefined ){
                    this.writer.addQuad(RDFTools.node_node_literal('sdm:'+prop, 'rdfs:label', propDescription.toString()));
                }
            }
            return;
        }

        // Recursive step
        if(propType == 'object' || propType =='array'){
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, 'sdm:'+prop);
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdf:type', 'rdf:Property')); // Add the property and its label
                const newClassName = RDFTools.capitalizeFirstLetter(prop); // Since it is an object/array, we give it a new class as a range
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdfs:range', 'sdm:'+newClassName));
                if(propDescription != undefined ){
                        this.writer.addQuad(RDFTools.node_node_literal('sdm:'+prop, 'rdfs:label', propDescription.toString()));
                }

                if (directEnum != undefined){
                    let oneOfValues:NamedNode[] = [];
                    for (const value of directEnum){
                        //We get the values from the mapping, else we create new terms
                        if (this.termMap.get(value)!= undefined) {
                            oneOfValues.push(namedNode(this.termMap.get(value)));
                        }
                        else{
                            oneOfValues.push(namedNode(value));
                        }
                    }
                    console.log("this is the list of values", oneOfValues);
                    let subPropQuad = RDFTools.node_node_list('sdm:'+newClassName, 'owl:oneOf', this.writer.list(oneOfValues));
                    this.writer.addQuad(subPropQuad);
                }
            
            }
            depth += 1;            
            mainJsonObject = JsonProcessor.getJsonObject('sdm:'+ RDFTools.capitalizeFirstLetter(prop));
            for (let prop in subProperties){
                this.jsonTraverseRecursive(this.writer, depth, path, mainJsonObject, prop);
            } 
        }
        return;
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

    static getMainObject (){
        return this.mainObject;
    }
    static getWriter(){
        return this.writer;
    }
}