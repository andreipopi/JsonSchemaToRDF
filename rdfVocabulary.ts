import { write } from "fs";
import { arrayBuffer } from "stream/consumers";

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class RDFVocabulary {
    // Attributes
    jsonSchema: any;
    store = new N3.Store();
    mainObject: any;
    prefixes = {
        prefixes: {
            gbfsst: 'https://w3id.org/gbfs/stations#',
            schema: 'http://schema.org/url#',
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

    writer = new N3.Writer(this.prefixes);
    map: Map<string, string>;
    newTerms = [];

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

    // Constructors
    constructor (termMapping: Map<string, string>, source:string, ){
        this.jsonSchema = require(source);
        this.map = termMapping;
        // Hardcoded -> can be made more general 
        this.mainObject = this.jsonSchema.properties.data.properties.stations;
    }

    // Methods
    /** creates and writes quads for the basic properties of a jsonSchema of the bike sharing system */
    parseBasicsToQuads (){
        this.schema  = this.jsonSchema.$schema;
        this.description = this.jsonSchema.description;
        this.id = this.jsonSchema.$id;

        this.aDocument = this.node_node_node('https://w3id.org/gbfs/stations', 'rdf:type', 'foaf:Document');
        this.descriptionQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'rdfs:comment', this.description);
        this.uriQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'vann:preferredNamespaceUri', 'https://w3id.org/gbfs/stations#');
        this.creator1Quad = this.node_node_node('https://w3id.org/gbfs/stations', 'dcterms:creator', this.creator1);
        this.creator2Quad = this.node_node_node('https://w3id.org/gbfs/stations', 'dcterms:creator', this.creator2);
       
        this.writer.addQuad(this.aDocument);
        this.writer.addQuad(this.descriptionQuad);
        this.writer.addQuad(this.uriQuad);
        this.writer.addQuad(this.creator1Quad);
        this.writer.addQuad(this.creator2Quad);
        this.writer.addQuad(this.node_node_node(this.creator1, 'rdf:type', 'foaf:Person'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:mbox', 'mailto:pieter.colpaert@imec.be'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:name', 'Pieter Colpaert'));

    }
    /** creates and writes quads (in turtleTranslation.ttl) 
     * for the main object's properties, 
     * by checking if new terms are encountered (against map).  
    */
    parseMainObjectPropertiesToQuads (){
        const fs = require('fs');
        const mainObj = 'stations'; // as available in the json file; used to loop over station properties

        // Add the main object to the vocabulary as a class
        this.writer.addQuad(this.node_node_node('gbfsst:Station', 'rdf:type', 'rdfs:Class'));
        this.writer.addQuad(this.node_node_literal('gbfsst:Station', 'rdf:label', 'Station'));

        // Add its new (not availalbe in config.map) properties to the vocabulary
        const properties = this.jsonSchema.properties.data.properties[mainObj].items.properties;
        
        // Properties of 'Station'
        for (const term in properties){
            // If the property does not exist in the mapping, then we add it to the vocabulary
            if (this.map.has(term) == false) {
                let termType = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].type;
                let termProperties = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].properties; 
                let termDescription = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].description;

                // Keep an array of new terms
                this.newTerms.push(term);
                
                
                // Sub-properties of 'Station/term'
                // if 'term' is an object and it has sub properties,
                if((termType == 'object' && termProperties != undefined) || termType == 'array') {
        
                    // Add property and its label
                    this.writer.addQuad(this.node_node_node('gbfsst:'+term, 'rdf:type', 'rdf:Property'));
                    this.writer.addQuad(this.node_node_literal('gbfsst:'+term, 'rdf:label', termDescription.toString()));
        
                    // Since it is an object/array, we give it a new class as a range
                    const newClassName = this.capitalizeFirstLetter(term);
                    this.writer.addQuad(this.node_node_node('gbfsst:'+term, 'rdfs:range', 'gbfsst:'+newClassName));
                    // e.g. we create a new 'Rental_methods' class (in the case of rental_methods)
                    this.writer.addQuad(this.node_node_node('gbfsst:'+this.capitalizeFirstLetter(term), 'rdfs:type', 'rdfs:Class'));

                    const subProperties = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].properties;
                    // Then there are elements: either properties
                    if (subProperties != undefined) {

                        for (const subProperty in subProperties){
                            const property = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].properties[subProperty];
                            if(subProperty != 'type'){
                                console.log("subproperty", subProperty);
                                console.log(property);

                                // Add the subproper
                                this.writer.addQuad(this.node_node_node('gbfsst:'+newClassName, 'rdf:Property','gbfsst:'+ subProperty));
    
                                if(property.description != undefined){
                                    this.writer.addQuad(this.node_node_literal('gbfsst:'+subProperty, 'rdf:label', property.description));
                                }
                                if(property.type != undefined){
                                    this.writer.addQuad(this.node_node_literal('gbfsst:'+subProperty, 'rdf:type', property.type));
                                }

                            }// else: we skip the type subproperties because of the modelling differences, e.g. see  station_area vs rental_uris vs rental_methods
                        }
                    }
                    // Or items (at least in the case of station_information)
                    if(this.jsonSchema.properties.data.properties[mainObj].items.properties[term].items != undefined){
                        const enumeration = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].items.enum;
                        // Then we assume there is an enum 
                        let oneOfValues ='(';
                        for (const value of enumeration){
                            oneOfValues = oneOfValues+ ' '+ value;
                        }
                        oneOfValues = oneOfValues+ ' )';
                        console.log(oneOfValues);
                        let subPropQuad = this.node_node_literal('gbfsst:'+newClassName, 'owl:oneOf', oneOfValues);
                        this.writer.addQuad(subPropQuad);
                    }
                }
                // If it is not an object nor an array, then it is a property
                if(termType !='array' && termType !='object' && termType != undefined){
                    // Then create the quad and add it to the writer
                    let propertyQuad = this.node_node_node('gbfsst:'+term, 'rdf:type', 'rdf:Property');
                    this.writer.addQuad(propertyQuad);
                    let descriptionQuad = this.node_node_literal('gbfsst:'+term, 'rdf:label', termDescription.toString());
                    this.writer.addQuad(descriptionQuad);
                    let rangeQuad = this.node_node_literal('gbfsst:'+term, 'rdfs:range', this.getXsdType(termType));
                    this.writer.addQuad(rangeQuad);
                }

            }
            else{
                // The property is available in map
            }
        }

        
        

        this.writer.end((error, result) => fs.writeFile('turtleTranslation.ttl', result, (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;
            // success case, the file was saved
            console.log('Turtle saved!');}));
    }

    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    getRequiredProperties () {
        let requiredMap = new Map<string, string>();
        // For each OF the values in the required
        for (const requiredProp of this.jsonSchema.properties.data.properties.stations.items.required){
            requiredMap.set(requiredProp.toString(), this.map.get(requiredProp.toString()));
        }
        return requiredMap;
    }

    // Create quads of different shape
    node_node_literal (subj: string, pred:string, obj:string) {
        const myQuad = quad( namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
        return myQuad;
    }
    node_node_node (subj: string, pred:string, obj:string) {
        const myQuad = quad( namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
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
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}