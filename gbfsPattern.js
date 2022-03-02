"use strict";
exports.__esModule = true;
exports.GbfsPattern = void 0;
var shaclTools_1 = require("./shaclTools");
var rdfTools_1 = require("./rdfTools");
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var GbfsPattern = /** @class */ (function () {
    // Constructors
    function GbfsPattern(source, mainObj) {
        // Attributes
        this.fs = require('fs');
        this.shaclFileText = '';
        this.prefixes = [];
        this.map = new Map();
        this.creator1 = 'https://pietercolpaert.be/#me';
        this.creator2 = 'https://www.linkedin.com/in/andrei-popescu/';
        //config = require('./configs/config-gbfs.json');
        this.config = require('./configs/config-smartdatamodels.json');
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
    GbfsPattern.prototype.basicsToQuads = function () {
        this.description = this.jsonSchema.description;
        this.id = this.jsonSchema.$id;
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('https://w3id.org/gbfs/terms/' + this.mainJsonObject, 'rdf:type', 'foaf:Document'));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('https://w3id.org/gbfs/terms/' + this.mainJsonObject, 'rdfs:comment', this.description));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('https://w3id.org/gbfs/terms/' + this.mainJsonObject, 'vann:preferredNamespaceUri', 'https://w3id.org/gbfs/terms/' + this.mainJsonObject + '#'));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('https://w3id.org/gbfs/terms/' + this.mainJsonObject, 'dcterms:creator', this.creator1));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('https://w3id.org/gbfs/terms/' + this.mainJsonObject, 'dcterms:creator', this.creator2));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.creator1, 'rdf:type', 'foaf:Person'));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.creator1, 'foaf:mbox', 'mailto:pieter.colpaert@imec.be'));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.creator1, 'foaf:name', 'Pieter Colpaert'));
        // Create a ShaclShape object and insert the first entries
        this.shape = new shaclTools_1.ShaclTools(this.getRequiredProperties(), this.jsonSource, this.mainObject);
        this.shaclFileText = this.shaclFileText + this.shape.getShaclRoot();
        this.shaclFileText = this.shaclFileText + this.shape.getShaclTargetClass() + '\n';
    };
    /** Creates and writes quads for the main object's properties,
     * by checking if new terms are encountered (against a map of terms).
    */
    GbfsPattern.prototype.propertiesToRDF = function (depth) {
        var path = this.jsonSchema.properties.data.properties[this.mainJsonObject]; // Path to the main object of the Json Schema
        var properties = path.items.properties; // Path to the properties of the main object
        // GET the properties of the main object
        // If we are looking at depth 1 (second iteration), then we have to slightly change the paths
        var jsonobj;
        jsonobj = this.getMainJsonObject(this.mainObject);
        if (depth == 1) { // Then we need the path to the nested object/array
            path = path.items.properties[jsonobj];
            // the object has either properties or items/properties
            if (path.properties == undefined) {
                properties = path.items.properties;
            }
            else {
                properties = path.properties;
            }
            this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.mainObject, 'rdfs:label', path.description));
        }
        // Add the main object to the vocabulary as a class
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.mainObject, 'rdf:type', 'rdfs:Class'));
        // Properties of the main object (e.g.'Station')
        var hiddenClasses = []; // usefull for the next iteration (depth = 1)
        for (var term in properties) {
            console.log("Property: ", term);
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
                    termType = path.properties[term].type;
                    termProperties = path.properties[term].properties;
                    termDescription = path.properties[term].description;
                    directEnum = path.properties[term]["enum"];
                    subProperties = path.properties[term].properties;
                    subItems = path.properties[term].items;
                }
                else {
                    termType = path.items.properties[term].type;
                    termProperties = path.items.properties[term].properties;
                    termDescription = path.items.properties[term].description;
                    directEnum = path.items.properties[term]["enum"];
                    subProperties = path.items.properties[term].properties;
                    subItems = path.items.properties[term].items;
                }
            }
            // Else we are at iteration 0 and we assume all having items.properties
            else {
                termType = path.items.properties[term].type;
                termProperties = path.items.properties[term].properties;
                termDescription = path.items.properties[term].description;
                directEnum = path.items.properties[term]["enum"];
                subProperties = path.items.properties[term].properties;
                subItems = path.items.properties[term].items;
            }
            // If the property does not exist in the map, then we want it added to the vocabulary
            if (this.map.has(term) == false) {
                this.map.set(term, 'gbfs:' + term); // Update our mapping with the new term: add   < term, 'gbfs:'+term >
                // Sub-properties of 'Station/term'
                // if 'term' is an object and it has sub properties, or if it is an array
                if ((termType == 'object' && termProperties != undefined) || termType == 'array') {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('gbfs:' + term, 'rdf:type', 'rdf:Property')); // Add the property and its label
                    if (termDescription != undefined)
                        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('gbfs:' + term, 'rdfs:label', termDescription.toString()));
                    var newClassName = this.capitalizeFirstLetter(term); // Since it is an object/array, we give it a new class as a range
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('gbfs:' + term, 'rdfs:range', 'gbfs:' + newClassName));
                    // Add the new classes to a hiddenClasses array; these will be explored by this function in a second stage.
                    hiddenClasses = hiddenClasses.concat('gbfs:' + newClassName);
                    //console.log('HIDDEN CLASSES: ',hiddenClasses);
                    //console.log("subItems",subItems);
                    // Either sub properties
                    if (subProperties != undefined) {
                        for (var subProperty in subProperties) {
                            var subsubProperty = path.items.properties[term].properties[subProperty];
                            if (subProperty != 'type') {
                                console.log("subproperty", subProperty);
                                console.log(subsubProperty);
                                // Add the subproperty to the vocabulary
                                //this.writer.addQuad(this.node_node_node('gbfs:'+newClassName, 'rdf:Property','gbfs:'+ subProperty));
                                // Check if there is an available description
                                if (subsubProperty.description != undefined) {
                                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('gbfs:' + subProperty, 'rdfs:label', subsubProperty.description));
                                }
                                // and/or a type
                                if (subsubProperty.type != undefined) {
                                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('gbfs:' + subProperty, 'rdf:type', subsubProperty.type));
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
                            var subPropQuad = rdfTools_1.RDFTools.node_node_list('gbfs:' + newClassName, 'owl:oneOf', oneOfValues);
                            this.writer.addQuad(subPropQuad);
                        }
                    }
                }
                else {
                    // not an object or array -> it has a primitive datatype
                    if (termType != undefined) {
                        // Then create the quad and add it to the writer
                        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('gbfs:' + term, 'rdf:type', 'rdf:Property'));
                        if (termDescription != undefined) {
                            this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('gbfs:' + term, 'rdfs:label', termDescription.toString()));
                            this.writer.addQuad('gbfs:' + term, 'rdfs:range', literal(termDescription.toString(), 'en'));
                        }
                    }
                    // it has some other datatype
                    else {
                        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('gbfs:' + term, 'rdf:type', 'rdf:Property'));
                        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('gbfs:' + term, 'rdfs:label', termDescription.toString()));
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
                    var subPropQuad = rdfTools_1.RDFTools.node_node_list('gbfs:' + term, 'owl:oneOf', oneOfValues);
                    this.writer.addQuad(subPropQuad);
                }
                if (termType == 'integer') {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('gbfs:' + term, 'rdfs:range', 'xsd:integer'));
                }
                if (termType == 'boolean') {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('gbfs:' + term, 'rdfs:range', 'xsd:boolean'));
                }
            }
            else {
                // The property is available in map, so we do not add it to the vocabulary
            }
            // Write the property to the Shacl shape
            if (this.shape.isRequired(term)) {
                // If the type is primitive
                if (termType == 'boolean' || termType == 'string' || termType == 'number') {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclTypedRequiredProperty(term, rdfTools_1.RDFTools.getXsdType(termType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclRequiredProperty(term) + '\n';
                }
            }
            else { // Else the property is not required
                // If the type is primitive
                if (termType == 'boolean' || termType == 'string' || termType == 'number') {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclTypedProperty(term, rdfTools_1.RDFTools.getXsdType(termType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + this.shape.getShaclProperty(term) + '\n';
                }
            }
        }
        return hiddenClasses;
    };
    GbfsPattern.prototype.writeTurtle = function () {
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
    GbfsPattern.prototype.writeShacl = function () {
        // Write the Shacl shape on file
        this.fs.writeFileSync("build/" + this.fileName + "shacl.ttl", this.shaclFileText, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    GbfsPattern.prototype.getRequiredProperties = function () {
        var requiredMap = new Map();
        // For each of the values in the required
        console.log(this.mainJsonObject);
        console.log(this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required);
        var requiredPropExistingTerm;
        for (var _i = 0, _a = this.jsonSchema.properties.data.properties[this.mainJsonObject].items.required; _i < _a.length; _i++) {
            var requiredProp = _a[_i];
            requiredPropExistingTerm = this.map.get(requiredProp.toString());
            requiredMap.set(requiredProp.toString(), requiredPropExistingTerm);
        }
        return requiredMap;
    };
    /*
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
            case 'integer':{
                return 'xsd:integer';
                break;
            }
            default: {
               //statements;
               break;
            }
         }
    }
    */
    GbfsPattern.prototype.getMainJsonObject = function (mainObject) {
        switch (mainObject) {
            case 'gbfs:Station': {
                return 'stations';
                break;
            }
            case 'gbfs:Bike': {
                return 'bikes';
                break;
            }
            case 'gbfs:Alert': {
                return 'alerts';
                break;
            }
            case 'gbfs:Region': {
                return 'regions';
                break;
            }
            case 'gbfs:VehicleType': {
                return 'vehicle_types';
                break;
            }
            case 'gbfs:PricingPlan': {
                return 'plans';
                break;
            }
            case 'gbfs:Version': {
                return 'versions';
                break;
            }
            case 'gbfs:Calendar': {
                return 'calendars';
                break;
            }
            case 'gbfs:RentalHour': {
                return 'rental_hours';
                break;
            }
            case 'gbfs:Feed': {
                return 'feeds';
                break;
            }
            // ---- Nested classes ----
            case 'gbfs:Per_km_pricing': {
                return 'per_km_pricing';
                break;
            }
            case 'gbfs:Per_min_pricing': {
                return 'per_min_pricing';
                break;
            }
            // Alert.ttl
            case 'gbfs:Times': {
                return 'times';
                break;
            }
            case 'gbfs:Station_ids': {
                return 'station_ids';
                break;
            }
            case 'gbfs:Region_ids': {
                return 'region_ids';
                break;
            }
            // Rental Hour
            case 'gbfs:User_types': {
                return 'user_types';
                break;
            }
            case 'gbfs:Days': {
                return 'days';
                break;
            }
            // Station Information
            case 'gbfs:Rental_methods': {
                return 'rental_methods';
                break;
            }
            case 'gbfs:Station_area': {
                return 'station_area';
                break;
            }
            case 'gbfs:Rental_uris': {
                return 'rental_uris';
                break;
            }
            // and so on...
            case 'gbfs:Return_type': {
                return 'return_type';
                break;
            }
            case 'gbfs:Vehicle_assets': {
                return 'vehicle_assets';
                break;
            }
            case 'gbfs:Pricing_plan_ids': {
                return 'pricing_plan_ids';
                break;
            }
            default: {
                //statements; 
                break;
            }
        }
    };
    GbfsPattern.prototype.setMainObject = function (mainObject) {
        this.mainObject = mainObject;
    };
    GbfsPattern.prototype.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    return GbfsPattern;
}());
exports.GbfsPattern = GbfsPattern;
