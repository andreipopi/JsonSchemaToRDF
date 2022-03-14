import { RDFTools } from "./rdfTools";
import {ShaclTools} from './shaclTools';
import { NamedNode } from "n3/lib/N3DataFactory";
import { convertToObject } from "typescript";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class JsonProcessor {
    // From config.json, we get:
    // prefixes, terms, , schema_objects(in the main)
    static config = require('./configs/config-gbfs.json');
    //static config = require('./configs/config-smartdatamodel.json');
    
    //static config = require('./configs/config-battery.json');

    static jsonSource: any;
    static jsonSchema: any;
    static mainObject: any;
    static mainJsonObject: any;
    static rdf_json_objects = new Map<string, string>();
    static termMap = new Map<string, string>();
    static writer: any;
    static path: any;
    static properties: any;
    static prefix: any;
    static creators: any[] = [];
    // Shacl shape
    static requiredMap = new Map<string, string>();
    static shaclFileText = "";
    static shaclTargetClass: any;
    static targets = new Map<string, string>();
    static shaclRoot: any;

    static initialise ( source:string, mainObj: string ){
        // RDF Vocabulary -------------------------
        // Getting configuration elements
        for (let object in this.config.jsonObjects){
            this.rdf_json_objects.set(object, this.config.jsonObjects[object]);
        }

        for (let object in this.config.terms){
            this.termMap.set(object, this.config.terms[object]);
        }
        this.writer = new N3.Writer({prefixes:this.config.prefixes});
        // Setting up basic info
        this.jsonSource = source; // Needed when creating a ShaclShape object
        this.jsonSchema = require(source);
        this.mainObject = mainObj; 
        this.mainJsonObject = this.getJsonObject(this.mainObject);
        this.prefix = this.config.prefix;
        // Set paths (TODO: set from confi.json)

        // SMD: ElectricalMeasurment and Battery schemas
        /*
        this.path = this.jsonSchema[this.mainJsonObject];
        this.properties = this.path[2].properties; // Path to the properties of the main object
        */

        // GBFS
        this.path = this.jsonSchema.properties.data.properties[this.mainJsonObject];
        this.properties = this.path.items.properties; // Path to the properties of the main object
    

        this.writer.addQuad(RDFTools.node_node_node('https://w3id.org/sdm/terms/'+ this.mainJsonObject, 'rdf:type', 'foaf:Document'));
        this.writer.addQuad(RDFTools.node_node_literal('https://w3id.org/sdm/terms/'+ this.mainJsonObject, 'rdfs:comment', this.jsonSchema.description));
        this.writer.addQuad(RDFTools.node_node_literal('https://w3id.org/sdm/terms/'+ this.mainJsonObject, 'vann:preferredNamespaceUri', 'https://w3id.org/sdm/terms/'+this.mainJsonObject+'#'));
        for (let creator in this.config.creators){
            this.creators.push(creator);
            this.writer.addQuad(RDFTools.node_node_node('https://w3id.org/sdm/terms/', 'dcterms:creator', this.config.creators[creator]));
        }
        // Shacl shape --------------------------
        // Setting a map containing < requiredProp, existingTermForRequiredProp>.
        this.shaclRoot = this.config.shaclRoot;
        for (const requiredProp of this.jsonSchema.required){
            if(this.termMap.has(requiredProp) != false){
                this.requiredMap.set(requiredProp.toString(), this.termMap.get(requiredProp.toString()));
            }
            else{
                this.requiredMap.set(requiredProp.toString(), requiredProp.toString());
            }
        }
        for (let object in this.config.shaclTargets){
            this.targets.set(object, this.config.shaclTargets[object]);
        }

        this.shaclFileText = ""; // reset in case there are more schemas
        this.shaclTargetClass = JsonProcessor.getShaclTarget(mainObj);
        // Create a ShaclShape object and insert the first entries
        this.shaclFileText = this.shaclFileText+ShaclTools.shapeShaclRoot(this.shaclRoot);
        this.shaclFileText = this.shaclFileText+'sh:targetClass ' + this.shaclTargetClass+ '; \n';
    }
    /**
     * 
     * @returns 
     */
    static callJsonTraverseRecursive(){
        let depth = 0;
        // For each propery of the main object, call the recursive function jsonTraverseRecursive, which will
        // recursively traverse each property up to depth = 1.
        for (let prop in this.properties){
            let mainJsonObject = JsonProcessor.getJsonObject(this.prefix+':'+ RDFTools.capitalizeFirstLetter(prop));
            this.jsonTraverseRecursive( depth, this.path, mainJsonObject, prop);
        };
        return;
    }

    /**
     * 
     * @param writer 
     * @param depth 
     * @param path 
     * @param mainJsonObject 
     * @param prop 
     * @returns 
     */
    static jsonTraverseRecursive ( depth, path, mainJsonObject, prop){
        // We only deal to depths <= 1; the following setups take care of that.
        let tmpPath;
        let propType;
        let subProperties;
        let subItems;
        let propDescription;
        let directEnum;
        let nestedEnum;
        let oneOf;
        let anyOf;

        if (depth == 0){
            // SMD
            /*
            propType = path[2].properties[prop].type;
            subProperties = path[2].properties[prop].properties;
            subItems = path[2].properties[prop].items;
            propDescription = path[2].properties[prop].description;
            directEnum = path[2].properties[prop].enum;
            anyOf = path[2].properties[prop].anyOf;
            if( subItems != undefined){
                nestedEnum = subItems.enum;
            }
            */
            // GBFS
            propType = path.items.properties[prop].type;
            subProperties = path.items.properties[prop].properties;
            subItems = path.items.properties[prop].items;
            propDescription = path.items.properties[prop].description;
            directEnum = path.items.properties[prop].enum;
            oneOf = path.items.properties[prop].oneOf;
            if( subItems != undefined){
                nestedEnum = subItems.enum;
            }
        }
        if (depth == 1){
            // SMD: Electrical measurment and Battery
            /*
            tmpPath = path[2].properties[mainJsonObject]; // adapt the path at depth 1 for the currently mainObject            
            if(tmpPath.properties != undefined){
                propType = tmpPath.properties[prop].type;
                subProperties = tmpPath.properties;
            }
            if(tmpPath.items != undefined){
                propType = tmpPath.items[prop].type;
                subItems = tmpPath.items[prop];
                directEnum = tmpPath.items[prop].enum;
            }
            propDescription = tmpPath.description;
            */

            // GBFS
            tmpPath = path.items.properties[mainJsonObject];
            if(tmpPath.items == undefined ){
                propType = tmpPath.type;
                subProperties = tmpPath.properties;
                propDescription = tmpPath.description;
                directEnum = tmpPath.enum;
                oneOf = tmpPath.oneOf;
            }
            else{
                propType = tmpPath.type;
                subItems = tmpPath.items;
                propDescription = tmpPath.description;
                directEnum = subItems.enum; // look at station_information.json 
                oneOf = tmpPath.oneOf;
            }

        }
        // Base cases 
        if(depth > 3){
            return;
        }

        if (propType == 'number'){
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix+':'+prop);
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+prop, 'rdfs:range', 'xsd:integer'));
                if(propDescription != undefined ){
                    this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)){
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedRequiredProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
                else{
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined){
                let quad = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad);
            }
            return;
        }
        if (propType == 'integer'){
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix+':'+prop);
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+prop, 'rdfs:range', 'xsd:integer'));
                if(propDescription != undefined ){
                    this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)){
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedRequiredProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
                else{
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined){
                let quad = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad);
            }
            return;
        }

        if (propType == 'string'){
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop,  this.prefix+':'+prop);
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+prop, 'rdfs:range', 'xsd:string'));
                if(propDescription != undefined ){
                    this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)){
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedRequiredProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
                else{
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined){
                let quad = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad);
            }
            return;
        }

        if (propType == 'boolean'){
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop,  this.prefix+':'+prop);
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+prop, 'rdfs:range', 'xsd:boolean'));
                if(propDescription != undefined ){
                    this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)){
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedRequiredProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
                else{
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclTypedProperty(prop, RDFTools.getXsdType(propType))+'\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined){
                let quad = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad);
            }
            return;
        }

        // Verify if there is a oneOf defined
        if (oneOf != undefined){
            let quad = JsonProcessor.getOneOfQuad(oneOf, prop);
            this.writer.addQuad(quad);
            return;
        }

        // first need to write sdm:RefDevice to file 
        if (anyOf != undefined){

            let quad = JsonProcessor.getEnumerationQuad(anyOf, prop);
            this.writer.addQuad(quad);
            return;
        }
      
        
        // Recursive step
        if(propType == 'object' || propType =='array'){
            let newClassName;
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix+':'+prop);
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+prop, 'rdf:type', 'rdf:Property')); // Add the property and its label
                newClassName = RDFTools.capitalizeFirstLetter(prop); // Since it is an object/array, we give it a new class as a range
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+prop, 'rdfs:range', this.prefix+':'+newClassName));


                // the new class becomes the mainobject
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+newClassName, 'rdf:type', 'rdfs:Class'));

                if(propDescription != undefined ){
                        this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+prop, 'rdfs:label', propDescription.toString()));
                }
                
                

                // Shacl shape text
                if (JsonProcessor.isRequired(prop)){
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclRequiredProperty(prop)+'\n';
                }
                else{ // Else the property is not required
                    this.shaclFileText = this.shaclFileText+ShaclTools.getShaclProperty(prop)+'\n';
                }
            }

            if (directEnum != undefined){
                let quad = JsonProcessor.getEnumerationQuad(directEnum, newClassName);
                this.writer.addQuad(quad);
            }
            if (nestedEnum != undefined){
                let quad = JsonProcessor.getEnumerationQuad(nestedEnum, newClassName);
                this.writer.addQuad(quad);
            }

            depth += 1;        
            
            
            //mainJsonObject = JsonProcessor.getJsonObject(this.prefix+':'+ RDFTools.capitalizeFirstLetter(prop));
            mainJsonObject = JsonProcessor.getJsonObject(this.prefix+':'+ newClassName);


            // An object can have sub properties
            if(subProperties != undefined){
                for (let prop in subProperties){
                    this.jsonTraverseRecursive( depth, path, mainJsonObject, prop);
                } 
            }
            // An array can have sub items


            if(subItems != undefined){
                for (let item in subItems){
                    this.jsonTraverseRecursive( depth, path, mainJsonObject, item);
                }
            }
        }
        return;
    }


    // Auxiliary Methods

    /**
     * OneOf
     * @param oneOf 
     * @param name 
     * @returns 
     */
    static getOneOfQuad(oneOf, name){
        let oneOfValues:NamedNode[] = [];
        for (const value of oneOf){
            let key = Object.keys(value);
            //We get the values from the mapping, else we create new terms
            if (this.termMap.has(value[key[0]])) {
                oneOfValues.push(namedNode(this.termMap.get(value[key[0]]).toString()));
            }
            else{
                oneOfValues.push(namedNode(value[key[0].toString()]));
            }
        }
        console.log("oneOfValues", oneOfValues);
        let subPropQuad = RDFTools.node_node_list(this.prefix+':'+name, 'owl:oneOf', this.writer.list(oneOfValues));
        return subPropQuad;
    }

    /**
     * Enum
     * @param directEnum 
     * @param name 
     * @returns 
     */
    static getEnumerationQuad(directEnum, name){
        let oneOfValues:NamedNode[] = [];
        let subPropQuad; 

        if (Array.isArray(directEnum)){
            console.log("is array", directEnum);
            for (const value of directEnum){
                //We get the values from the mapping, else we create new terms
                if (this.termMap.get(value)!= undefined) {
                    oneOfValues.push(namedNode(this.termMap.get(value)));
                }
                else{
                    oneOfValues.push(namedNode(value));
                }
            }
            subPropQuad = RDFTools.node_node_list(this.prefix+':'+name, 'owl:oneOf', this.writer.list(oneOfValues));    
        }
        // trial to manage different anyOf, but they all result in arrays.
        //if (typeof directEnum === 'object' ){
        //}
        return subPropQuad;
    }

    static getJsonObject(mainObject: string){
        for(let entry of Array.from(this.rdf_json_objects.entries())){
            const key = entry[0];
            const value = entry[1];
            if( key == mainObject){
                return this.rdf_json_objects.get(key);
            }
        }
    }
    static getMainObject(){
        return this.mainObject;
    }
    static getWriter(){
        return this.writer;
    }
    // For the Shacl shape
    static getShaclTarget (mainObject:string) {
        for(let entry of Array.from(this.targets.entries())){
            const key = entry[0];
            const value = entry[1];
            if( key == mainObject){
                return this.targets.get(key);
            }
        }
    }
    static isRequired (prop:string){
        if (this.requiredMap.has(prop)){
            return true;
        }
        else{
            return false;
        }
    }
    static getShaclFileText(){
        return this.shaclFileText;
    }
   
}