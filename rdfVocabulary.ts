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
            gtfsst: 'https://w3id.org/gbfs/stations#',
            schema: 'http://schema.org/url#',
            ebucore: 'http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#',
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            foaf: 'http://xmlns.com/foaf/0.1/',
            dcterms: 'http://purl.org/dc/terms/',
            vs: 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
            geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
            vann: 'http://purl.org/vocab/vann/',
            "w3c-ssn": 'http://www.w3.org/ns/ssn/hasProperty',
            owl: 'http://www.w3.org/2002/07/owl#',
            airs: 'https://raw.githubusercontent.com/airs-linked-data/lov/latest/src/airs_vocabulary.ttl#',
            "dbpedia-owl": 'http://dbpedia.org/ontology/', //ERROR, should be dbpedia-owl but the - gives an error, not sure how to escape it
        }};

    writer = new N3.Writer(this.prefixes);
    map: Map<string, string>;
    newTermsMap = new Map<string, string>();

    // Basic elements of a Json schema
    schema: any;
    description: any;
    id: any;

    // Info about the vocabulary
    vocabularyPrimaryTopic: any;
    aDocument: any;
    descriptionQuad: any;
    uriQuad: any; 
    containsQuad: any; 
   
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

        this.vocabularyPrimaryTopic = this.node_node_node('https://w3id.org/gbfs/stations','foaf:primaryTopic','https://w3id.org/gbfs/stations#');
        this.aDocument = this.node_node_node('https://w3id.org/gbfs/stations', 'rdf:type', 'foaf:Document');
        this.descriptionQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'rdfs:comment', this.description);
        this.uriQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'vann:preferredNamespaceUri', 'https://w3id.org/gbfs/stations#');
        this.containsQuad = this.node_node_node('https://w3id.org/gbfs/stations', 'contains', 'gtfsst:station');
        this.writer.addQuad(this.vocabularyPrimaryTopic);
        this.writer.addQuad(this.aDocument);
        this.writer.addQuad(this.descriptionQuad);
        this.writer.addQuad(this.uriQuad);
        this.writer.addQuad(this.containsQuad);
    }

    /** creates and writes quads(in the rdf vocab.) for the main object's properties, by checking if new terms are encountered (against map) */
    parseMainObjectPropertiesToQuads (){
        const fs = require('fs');
        // For each property IN the main object of json file (in this case station)
        for (const elem in this.jsonSchema.properties.data.properties.stations.items.properties){
            console.log(elem);

            // If the property exists in the mapping
            if (this.map.has(elem)) {
                console.log("  ", this.map.get(elem));
                // Then create the quad and add it to the writer
                let newQuad = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', this.map.get(elem));
                this.writer.addQuad(newQuad);
            }
            // else create a new term for the property and add it to the writer
            // additionaly, add the new term to a list of newly encountered terms
            else{
                let newQuad = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', elem);
                this.writer.addQuad(newQuad);
                this.newTermsMap.set(elem, elem);
            }
        }

        const mainObj = 'stations';


        for (const newTerm of Array.from(this.newTermsMap)) {
            console.log(newTerm[0]);
            console.log("newterm",newTerm);
            
            let termType = this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm[0]].type;
            let termProperties = this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm[0]].properties;

            // check for objects or arrays 
            if( termType == 'object' && termProperties != undefined) {

                let newQuad = this.node_node_node(newTerm[1], 'hasClass', 'Object');
                this.writer.addQuad(newQuad);
                console.log("object",this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm[0]].properties );
                // Then there might be other subproperties
                for (const subProperty in this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm[0]].properties){
                    console.log("looping over subproperties");
                    let subPropQuad = this.node_node_node(newTerm[0], 'w3c-ssn:hasProperty', subProperty);
                    this.writer.addQuad(subPropQuad);
                }
                
            }

            if(termType == 'array' ) {
                console.log("array");
                let newQuad = this.node_node_node(newTerm[1], 'hasClass', 'Array');
                this.writer.addQuad(newQuad);
                // Then there are elements
                for (const subProperty of this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm[0]]){
                    
                }
            }
            
            if(termType !='array' && termType !='object'){
                let newQuad = this.node_node_node(newTerm[1], 'rdf:type', termType);
                this.writer.addQuad(newQuad);

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
}