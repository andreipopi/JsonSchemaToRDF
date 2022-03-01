"use strict";
exports.__esModule = true;
exports.SMDPattern = void 0;
var shaclShape_1 = require("./shaclShape");
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var SMDPattern = /** @class */ (function () {
    // Constructors
    function SMDPattern(source, mainObj) {
        // Attributes
        this.fs = require('fs');
        this.shaclFileText = '';
        this.prefixes = [];
        this.map = new Map();
        this.creator1 = 'https://pietercolpaert.be/#me';
        this.creator2 = 'https://www.linkedin.com/in/andrei-popescu/';
        //config = require('./configs/config-sdm.json');
        this.config = require('./configs/config-smartdatamodel.json');
        this.jsonSource = source; // Needed when creating a ShaclShape object
        this.jsonSchema = require(source);
        this.mainObject = mainObj;
        this.mainJsonObject = this.getMainJsonObject(this.mainObject);
        this.fileName = mainObj;
        for (var object in this.config.terms) {
            this.map.set(object, this.config.terms[object]);
        }
        this.writer = new N3.Writer({ prefixes: this.config.prefixes });
    }
    // Methods
    /** Creates and writes quads for the basic properties of a jsonSchema of the bike sharing system */
    SMDPattern.prototype.basicsToQuads = function () {
        this.description = this.jsonSchema.description;
        this.id = this.jsonSchema.$id;
        this.writer.addQuad(this.node_node_node('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'rdf:type', 'foaf:Document'));
        this.writer.addQuad(this.node_node_literal('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'rdfs:comment', this.description));
        this.writer.addQuad(this.node_node_literal('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'vann:preferredNamespaceUri', 'https://w3id.org/sdm/terms/' + this.mainJsonObject + '#'));
        this.writer.addQuad(this.node_node_node('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'dcterms:creator', this.creator1));
        this.writer.addQuad(this.node_node_node('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'dcterms:creator', this.creator2));
        this.writer.addQuad(this.node_node_node(this.creator1, 'rdf:type', 'foaf:Person'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:mbox', 'mailto:pieter.colpaert@imec.be'));
        this.writer.addQuad(this.node_node_literal(this.creator1, 'foaf:name', 'Pieter Colpaert'));
        // Create a ShaclShape object and insert the first entries
        this.shape = new shaclShape_1.ShaclShape(this.getRequiredProperties(), this.jsonSource, this.mainObject);
        this.shaclFileText = this.shaclFileText + this.shape.getShaclRoot();
        this.shaclFileText = this.shaclFileText + this.shape.getShaclTargetClass() + '\n';
    };
    /** Creates and writes quads for the main object's properties,
     * by checking if new terms are encountered (against a map of terms).
    */
    SMDPattern.prototype.propertiesToRDF = function (depth) {
        // GBFS
        // let path = this.jsonSchema.properties.data.properties[this.mainJsonObject]; // Path to the main object of the Json Schema
        // let properties = path.items.properties; // Path to the properties of the main object
        // SMD
        var path = this.jsonSchema[this.mainJsonObject]; // Path to the main object of the Json Schema
        console.log("path", path);
        var properties = path[2].properties; // Path to the properties of the main object
        console.log("properties", properties);
        //console.log("properties", properties);
        // GET the properties of the main object
        // If we are looking at depth 1 (second iteration), then we have to slightly change the paths
        var jsonobj;
        jsonobj = this.getMainJsonObject(this.mainObject);
        /*
        // GBFS
        if(depth == 1){ // Then we need the path to the nested object/array
            path = path.items.properties[jsonobj];
            // the object has either properties or items/properties
            if (path.properties == undefined){
                properties = path.items.properties;
            }
            else{
                properties = path.properties;
            }
            this.writer.addQuad(this.node_node_literal(this.mainObject, 'rdfs:label', path.description));
        }
        */
        // Add the main object to the vocabulary as a class
        this.writer.addQuad(this.node_node_node(this.mainObject, 'rdf:type', 'rdfs:Class'));
        // Properties of the main object ('allOf')
        var hiddenClasses = []; // usefull for the next iteration (depth = 1)
        for (var term in properties) {
            console.log("term: ", term);
            // Get the term type, subproperties, and description
            var termType = path;
            var termProperties = path;
            var termDescription = path;
            var directEnum = path;
            var subItems = path;
            var subProperties = path;
            // Some nested classes have no items, but directly properties. station_area in station_information requires this exception for example.
            // If we are at the second iteration, we have variable structure: some objects have items.properties, some only .properties
            if (depth > 0) {
                if (path.items == undefined) {
                    termType = path[2].properties[term].type;
                    termProperties = path[2].properties[term].properties;
                    termDescription = path[2].properties[term].description;
                    directEnum = path[2].properties[term]["enum"];
                    subProperties = path[2].properties[term].properties;
                    subItems = path[2].properties[term].items;
                }
                else {
                    termType = path[2].properties[term].type;
                    termProperties = path[2].properties[term].properties;
                    termDescription = path[2].properties[term].description;
                    directEnum = path[2].properties[term]["enum"];
                    subProperties = path[2].properties[term].properties;
                    subItems = path[2].properties[term].items;
                }
            }
            // Else we are at iteration 0 and we assume all having items.properties
            else {
                termType = path[2].properties[term].type;
                termProperties = path[2].properties[term].properties; //
                termDescription = path[2].properties[term].description;
                directEnum = path[2].properties[term]["enum"];
                subProperties = path[2].properties[term].properties;
                subItems = path[2].properties[term].items;
            }
            // If the property does not exist in the map, then we want it added to the vocabulary
            if (this.map.has(term) == false) {
                this.map.set(term, 'sdm:' + term); // Update our mapping with the new term: add   < term, 'sdm:'+term >
                // Sub-properties of 'Station/term'
                // if 'term' is an object and it has sub properties, or if it is an array
                if ((termType == 'object' && termProperties != undefined) || termType == 'array') {
                    this.writer.addQuad(this.node_node_node('sdm:' + term, 'rdf:type', 'rdf:Property')); // Add the property and its label
                    if (termDescription != undefined)
                        this.writer.addQuad(this.node_node_literal('sdm:' + term, 'rdfs:label', termDescription.toString()));
                    var newClassName = this.capitalizeFirstLetter(term); // Since it is an object/array, we give it a new class as a range
                    this.writer.addQuad(this.node_node_node('sdm:' + term, 'rdfs:range', 'sdm:' + newClassName));
                    // Add the new classes to a hiddenClasses array; these will be explored by this function in a second stage.
                    hiddenClasses = hiddenClasses.concat('sdm:' + newClassName);
                    //console.log('HIDDEN CLASSES: ',hiddenClasses);
                    //console.log("subItems",subItems);
                    // Either sub properties
                    if (subProperties != undefined) {
                        for (var subProperty in subProperties) {
                            var subsubProperty = path[2].properties[term].properties[subProperty];
                            if (subProperty != 'type') {
                                console.log("subproperty", subProperty);
                                console.log(subsubProperty);
                                // Add the subproperty to the vocabulary
                                //this.writer.addQuad(this.node_node_node('sdm:'+newClassName, 'rdf:Property','sdm:'+ subProperty));
                                // Check if there is an available description
                                if (subsubProperty.description != undefined) {
                                    this.writer.addQuad(this.node_node_literal('sdm:' + subProperty, 'rdfs:label', subsubProperty.description));
                                }
                                // and/or a type
                                if (subsubProperty.type != undefined) {
                                    this.writer.addQuad(this.node_node_literal('sdm:' + subProperty, 'rdf:type', subsubProperty.type));
                                }
                            } // else: we skip the type subproperties because of the modelling differences, e.g. see  station_area vs rental_uris vs rental_methods
                        }
                    }
                    // Or items (at least in the case of station_information)
                    if (subItems != undefined) {
                        var enumeration = path;
                        if (subItems.items != undefined) {
                            // Exception: there is no enumeration enountered here so far
                            enumeration = undefined;
                        }
                        else {
                            enumeration = properties[term].items["enum"];
                        }
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
                            var subPropQuad = this.node_node_list('sdm:' + newClassName, 'owl:oneOf', oneOfValues);
                            this.writer.addQuad(subPropQuad);
                        }
                    }
                }
                else {
                    // not an object or array -> it has a primitive datatype
                    if (termType != undefined) {
                        // Then create the quad and add it to the writer
                        this.writer.addQuad(this.node_node_node('sdm:' + term, 'rdf:type', 'rdf:Property'));
                        if (termDescription != undefined) {
                            this.writer.addQuad(this.node_node_literal('sdm:' + term, 'rdfs:label', termDescription.toString()));
                            this.writer.addQuad('sdm:' + term, 'rdfs:range', literal(termDescription.toString(), 'en'));
                        }
                    }
                    // it has some other datatype
                    else {
                        this.writer.addQuad(this.node_node_node('sdm:' + term, 'rdf:type', 'rdf:Property'));
                        this.writer.addQuad(this.node_node_literal('sdm:' + term, 'rdfs:label', termDescription.toString()));
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
                    var subPropQuad = this.node_node_list('sdm:' + term, 'owl:oneOf', oneOfValues);
                    this.writer.addQuad(subPropQuad);
                }
                if (termType == 'integer') {
                    this.writer.addQuad(this.node_node_node('sdm:' + term, 'rdfs:range', 'xsd:integer'));
                }
                if (termType == 'boolean') {
                    this.writer.addQuad(this.node_node_node('sdm:' + term, 'rdfs:range', 'xsd:boolean'));
                }
            }
            else {
                // The property is available in map, so we do not add it to the vocabulary
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
    SMDPattern.prototype.writeTurtle = function () {
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
    SMDPattern.prototype.writeShacl = function () {
        // Write the Shacl shape on file
        this.fs.writeFileSync("build/" + this.fileName + "shacl.ttl", this.shaclFileText, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    SMDPattern.prototype.getRequiredProperties = function () {
        var requiredMap = new Map();
        // GBFS
        // For each of the values in the required
        //console.log(this.mainJsonObject);
        //console.log(this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required);
        // 
        console.log(this.mainJsonObject);
        console.log(this.jsonSchema.required);
        var requiredPropExistingTerm;
        // GBFS
        /*
        for (const requiredProp of this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required){
            requiredPropExistingTerm = this.map.get(requiredProp.toString());
            requiredMap.set(requiredProp.toString(), requiredPropExistingTerm );
        }
        */
        // SDM
        for (var _i = 0, _a = this.jsonSchema.required; _i < _a.length; _i++) {
            var requiredProp = _a[_i];
            requiredPropExistingTerm = this.map.get(requiredProp.toString());
            requiredMap.set(requiredProp.toString(), requiredPropExistingTerm);
        }
        return requiredMap;
    };
    SMDPattern.prototype.getWriter = function () {
        return this.writer;
    };
    // Create quads of different shape
    SMDPattern.prototype.node_node_literal = function (subj, pred, obj) {
        if (pred == 'rdfs:label' || pred == 'rdfs:comment') {
            var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj, 'en'), defaultGraph());
            return myQuad;
        }
        else {
            var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
            return myQuad;
        }
    };
    SMDPattern.prototype.node_node_node = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
        return myQuad;
    };
    SMDPattern.prototype.node_node_list = function (subj, pred, list) {
        var myQuad = quad(namedNode(subj), namedNode(pred), this.writer.list(list), defaultGraph());
        return myQuad;
    };
    SMDPattern.prototype.node_literal_literal = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), literal(pred), literal(obj), defaultGraph());
        return myQuad;
    };
    SMDPattern.prototype.getXsdType = function (t) {
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
    SMDPattern.prototype.getMainJsonObject = function (mainObject) {
        switch (mainObject) {
            case 'sdm:ElectricalMeasurment': {
                return 'allOf';
                break;
            }
            // ---- Nested classes ----
        }
    };
    SMDPattern.prototype.setMainObject = function (mainObject) {
        this.mainObject = mainObject;
    };
    SMDPattern.prototype.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    SMDPattern.prototype.getPrefixes = function () {
        return this.prefixes;
    };
    return SMDPattern;
}());
exports.SMDPattern = SMDPattern;
