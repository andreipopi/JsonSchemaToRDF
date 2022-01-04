"use strict";
exports.__esModule = true;
exports.RDFVocabulary = void 0;
var shaclShape_1 = require("./shaclShape");
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var RDFVocabulary = /** @class */ (function () {
    // Constructors
    function RDFVocabulary(termMapping, source) {
        // Attributes
        this.fs = require('fs');
        this.shaclFileText = '';
        this.newTerms = [];
        this.creator1 = 'https://pietercolpaert.be/#me';
        this.creator2 = 'https://www.linkedin.com/in/andrei-popescu/';
        this.jsonSource = source;
        this.jsonSchema = require(source);
        this.map = termMapping;
        // Hardcoded -> can be made more general 
        this.mainObject = 'gbfsvcb:Station';
        //this.mainObject = 'gbfsvcb:Bike';
        //this.mainObject = 'gbfsvcb:Alert';
        this.mainJsonObject = this.getMainJsonObject(this.mainObject);
        this.prefixes = {
            prefixes: {
                gbfsvcb: 'https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject + '#',
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
    }
    // Methods
    /** creates and writes quads for the basic properties of a jsonSchema of the bike sharing system */
    RDFVocabulary.prototype.parseBasicsToQuads = function () {
        this.schema = this.jsonSchema.$schema;
        this.description = this.jsonSchema.description;
        this.id = this.jsonSchema.$id;
        this.writer.addQuad(this.node_node_node('https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject, 'rdf:type', 'foaf:Document'));
        this.writer.addQuad(this.node_node_literal('https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject, 'rdfs:comment', this.description));
        this.writer.addQuad(this.node_node_literal('https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject, 'vann:preferredNamespaceUri', 'https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject + '#'));
        this.writer.addQuad(this.node_node_node('https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject, 'dcterms:creator', this.creator1));
        this.writer.addQuad(this.node_node_literal('https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject, 'dcterms:creator', this.creator2));
        this.writer.addQuad(this.node_node_node(this.creator1, 'rdf:type', 'foaf:Person'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:mbox', 'mailto:pieter.colpaert@imec.be'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:name', 'Pieter Colpaert'));
    };
    /** creates and writes quads (in turtleTranslation.ttl)
     * for the main object's properties,
     * by checking if new terms are encountered (against map).
    */
    RDFVocabulary.prototype.parseMainObjectPropertiesToQuads = function () {
        var _this = this;
        // Add the main object to the vocabulary as a class
        this.writer.addQuad(this.node_node_node(this.mainObject, 'rdf:type', 'rdfs:Class'));
        this.writer.addQuad(this.node_node_literal(this.mainObject, 'rdfs:label', this.mainObject.split(":").pop()));
        // Create a ShaclShape object and insert the first entries
        this.shape = new shaclShape_1.ShaclShape(this.getRequiredProperties(), this.jsonSource);
        this.shaclFileText = this.shaclFileText + this.shape.getShaclRoot();
        this.shaclFileText = this.shaclFileText + this.shape.getShaclTargetClass() + '\n';
        // Add its new (not availalbe in config.map) properties to the vocabulary
        var properties = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties;
        console.log("properties", properties);
        // Properties of the main object (e.g.'Station')
        for (var term in properties) {
            console.log(term);
            // If the property does not exist in the mapping, then we add it to the vocabulary
            var termType = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].type;
            var termProperties = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].properties;
            var termDescription = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].description;
            if (this.map.has(term) == false) {
                console.log(term + "type" + termType);
                // Keep an array of new terms (unused so far)
                this.newTerms.push(term);
                // Update our mapping with the new term: add   < term, 'gbfsvcb:'+term >
                this.map.set(term, 'gbfsvcb:' + term);
                // Sub-properties of 'Station/term'
                // if 'term' is an object and it has sub properties, or if it is an array
                if ((termType == 'object' && termProperties != undefined) || termType == 'array') {
                    // Add property and its label
                    this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdf:type', 'rdf:Property'));
                    this.writer.addQuad(this.node_node_literal('gbfsvcb:' + term, 'rdfs:label', termDescription.toString()));
                    // Since it is an object/array, we give it a new class as a range
                    var newClassName = this.capitalizeFirstLetter(term);
                    this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdfs:range', 'gbfsst:' + newClassName));
                    // e.g. we create a new 'Rental_methods' class (in the case of rental_methods)
                    this.writer.addQuad(this.node_node_node('gbfsvcb:' + this.capitalizeFirstLetter(term), 'rdfs:type', 'rdfs:Class'));
                    var subProperties = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].properties;
                    var subItems = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].items;
                    console.log("subItems", subItems);
                    // Either properties
                    if (subProperties != undefined) {
                        for (var subProperty in subProperties) {
                            var property = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].properties[subProperty];
                            if (subProperty != 'type') {
                                console.log("subproperty", subProperty);
                                console.log(property);
                                // Add the subproperty to the vocabulary
                                this.writer.addQuad(this.node_node_node('gbfsvcb:' + newClassName, 'rdf:Property', 'gbfsvcb:' + subProperty));
                                // Check if there is an available description
                                if (property.description != undefined) {
                                    this.writer.addQuad(this.node_node_literal('gbfsvcb:' + subProperty, 'rdfs:label', property.description));
                                }
                                // and/or a type
                                if (property.type != undefined) {
                                    this.writer.addQuad(this.node_node_literal('gbfsvcb:' + subProperty, 'rdf:type', property.type));
                                }
                            } // else: we skip the type subproperties because of the modelling differences, e.g. see  station_area vs rental_uris vs rental_methods
                        }
                    }
                    // Or items (at least in the case of station_information)
                    if (subItems != undefined) {
                        var enumeration = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.properties[term].items["enum"];
                        // Then we assume there is an enum
                        if (enumeration != undefined) {
                            var oneOfValues = '(';
                            for (var _i = 0, enumeration_1 = enumeration; _i < enumeration_1.length; _i++) {
                                var value = enumeration_1[_i];
                                oneOfValues = oneOfValues + ' ' + value;
                            }
                            oneOfValues = oneOfValues + ' )';
                            console.log(oneOfValues);
                            var subPropQuad = this.node_node_literal('gbfsvcb:' + newClassName, 'owl:oneOf', oneOfValues);
                            this.writer.addQuad(subPropQuad);
                        }
                    }
                }
                // If it is not an object nor an array, then it is a property
                if (termType != 'array' && termType != 'object') {
                    // it has a primitive datatype
                    if (termType != undefined) {
                        // Then create the quad and add it to the writer
                        this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdf:type', 'rdf:Property'));
                        this.writer.addQuad(this.node_node_literal('gbfsvcb:' + term, 'rdfs:label', termDescription.toString()));
                        this.writer.addQuad('gbfsvcb:' + term, 'rdfs:range', literal(termDescription.toString(), 'en'));
                    }
                    // it has some other datatype
                    else {
                        this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdf:type', 'rdf:Property'));
                        this.writer.addQuad(this.node_node_literal('gbfsvcb:' + term, 'rdfs:label', termDescription.toString()));
                        // Might be a more complex type, e.g. oneOf
                    }
                }
            }
            else {
                // The property is available in map
                this.writer.addQuad(this.node_node_node(this.mainObject, 'rdf:Property', this.map.get(term)));
            }
            // Write the property to the Shacl shape
            if (this.shape.isRequired(term)) {
                // If the type is primitive
                if (termType == 'boolean' || termType == 'string' || termType == 'number') {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclTypedRequiredProperty(term, this.getXsdType(termType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclRequiredProperty(term) + '\n';
                }
            }
            else {
                // If the type is primitive
                if (termType == 'boolean' || termType == 'string' || termType == 'number') {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclTypedProperty(term, this.getXsdType(termType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclProperty(term) + '\n';
                }
            }
        }
        // Write the content of the writer in the .ttl
        this.writer.end(function (error, result) { return _this.fs.writeFile('turtleTranslation.ttl', result, function (err) {
            // throws an error, you could also catch it here
            if (err)
                throw err;
            // success case, the file was saved
            console.log('Turtle saved!');
        }); });
        // Write the Shacl shape on file
        this.fs.writeFileSync("shacl.ttl", this.shaclFileText, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    RDFVocabulary.prototype.getRequiredProperties = function () {
        var requiredMap = new Map();
        // For each OF the values in the required
        for (var _i = 0, _a = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required; _i < _a.length; _i++) {
            var requiredProp = _a[_i];
            requiredMap.set(requiredProp.toString(), this.map.get(requiredProp.toString()));
        }
        return requiredMap;
    };
    RDFVocabulary.prototype.getWriter = function () {
        return this.writer;
    };
    // Create quads of different shape
    RDFVocabulary.prototype.node_node_literal = function (subj, pred, obj) {
        if (pred == 'rdfs:label' || pred == 'rdfs:comment') {
            var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj, 'en'), defaultGraph());
            return myQuad;
        }
        else {
            var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
            return myQuad;
        }
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
    RDFVocabulary.prototype.getMainJsonObject = function (mainObject) {
        switch (mainObject) {
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
