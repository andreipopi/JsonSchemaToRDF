"use strict";
exports.__esModule = true;
exports.RDFVocabulary = void 0;
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var RDFVocabulary = /** @class */ (function () {
    // Constructors
    function RDFVocabulary(termMapping, source) {
        this.store = new N3.Store();
        this.prefixes = {
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
                "dbpedia-owl": 'http://dbpedia.org/ontology/'
            }
        };
        this.writer = new N3.Writer(this.prefixes);
        this.newTerms = [];
        this.creator1 = 'https://pietercolpaert.be/#me';
        this.creator2 = 'https://www.linkedin.com/in/andrei-popescu/';
        this.jsonSchema = require(source);
        this.map = termMapping;
        // Hardcoded -> can be made more general 
        this.mainObject = this.jsonSchema.properties.data.properties.stations;
    }
    // Methods
    /** creates and writes quads for the basic properties of a jsonSchema of the bike sharing system */
    RDFVocabulary.prototype.parseBasicsToQuads = function () {
        this.schema = this.jsonSchema.$schema;
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
    };
    /** creates and writes quads (in turtleTranslation.ttl)
     * for the main object's properties,
     * by checking if new terms are encountered (against map).
    */
    RDFVocabulary.prototype.parseMainObjectPropertiesToQuads = function () {
        var fs = require('fs');
        var mainObj = 'stations';
        // Add the main object to the vocabulary as a class
        var mainObjQuad = this.node_node_node('gbfsst:Station', 'rdf:type', 'rdfs:Class');
        this.writer.addQuad(mainObjQuad);
        this.writer.addQuad(this.node_node_literal('gbfsst:Station', 'rdf:label', 'Station'));
        // Add its new (not availalbe in config.map) properties to the vocabulary
        var properties = this.jsonSchema.properties.data.properties[mainObj].items.properties;
        // For each property IN the main object of json file (in this case station)
        // Properties
        for (var term in properties) {
            // If the property does not exists in the mapping, then we add it to the vocabulary
            if (this.map.has(term) == false) {
                var termType = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].type;
                var termProperties = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].properties;
                var termDescription = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].description;
                this.newTerms.push(term);
                // Sub-properties
                // check for objects or arrays 
                if ((termType == 'object' && termProperties != undefined) || termType == 'array') {
                    // Code specialised for station_information, where the only station property of type array is rental_methods
                    // We create a Rental_methods class
                    // Then create the quad and add it to the writer
                    var propQuad = this.node_node_node('gbfsst:' + term, 'rdf:type', 'rdf:Property');
                    this.writer.addQuad(propQuad);
                    var descriptionQuad = this.node_node_literal('gbfsst:' + term, 'rdf:label', termDescription.toString());
                    this.writer.addQuad(descriptionQuad);
                    var newClassName = this.capitalizeFirstLetter(term);
                    var newQuad = this.node_node_node('gbfsst:' + term, 'rdfs:range', 'gbfsst:' + newClassName);
                    this.writer.addQuad(newQuad);
                    var newClass = this.node_node_node('gbfsst:' + this.capitalizeFirstLetter(term), 'rdfs:type', 'rdfs:Class');
                    this.writer.addQuad(newClass);
                    var subProperties = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].properties;
                    // Then there are elements: either properties
                    if (subProperties != undefined) {
                        for (var subProperty in subProperties) {
                            var property = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].properties[subProperty];
                            if (subProperty != 'type') {
                                console.log("subproperty", subProperty);
                                console.log(property);
                                var subPropQuad = this.node_node_node('gbfsst:' + newClassName, 'rdf:Property', 'gbfsst:' + subProperty);
                                this.writer.addQuad(subPropQuad);
                                if (property.description != undefined) {
                                    var label = this.node_node_literal('gbfsst:' + subProperty, 'rdf:label', property.description);
                                    this.writer.addQuad(label);
                                }
                                if (property.type != undefined) {
                                    var type = this.node_node_literal('gbfsst:' + subProperty, 'rdf:type', property.type);
                                    this.writer.addQuad(type);
                                }
                            } // else: we skip the type subproperties because of the modelling differences, e.g. see  station_area vs rental_uris vs rental_methods
                        }
                    }
                    // Or items (at least in the case of station_information)
                    if (this.jsonSchema.properties.data.properties[mainObj].items.properties[term].items != undefined) {
                        var enumeration = this.jsonSchema.properties.data.properties[mainObj].items.properties[term].items["enum"];
                        // Then we assume there is an enum 
                        var oneOfValues = '(';
                        for (var _i = 0, enumeration_1 = enumeration; _i < enumeration_1.length; _i++) {
                            var value = enumeration_1[_i];
                            oneOfValues = oneOfValues + ' ' + value;
                        }
                        oneOfValues = oneOfValues + ' )';
                        console.log(oneOfValues);
                        var subPropQuad = this.node_node_literal('gbfsst:' + newClassName, 'owl:oneOf', oneOfValues);
                        this.writer.addQuad(subPropQuad);
                    }
                }
                // If it is not an object nor an array, then it is a property
                if (termType != 'array' && termType != 'object' && termType != undefined) {
                    // Then create the quad and add it to the writer
                    var propertyQuad = this.node_node_node('gbfsst:' + term, 'rdf:type', 'rdf:Property');
                    this.writer.addQuad(propertyQuad);
                    var descriptionQuad = this.node_node_literal('gbfsst:' + term, 'rdf:label', termDescription.toString());
                    this.writer.addQuad(descriptionQuad);
                    var rangeQuad = this.node_node_literal('gbfsst:' + term, 'rdfs:range', this.getXsdType(termType));
                    this.writer.addQuad(rangeQuad);
                }
            }
        }
        this.writer.end(function (error, result) { return fs.writeFile('turtleTranslation.ttl', result, function (err) {
            // throws an error, you could also catch it here
            if (err)
                throw err;
            // success case, the file was saved
            console.log('Turtle saved!');
        }); });
    };
    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    RDFVocabulary.prototype.getRequiredProperties = function () {
        var requiredMap = new Map();
        // For each OF the values in the required
        for (var _i = 0, _a = this.jsonSchema.properties.data.properties.stations.items.required; _i < _a.length; _i++) {
            var requiredProp = _a[_i];
            requiredMap.set(requiredProp.toString(), this.map.get(requiredProp.toString()));
        }
        return requiredMap;
    };
    // Create quads of different shape
    RDFVocabulary.prototype.node_node_literal = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
        return myQuad;
    };
    RDFVocabulary.prototype.node_node_node = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
        return myQuad;
    };
    RDFVocabulary.prototype.node_literal_literal = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), literal(pred), literal(obj), defaultGraph());
        return myQuad;
    };
    RDFVocabulary.prototype.getXsdType = function (t) {
        switch (t) {
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
    };
    RDFVocabulary.prototype.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    return RDFVocabulary;
}());
exports.RDFVocabulary = RDFVocabulary;
