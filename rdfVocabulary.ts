import { write } from "fs";
import { arrayBuffer } from "stream/consumers";
import {ShaclShape} from './shaclShape';
import {DataFactory, Literal, Quad, Store} from "n3";
import literal = DataFactory.literal;
import { NamedNode } from "n3/lib/N3DataFactory";


const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class RDFVocabulary {
    // Attributes
    fs = require('fs');
    shaclFileText = '';
    jsonSource:any;
    jsonSchema: any;
    mainObject: any;
    mainJsonObject: any;
    prefixes: any;
    writer: any;
    map: Map<string, string>;

    // Basic elements of a Json schema
    schema: any;
    description: any;
    id: any;

    // Info about the vocabulary
    aDocument: any;
    descriptionQuad: any;
    uriQuad: any; 
    creator1 = 'https://pietercolpaert.be/#me';
    creator2 = 'https://www.linkedin.com/in/andrei-popescu/';
    creator1Quad: any;
    creator2Quad: any;
    // ShaclShape
    shape: any;
    fileName: any;

    // Constructors
    constructor (termMapping: Map<string, string>, source:string, mainObj: string ){
        this.jsonSource = source; //needed when creating a ShaclShape object
        this.jsonSchema = require(source);
        this.map = termMapping;

        this.mainObject = mainObj;
        this.mainJsonObject = this.getMainJsonObject(this.mainObject);

        this.fileName = mainObj;
        this.prefixes = {
            prefixes: {
                gbfsvcb: 'https://w3id.org/gbfs/vocabularies/'+ this.mainJsonObject+'#',
                schema: 'http://schema.org/#',
                ebucore: 'http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#',
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                foaf: 'http://xmlns.com/foaf/0.1/',
                dcterms: 'http://purl.org/dc/terms/',
                vs: 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
                geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
                vann: 'http://purl.org/vocab/vann/',
                owl: 'http://www.w3.org/2002/07/owl#',
                jsonsc: 'https://www.w3.org/2019/wot/json-schema#',
                airs: 'https://raw.githubusercontent.com/airs-linked-data/lov/latest/src/airs_vocabulary.ttl#',
                "dbpedia-owl": 'http://dbpedia.org/ontology/', //ERROR, should be dbpedia-owl but the - gives an error, not sure how to escape it
            }};

            this.writer = new N3.Writer(this.prefixes);
    }
    // Methods
    /** creates and writes quads for the basic properties of a jsonSchema of the bike sharing system */
    parseBasicsToQuads (){
        this.schema  = this.jsonSchema.$schema;
        this.description = this.jsonSchema.description;
        this.id = this.jsonSchema.$id;
        this.writer.addQuad(this.node_node_node('https://w3id.org/gbfs/vocabularies/'+ this.mainJsonObject, 'rdf:type', 'foaf:Document'));
        this.writer.addQuad(this.node_node_literal('https://w3id.org/gbfs/vocabularies/'+ this.mainJsonObject, 'rdfs:comment', this.description));
        this.writer.addQuad(this.node_node_literal('https://w3id.org/gbfs/vocabularies/'+ this.mainJsonObject, 'vann:preferredNamespaceUri', 'https://w3id.org/gbfs/vocabularies/'+this.mainJsonObject+'#'));
        this.writer.addQuad(this.node_node_node('https://w3id.org/gbfs/vocabularies/'+ this.mainJsonObject, 'dcterms:creator', this.creator1));
        this.writer.addQuad(this.node_node_node('https://w3id.org/gbfs/vocabularies/'+ this.mainJsonObject, 'dcterms:creator', this.creator2));
        this.writer.addQuad(this.node_node_node(this.creator1, 'rdf:type', 'foaf:Person'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:mbox', 'mailto:pieter.colpaert@imec.be'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:name', 'Pieter Colpaert'));
    }
    /** creates and writes quads
     * for the main object's properties, 
     * by checking if new terms are encountered (against map).  
    */
    parseMainObjectPropertiesToQuads (){
        // Add the main object to the vocabulary as a class
        this.writer.addQuad(this.node_node_node(this.mainObject, 'rdf:type', 'rdfs:Class'));
        this.writer.addQuad(this.node_node_literal(this.mainObject, 'rdfs:label', this.mainObject.split(":").pop()));

        // Create a ShaclShape object and insert the first entries
        this.shape = new ShaclShape(this.getRequiredProperties(), this.jsonSource, this.mainObject);
        this.shaclFileText = this.shaclFileText+this.shape.getShaclRoot();
        this.shaclFileText = this.shaclFileText+this.shape.getShaclTargetClass()+'\n';

        // Add new (not availalbe in config.map) properties to the vocabulary
        const properties = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties;
        console.log("properties",properties);
        // Properties of the main object (e.g.'Station')
        for (const term in properties){

            console.log(term);

            // Get the term type, subproperties, and description
             
            let termType = this.jsonSchema.properties.data.properties[this.mainJsonObject];

            if ( termType == undefined){
                // Exception of the gbfs.json which has patternProperties.properties......
                termType = this.jsonSchema.properties.data.patternProperties.properties[this.mainJsonObject].items.properties[term].type;
            }
            else{
                termType = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].type;
            }
            let termProperties = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].properties; 
            let termDescription = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].description;

            // If the property does not exist in the mapping, then we add it to the vocabulary
            if (this.map.has(term) == false) {
                
                // Update our mapping with the new term: add   < term, 'gbfsvcb:'+term >
                this.map.set(term, 'gbfsvcb:'+term);
                
                // Sub-properties of 'Station/term'
                // if 'term' is an object and it has sub properties, or if it is an array
                if((termType == 'object' && termProperties != undefined) || termType == 'array') {

                    // Add the property and its label
                    this.writer.addQuad(this.node_node_node('gbfsvcb:'+term, 'rdf:type', 'rdf:Property'));
                    this.writer.addQuad(this.node_node_literal('gbfsvcb:'+term, 'rdfs:label', termDescription.toString()));
        
                    // Since it is an object/array, we give it a new class as a range
                    const newClassName = this.capitalizeFirstLetter(term);
                    this.writer.addQuad(this.node_node_node('gbfsvcb:'+term, 'rdfs:range', 'gbfsvcb:'+newClassName));
                    // e.g. we create a new 'Rental_methods' class (in the case of rental_methods)
                    this.writer.addQuad(this.node_node_node('gbfsvcb:'+this.capitalizeFirstLetter(term), 'rdf:type', 'rdfs:Class'));

                    const subProperties = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].properties;
                    const subItems = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].items;
                                        
                    console.log("subItems",subItems);
                    // Either properties
                    if (subProperties != undefined) {
                        for (const subProperty in subProperties){
                            const subsubProperty = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].properties[subProperty];
                            if(subProperty != 'type'){
                                console.log("subproperty", subProperty);
                                console.log(subsubProperty);
                                // Add the subproperty to the vocabulary
                                this.writer.addQuad(this.node_node_node('gbfsvcb:'+newClassName, 'rdf:Property','gbfsvcb:'+ subProperty));
                                // Check if there is an available description
                                if(subsubProperty.description != undefined){
                                    this.writer.addQuad(this.node_node_literal('gbfsvcb:'+subProperty, 'rdfs:label', subsubProperty.description));
                                }
                                // and/or a type
                                if(subsubProperty.type != undefined){
                                    this.writer.addQuad(this.node_node_literal('gbfsvcb:'+subProperty, 'rdf:type', subsubProperty.type));
                                }
                            }// else: we skip the type subproperties because of the modelling differences, e.g. see  station_area vs rental_uris vs rental_methods
                        }
                    }

                    // Or items (at least in the case of station_information)
                    if (subItems != undefined) {
                        const enumeration = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].items.enum;
                        // Then we assume there is an enum
                       
                        if (enumeration != undefined){
                            //let oneOfValues ='(';

                            let oneOfValues:NamedNode[] = [];
                            for (const value of enumeration){
                                //We get the values from the mapping, else we create new terms
                                if (this.map.get(value)!= undefined) {
                                    oneOfValues.push(namedNode(this.map.get(value)));
                                }
                                else{
                                    oneOfValues.push(namedNode(value));
                                }
                            }
                            console.log("this is the list of values", oneOfValues);
                            let subPropQuad = this.node_node_list('gbfsvcb:'+newClassName, 'owl:oneOf', oneOfValues);
                            this.writer.addQuad(subPropQuad);
                        }
                        
                    }
                }

                // If it is not an object nor an array, then it is a property
                if(termType !='array' && termType !='object'){
                    // it has a primitive datatype
                    if(termType != undefined){
                        // Then create the quad and add it to the writer
                        this.writer.addQuad(this.node_node_node('gbfsvcb:'+term, 'rdf:type', 'rdf:Property'));
                        this.writer.addQuad(this.node_node_literal('gbfsvcb:'+term, 'rdfs:label', termDescription.toString()) );
                        this.writer.addQuad('gbfsvcb:'+term, 'rdfs:range', literal(termDescription.toString(), 'en') );
                    }
                    // it has some other datatype
                    else{
                        this.writer.addQuad(this.node_node_node('gbfsvcb:'+term, 'rdf:type', 'rdf:Property'));
                        this.writer.addQuad(this.node_node_literal('gbfsvcb:'+term, 'rdfs:label', termDescription.toString() ));
                        // Might be a more complex type, e.g. oneOf
                    }
                }
            }
            else{
                // The property is available in map
                this.writer.addQuad(this.node_node_node(this.mainObject, 'rdf:Property', this.map.get(term)));
            }

            // Write the property to the Shacl shape
            if (this.shape.isRequired(term)){
                // If the type is primitive
                if (termType == 'boolean' || termType == 'string' || termType == 'number') {
                    this.shaclFileText = this.shaclFileText+this.shape.getShaclTypedRequiredProperty(term, this.getXsdType(termType))+'\n';
                }
                else{
                    this.shaclFileText = this.shaclFileText+this.shape.getShaclRequiredProperty(term)+'\n';
                }
            }
            else{ // Else the property is not required
                // If the type is primitive
                if (termType == 'boolean' || termType == 'string' || termType == 'number') {
                    this.shaclFileText = this.shaclFileText+this.shape.getShaclTypedProperty(term, this.getXsdType(termType))+'\n';                }
                else{
                    this.shaclFileText = this.shaclFileText+this.shape.getShaclProperty(term)+'\n';
                }
            }
        }

        // Write the content of the writer in the .ttl
        this.writer.end((error, result) => this.fs.writeFile(`build/${this.fileName}.ttl`, result, (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;
            // success case, the file was saved
            console.log('Turtle saved!');}));


        // Write the Shacl shape on file
        this.fs.writeFileSync(`build/${this.fileName}shacl.ttl`, this.shaclFileText , function(err){
            if(err){
                return console.log("error");
            }
        });
    }
    
    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    getRequiredProperties () {
        let requiredMap = new Map<string, string>();
        // For each OF the values in the required
        console.log(this.mainJsonObject);
        console.log(this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required);

        for (const requiredProp of this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required){
            requiredMap.set(requiredProp.toString(), this.map.get(requiredProp.toString()));
        }
        
        return requiredMap;
    }

    getWriter (){
        return this.writer;
    }

    // Create quads of different shape
    node_node_literal (subj: string, pred:string, obj:string) {
        if(pred == 'rdfs:label' || pred == 'rdfs:comment'){
            const myQuad = quad( namedNode(subj), namedNode(pred), literal(obj, 'en'), defaultGraph());
            return myQuad;
        }
        else{
            const myQuad = quad( namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
            return myQuad;
        }
    }

    node_node_node (subj: string, pred:string, obj:string) {
        const myQuad = quad( namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
        return myQuad;
    }

    node_node_list (subj: string, pred:string, list:NamedNode[]) {
        const myQuad = quad( namedNode(subj), namedNode(pred), this.writer.list(list), defaultGraph());
        return myQuad;
    }

    node_literal_literal (subj: string, pred:string, obj:string) {
        const myQuad = quad( namedNode(subj), literal(pred), literal(obj), defaultGraph());
        return myQuad;
    }
    getXsdType (t:string) {
        switch(t) { 
            case 'string': { 
                return 'xsd:string';
                break; 
            } 
            case 'number': { 
               return 'xsd:float';
               break;
            } 
            case 'boolean': { 
                return 'xsd:boolean';
                break;
             } 
            default: { 
               //statements; 
               break; 
            } 
         } 
    }
    getMainJsonObject (mainObject:string) {
        switch(mainObject) { 
            case 'gbfsvcb:Station': { 
                return 'stations';
                break; 
            } 
            case 'gbfsvcb:Bike': { 
               return 'bikes';
               break;
            } 
            case 'gbfsvcb:Alert': { 
                return 'alerts';
                break;
            }
            case 'gbfsvcb:Region': { 
                return 'regions';
                break;
            }
            case 'gbfsvcb:VehicleType': { 
                return 'vehicle_types';
                break;
            }  
            case 'gbfsvcb:Feed': { 
                return 'feeds';
                break;
            }
            default: { 
               //statements; 
               break; 
            } 
         } 
    }
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    getPrefixes(){
        return this.prefixes;
    }
}