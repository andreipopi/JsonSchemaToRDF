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

    static callParseJsonRecursive(){

        let hiddenClasses:any[] = [];
        let depth = 0;
        this.parseJsonRecursive(this.writer, depth, this.path, this.mainJsonObject, this.properties);
        //path ?
        return // these will be modified 
    }

    static parseJsonRecursive (writer, depth, path, mainJsonObject, properties){
        console.log("in method");
        if (depth > 2){ // base case
            console.log("depth > 1");
            return;
        }
        else{
            for (const prop in properties){
                let tmpPath;
                let propType;
                let subProperties;
                let propDescription;

                console.log("depth", depth, "prop", prop);

                if (depth == 0){
                    propType = path[2].properties[prop].type;
                    subProperties = path[2].properties[prop].properties; //
                    propDescription = path[2].properties[prop].description;
                    
                    let directEnum = path[2].properties[prop].enum;
                    let subSubProperties = path[2].properties[prop].properties;
                    let subSubItems = path[2].properties[prop].items;
                }
                if (depth == 1){
                    console.log("depth",depth);
                    console.log(mainJsonObject);
                    console.log("path2", path[2]);
                    tmpPath = path[2].properties[mainJsonObject]; // adapt the path at depth 1 for the currently mainObject
                    console.log("tmppath",tmpPath);
                    propType = tmpPath.type;
                    subProperties = tmpPath.properties;
                    propDescription = tmpPath.description;
                    //let directEnum = path.properties[prop].enum;
                    //let subSubProperties = path.properties[prop].properties;
                    //let subItems = path.properties[prop].items;
                }

                if (this.termMap.has(prop)){
                    console.log("prop in map", prop);
                    // DO nothin;
                }
                else{
                    console.log("not in map prop:", prop);
                    // Base cases
                    // if(pattern4):
                    //    this.writer.addQuad(RDFTools.node_node_node('sdm:'+term, 'rdf:type', 'rdf:Property')); // Add the property and its label
                    //   return;
                    // Recursive calls
                    console.log(propType);
                    if(propType == 'object' || propType =='array'){
                        this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdf:type', 'rdf:Property')); // Add the property and its label
                        const newClassName = RDFTools.capitalizeFirstLetter(prop); // Since it is an object/array, we give it a new class as a range
                        this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdfs:range', 'sdm:'+newClassName));

                        depth += 1; 

                        console.log("depth increase",depth);
                        // properties = ?;
                        //path = ?;
                        mainJsonObject = JsonProcessor.getJsonObject('sdm:'+ RDFTools.capitalizeFirstLetter(prop));
                        // Recursive call if we are dealing with an object or an array, which have nested properties
                        return;
                        // return here?
                    }
                }
                console.log("exit if");        
            }
        }
        return;
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
        if (depth == 0){
            propType = path[2].properties[prop].type;
            subProperties = path[2].properties[prop].properties; //
            propDescription = path[2].properties[prop].description;
                    //let directEnum = path[2].properties[prop].enum;
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
                    //let directEnum = path.properties[prop].enum;
                    //let subSubProperties = path.properties[prop].properties;
                    //let subItems = path.properties[prop].items;
        }


        // Base cases 
        if(depth > 2){
            return;
        }

        if (propType == 'number'){
            if (this.termMap.has(prop) == false) {
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdfs:range', 'xsd:integer'));
            }
            return;
        }
        if (propType == 'boolean'){
            if (this.termMap.has(prop) == false) {
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdfs:range', 'xsd:boolean'));
            }
            return;
        }

        // Recursive step
        if(propType == 'object' || propType =='array'){
            if (this.termMap.has(prop) == false) {
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdf:type', 'rdf:Property')); // Add the property and its label
                const newClassName = RDFTools.capitalizeFirstLetter(prop); // Since it is an object/array, we give it a new class as a range
                this.writer.addQuad(RDFTools.node_node_node('sdm:'+prop, 'rdfs:range', 'sdm:'+newClassName));
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