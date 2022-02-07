"use strict";
exports.__esModule = true;
exports.RDFVocabulary = void 0;
var shaclShape_1 = require("./shaclShape");
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var RDFVocabulary = /** @class */ (function () {
    // Constructors
    function RDFVocabulary(termMapping, source, mainObj) {
        // Attributes
        this.fs = require('fs');
        this.shaclFileText = '';
        this.creator1 = 'https://pietercolpaert.be/#me';
        this.creator2 = 'https://www.linkedin.com/in/andrei-popescu/';
        this.jsonSource = source; //needed when creating a ShaclShape object
        this.jsonSchema = require(source);
        this.map = termMapping;
        this.mainObject = mainObj;
        this.mainJsonObject = this.getMainJsonObject(this.mainObject);
        this.exploredObject = mainObj; // the main object for the first iteration
        this.fileName = mainObj;
        this.prefixes = {
            prefixes: {
                gbfsvcb: 'https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject + '#',
                schema: 'http://schema.org/#',
                ebucore: 'http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#',
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                foaf: 'http://xmlns.com/foaf/0.1/',
                xsd: 'http://www.w3.org/2001/XMLSchema#',
                dcterms: 'http://purl.org/dc/terms/',
                vs: 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
                geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
                vann: 'http://purl.org/vocab/vann/',
                owl: 'http://www.w3.org/2002/07/owl#',
                jsonsc: 'https://www.w3.org/2019/wot/json-schema#',
                airs: 'https://raw.githubusercontent.com/airs-linked-data/lov/latest/src/airs_vocabulary.ttl#',
                vso: 'http://purl.org/vso/ns#',
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
        this.writer.addQuad(this.node_node_node('https://w3id.org/gbfs/vocabularies/' + this.mainJsonObject, 'dcterms:creator', this.creator2));
        this.writer.addQuad(this.node_node_node(this.creator1, 'rdf:type', 'foaf:Person'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:mbox', 'mailto:pieter.colpaert@imec.be'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:name', 'Pieter Colpaert'));
    };
    /** creates and writes quads
     * for the main object's properties,
     * by checking if new terms are encountered (against map).
    */
    RDFVocabulary.prototype.parseMainObjectPropertiesToQuads = function (depth) {
        // Add the main object to the vocabulary as a class
        this.writer.addQuad(this.node_node_node(this.mainObject, 'rdf:type', 'rdfs:Class'));
        this.writer.addQuad(this.node_node_literal(this.mainObject, 'rdfs:label', this.mainObject.split(":").pop()));
        // Create a ShaclShape object and insert the first entries
        this.shape = new shaclShape_1.ShaclShape(this.getRequiredProperties(), this.jsonSource, this.mainObject);
        this.shaclFileText = this.shaclFileText + this.shape.getShaclRoot();
        this.shaclFileText = this.shaclFileText + this.shape.getShaclTargetClass() + '\n';
        // Add new (not availalbe in config.map) properties to the vocabulary
        var path = this.jsonSchema.properties.data.properties[this.mainJsonObject]; // Path to the main object of the Json Schema
        var properties = path.items.properties;
        if (depth == 1 && (this.mainObject == "gbfsvcb:Per_min_pricing" || this.mainObject == "gbfsvcb:Per_km_pricing" || this.mainObject == "gbfsvcb:Times" || this.mainObject == "gbfsvcb:Region_ids" || this.mainObject == "gbfsvcb:Station_ids" || this.mainObject == "gbfsvcb:User_types")) { //only take care of system_pricing.json for now
            // Then we need the path to the nested object/array
            path = path.items.properties[this.getMainJsonObject(this.mainObject)];
            properties = path.items.properties;
        }
        console.log("properties", properties);
        // Properties of the main object (e.g.'Station')
        var hiddenClasses = [];
        for (var term in properties) {
            console.log("Property: ", term);
            // Get the term type, subproperties, and description
            //let termType = this.jsonSchema.properties.data.properties[this.mainJsonObject];
            var termType = path;
            if (termType == undefined) {
                // Exception of the gbfs.json which has patternProperties.properties......
                termType = path.items.properties[term].type;
            }
            else {
                termType = path.items.properties[term].type;
            }
            var termProperties = path.items.properties[term].properties;
            var termDescription = path.items.properties[term].description;
            var directEnum = path.items.properties[term]["enum"];
            // If the property does not exist in the mapping, then we add it to the vocabulary
            if (this.map.has(term) == false) {
                // Update our mapping with the new term: add   < term, 'gbfsvcb:'+term >
                this.map.set(term, 'gbfsvcb:' + term);
                // Sub-properties of 'Station/term'
                // if 'term' is an object and it has sub properties, or if it is an array
                if ((termType == 'object' && termProperties != undefined) || termType == 'array') {
                    // Add the property and its label
                    this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdf:type', 'rdf:Property'));
                    if (termDescription != undefined)
                        this.writer.addQuad(this.node_node_literal('gbfsvcb:' + term, 'rdfs:label', termDescription.toString()));
                    // Since it is an object/array, we give it a new class as a range
                    var newClassName = this.capitalizeFirstLetter(term);
                    this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdfs:range', 'gbfsvcb:' + newClassName));
                    // Add the new classes to a hiddenClasses array; these will be explored by this function in a second stage.
                    hiddenClasses = hiddenClasses.concat('gbfsvcb:' + newClassName);
                    console.log('HIDDEN CLASSES: ', hiddenClasses);
                    var subProperties = path.items.properties[term].properties;
                    var subItems = path.items.properties[term].items;
                    console.log("subItems", subItems);
                    // Either properties
                    if (subProperties != undefined) {
                        for (var subProperty in subProperties) {
                            var subsubProperty = path.items.properties[term].properties[subProperty];
                            if (subProperty != 'type') {
                                console.log("subproperty", subProperty);
                                console.log(subsubProperty);
                                // Add the subproperty to the vocabulary
                                this.writer.addQuad(this.node_node_node('gbfsvcb:' + newClassName, 'rdf:Property', 'gbfsvcb:' + subProperty));
                                // Check if there is an available description
                                if (subsubProperty.description != undefined) {
                                    this.writer.addQuad(this.node_node_literal('gbfsvcb:' + subProperty, 'rdfs:label', subsubProperty.description));
                                }
                                // and/or a type
                                if (subsubProperty.type != undefined) {
                                    this.writer.addQuad(this.node_node_literal('gbfsvcb:' + subProperty, 'rdf:type', subsubProperty.type));
                                }
                            } // else: we skip the type subproperties because of the modelling differences, e.g. see  station_area vs rental_uris vs rental_methods
                        }
                    }
                    // Or items (at least in the case of station_information)
                    if (subItems != undefined) {
                        var enumeration = path.items.properties[term].items["enum"];
                        // Then we assume there is an enum
                        if (enumeration != undefined) {
                            var oneOfValues = [];
                            for (var _i = 0, enumeration_1 = enumeration; _i < enumeration_1.length; _i++) {
                                var value = enumeration_1[_i];
                                //We get the values from the mapping, else we create new terms
                                if (this.map.get(value) != undefined) {
                                    oneOfValues.push(namedNode(this.map.get(value)));
                                }
                                else {
                                    oneOfValues.push(namedNode(value));
                                }
                            }
                            console.log("this is the list of values", oneOfValues);
                            var subPropQuad = this.node_node_list('gbfsvcb:' + newClassName, 'owl:oneOf', oneOfValues);
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
                        if (termDescription != undefined) {
                            this.writer.addQuad(this.node_node_literal('gbfsvcb:' + term, 'rdfs:label', termDescription.toString()));
                            this.writer.addQuad('gbfsvcb:' + term, 'rdfs:range', literal(termDescription.toString(), 'en'));
                        }
                    }
                    // it has some other datatype
                    else {
                        this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdf:type', 'rdf:Property'));
                        this.writer.addQuad(this.node_node_literal('gbfsvcb:' + term, 'rdfs:label', termDescription.toString()));
                        // Might be a more complex type, e.g. oneOf
                    }
                }
                if (directEnum != undefined) {
                    console.log("DIRECT ENUM", directEnum);
                    // this code is repeated above, and needs to be put in a method
                    var oneOfValues = [];
                    for (var _a = 0, directEnum_1 = directEnum; _a < directEnum_1.length; _a++) {
                        var value = directEnum_1[_a];
                        //We get the values from the mapping, else we create new terms
                        if (this.map.get(value) != undefined) {
                            oneOfValues.push(namedNode(this.map.get(value)));
                        }
                        else {
                            oneOfValues.push(namedNode(value));
                        }
                    }
                    console.log("this is the list of values", oneOfValues);
                    var subPropQuad = this.node_node_list('gbfsvcb:' + term, 'owl:oneOf', oneOfValues);
                    this.writer.addQuad(subPropQuad);
                }
                if (termType == 'integer') {
                    this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdfs:range', 'xsd:integer'));
                }
                if (termType == 'boolean') {
                    this.writer.addQuad(this.node_node_node('gbfsvcb:' + term, 'rdfs:range', 'xsd:boolean'));
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
            else { // Else the property is not required
                // If the type is primitive
                if (termType == 'boolean' || termType == 'string' || termType == 'number') {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclTypedProperty(term, this.getXsdType(termType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclProperty(term) + '\n';
                }
            }
        }
        return hiddenClasses;
    };
    RDFVocabulary.prototype.writeTurtle = function () {
        var _this = this;
        // Write the content of the writer in the .ttl
        this.writer.end(function (error, result) { return _this.fs.writeFile("build/" + _this.fileName + ".ttl", result, function (err) {
            // throws an error, you could also catch it here
            if (err)
                throw err;
            // success case, the file was saved
            console.log('Turtle saved!');
        }); });
    };
    RDFVocabulary.prototype.writeShacl = function () {
        // Write the Shacl shape on file
        this.fs.writeFileSync("build/" + this.fileName + "shacl.ttl", this.shaclFileText, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    RDFVocabulary.prototype.getRequiredProperties = function () {
        var requiredMap = new Map();
        // For each OF the values in the required
        console.log(this.mainJsonObject);
        console.log(this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required);
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
    RDFVocabulary.prototype.node_node_list = function (subj, pred, list) {
        var myQuad = quad(namedNode(subj), namedNode(pred), this.writer.list(list), defaultGraph());
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
            case 'integer': {
                return 'xsd:integer';
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
            case 'gbfsvcb:Region': {
                return 'regions';
                break;
            }
            case 'gbfsvcb:VehicleType': {
                return 'vehicle_types';
                break;
            }
            case 'gbfsvcb:PricingPlan': {
                return 'plans';
                break;
            }
            case 'gbfsvcb:Version': {
                return 'versions';
                break;
            }
            case 'gbfsvcb:Calendar': {
                return 'calendars';
                break;
            }
            case 'gbfsvcb:RentalHour': {
                return 'rental_hours';
                break;
            }
            case 'gbfsvcb:Feed': {
                return 'feeds';
                break;
            }
            // Nested classes
            case 'gbfsvcb:Per_km_pricing': {
                return 'per_km_pricing';
                break;
            }
            case 'gbfsvcb:Per_min_pricing': {
                return 'per_min_pricing';
                break;
            }
            // Alert.ttl
            case 'gbfsvcb:Times': {
                return 'times';
                break;
            }
            case 'gbfsvcb:Station_ids': {
                return 'station_ids';
                break;
            }
            case 'gbfsvcb:Region_ids': {
                return 'region_ids';
                break;
            }
            // Rental Hour
            case 'gbfsvcb:User_types': {
                return 'user_types';
                break;
            }
            default: {
                //statements; 
                break;
            }
        }
    };
    RDFVocabulary.prototype.setMainObject = function (mainObject) {
        this.mainObject = mainObject;
    };
    RDFVocabulary.prototype.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    RDFVocabulary.prototype.getPrefixes = function () {
        return this.prefixes;
    };
    return RDFVocabulary;
}());
exports.RDFVocabulary = RDFVocabulary;
