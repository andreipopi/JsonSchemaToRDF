"use strict";
exports.__esModule = true;
exports.JsonProcessor = void 0;
var rdfTools_1 = require("./rdfTools");
var shaclTools_1 = require("./shaclTools");
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var JsonProcessor = /** @class */ (function () {
    function JsonProcessor() {
    }
    JsonProcessor.initialise = function (source, mainObj) {
        // RDF Vocabulary -------------------------
        // Getting configuration elements
        for (var object in this.config.jsonObjects) {
            this.rdf_json_objects.set(object, this.config.jsonObjects[object]);
        }
        for (var object in this.config.terms) {
            this.termMap.set(object, this.config.terms[object]);
        }
        this.writer = new N3.Writer({ prefixes: this.config.prefixes });
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
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'rdf:type', 'foaf:Document'));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'rdfs:comment', this.jsonSchema.description));
        this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('https://w3id.org/sdm/terms/' + this.mainJsonObject, 'vann:preferredNamespaceUri', 'https://w3id.org/sdm/terms/' + this.mainJsonObject + '#'));
        for (var creator in this.config.creators) {
            this.creators.push(creator);
            this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('https://w3id.org/sdm/terms/', 'dcterms:creator', this.config.creators[creator]));
        }
        // Shacl shape --------------------------
        // Setting a map containing < requiredProp, existingTermForRequiredProp>.
        this.shaclRoot = this.config.shaclRoot;
        for (var _i = 0, _a = this.jsonSchema.required; _i < _a.length; _i++) {
            var requiredProp = _a[_i];
            if (this.termMap.has(requiredProp) != false) {
                this.requiredMap.set(requiredProp.toString(), this.termMap.get(requiredProp.toString()));
            }
            else {
                this.requiredMap.set(requiredProp.toString(), requiredProp.toString());
            }
        }
        for (var object in this.config.shaclTargets) {
            this.targets.set(object, this.config.shaclTargets[object]);
        }
        this.shaclFileText = ""; // reset in case there are more schemas
        this.shaclTargetClass = JsonProcessor.getShaclTarget(mainObj);
        // Create a ShaclShape object and insert the first entries
        this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.shapeShaclRoot(this.shaclRoot);
        this.shaclFileText = this.shaclFileText + 'sh:targetClass ' + this.shaclTargetClass + '; \n';
    };
    /**
     *
     * @returns
     */
    JsonProcessor.callJsonTraverseRecursive = function () {
        var depth = 0;
        // For each propery of the main object, call the recursive function jsonTraverseRecursive, which will
        // recursively traverse each property up to depth = 1.
        for (var prop in this.properties) {
            var mainJsonObject = JsonProcessor.getJsonObject(this.prefix + ':' + rdfTools_1.RDFTools.capitalizeFirstLetter(prop));
            this.jsonTraverseRecursive(depth, this.path, mainJsonObject, prop);
        }
        ;
        return;
    };
    /**
     *
     * @param writer
     * @param depth
     * @param path
     * @param mainJsonObject
     * @param prop
     * @returns
     */
    JsonProcessor.jsonTraverseRecursive = function (depth, path, mainJsonObject, prop) {
        // We only deal to depths <= 1; the following setups take care of that.
        var tmpPath;
        var propType;
        var subProperties;
        var subItems;
        var propDescription;
        var directEnum;
        var nestedEnum;
        var oneOf;
        var anyOf;
        if (depth == 0) {
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
            directEnum = path.items.properties[prop]["enum"];
            oneOf = path.items.properties[prop].oneOf;
            if (subItems != undefined) {
                nestedEnum = subItems["enum"];
            }
        }
        if (depth == 1) {
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
            if (tmpPath.items == undefined) {
                propType = tmpPath.type;
                subProperties = tmpPath.properties;
                propDescription = tmpPath.description;
                directEnum = tmpPath["enum"];
                oneOf = tmpPath.oneOf;
            }
            else {
                propType = tmpPath.type;
                subItems = tmpPath.items;
                propDescription = tmpPath.description;
                directEnum = subItems["enum"]; // look at station_information.json 
                oneOf = tmpPath.oneOf;
            }
        }
        // Base cases 
        if (depth > 3) {
            return;
        }
        if (propType == 'number') {
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix + ':' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.prefix + ':' + prop, 'rdfs:range', 'xsd:integer'));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.prefix + ':' + prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)) {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedRequiredProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined) {
                var quad_1 = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad_1);
            }
            return;
        }
        if (propType == 'integer') {
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix + ':' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.prefix + ':' + prop, 'rdfs:range', 'xsd:integer'));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.prefix + ':' + prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)) {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedRequiredProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined) {
                var quad_2 = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad_2);
            }
            return;
        }
        if (propType == 'string') {
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix + ':' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.prefix + ':' + prop, 'rdfs:range', 'xsd:string'));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.prefix + ':' + prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)) {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedRequiredProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined) {
                var quad_3 = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad_3);
            }
            return;
        }
        if (propType == 'boolean') {
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix + ':' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.prefix + ':' + prop, 'rdfs:range', 'xsd:boolean'));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.prefix + ':' + prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)) {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedRequiredProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
                else {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclTypedProperty(prop, rdfTools_1.RDFTools.getXsdType(propType)) + '\n';
                }
            }
            // An enum can be defined within 'whatever' construct
            if (directEnum != undefined) {
                var quad_4 = JsonProcessor.getEnumerationQuad(directEnum, prop);
                this.writer.addQuad(quad_4);
            }
            return;
        }
        // Verify if there is a oneOf defined
        if (oneOf != undefined) {
            var quad_5 = JsonProcessor.getOneOfQuad(oneOf, prop);
            this.writer.addQuad(quad_5);
            return;
        }
        // first need to write sdm:RefDevice to file 
        if (anyOf != undefined) {
            var quad_6 = JsonProcessor.getEnumerationQuad(anyOf, prop);
            this.writer.addQuad(quad_6);
            return;
        }
        // Recursive step
        if (propType == 'object' || propType == 'array') {
            var newClassName = void 0;
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, this.prefix + ':' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.prefix + ':' + prop, 'rdf:type', 'rdf:Property')); // Add the property and its label
                newClassName = rdfTools_1.RDFTools.capitalizeFirstLetter(prop); // Since it is an object/array, we give it a new class as a range
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.prefix + ':' + prop, 'rdfs:range', this.prefix + ':' + newClassName));
                // the new class becomes the mainobject
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node(this.prefix + ':' + newClassName, 'rdf:type', 'rdfs:Class'));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal(this.prefix + ':' + prop, 'rdfs:label', propDescription.toString()));
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)) {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclRequiredProperty(prop) + '\n';
                }
                else { // Else the property is not required
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclProperty(prop) + '\n';
                }
            }
            if (directEnum != undefined) {
                var quad_7 = JsonProcessor.getEnumerationQuad(directEnum, newClassName);
                this.writer.addQuad(quad_7);
            }
            if (nestedEnum != undefined) {
                var quad_8 = JsonProcessor.getEnumerationQuad(nestedEnum, newClassName);
                this.writer.addQuad(quad_8);
            }
            depth += 1;
            //mainJsonObject = JsonProcessor.getJsonObject(this.prefix+':'+ RDFTools.capitalizeFirstLetter(prop));
            mainJsonObject = JsonProcessor.getJsonObject(this.prefix + ':' + newClassName);
            // An object can have sub properties
            if (subProperties != undefined) {
                for (var prop_1 in subProperties) {
                    this.jsonTraverseRecursive(depth, path, mainJsonObject, prop_1);
                }
            }
            // An array can have sub items
            if (subItems != undefined) {
                for (var item in subItems) {
                    this.jsonTraverseRecursive(depth, path, mainJsonObject, item);
                }
            }
        }
        return;
    };
    // Auxiliary Methods
    /**
     * OneOf
     * @param oneOf
     * @param name
     * @returns
     */
    JsonProcessor.getOneOfQuad = function (oneOf, name) {
        var oneOfValues = [];
        for (var _i = 0, oneOf_1 = oneOf; _i < oneOf_1.length; _i++) {
            var value = oneOf_1[_i];
            var key = Object.keys(value);
            //We get the values from the mapping, else we create new terms
            if (this.termMap.has(value[key[0]])) {
                oneOfValues.push(namedNode(this.termMap.get(value[key[0]]).toString()));
            }
            else {
                oneOfValues.push(namedNode(value[key[0].toString()]));
            }
        }
        console.log("oneOfValues", oneOfValues);
        var subPropQuad = rdfTools_1.RDFTools.node_node_list(this.prefix + ':' + name, 'owl:oneOf', this.writer.list(oneOfValues));
        return subPropQuad;
    };
    /**
     * Enum
     * @param directEnum
     * @param name
     * @returns
     */
    JsonProcessor.getEnumerationQuad = function (directEnum, name) {
        var oneOfValues = [];
        var subPropQuad;
        if (Array.isArray(directEnum)) {
            console.log("is array", directEnum);
            for (var _i = 0, directEnum_1 = directEnum; _i < directEnum_1.length; _i++) {
                var value = directEnum_1[_i];
                //We get the values from the mapping, else we create new terms
                if (this.termMap.get(value) != undefined) {
                    oneOfValues.push(namedNode(this.termMap.get(value)));
                }
                else {
                    oneOfValues.push(namedNode(value));
                }
            }
            subPropQuad = rdfTools_1.RDFTools.node_node_list(this.prefix + ':' + name, 'owl:oneOf', this.writer.list(oneOfValues));
        }
        // trial to manage different anyOf, but they all result in arrays.
        //if (typeof directEnum === 'object' ){
        //}
        return subPropQuad;
    };
    JsonProcessor.getJsonObject = function (mainObject) {
        for (var _i = 0, _a = Array.from(this.rdf_json_objects.entries()); _i < _a.length; _i++) {
            var entry = _a[_i];
            var key = entry[0];
            var value = entry[1];
            if (key == mainObject) {
                return this.rdf_json_objects.get(key);
            }
        }
    };
    JsonProcessor.getMainObject = function () {
        return this.mainObject;
    };
    JsonProcessor.getWriter = function () {
        return this.writer;
    };
    // For the Shacl shape
    JsonProcessor.getShaclTarget = function (mainObject) {
        for (var _i = 0, _a = Array.from(this.targets.entries()); _i < _a.length; _i++) {
            var entry = _a[_i];
            var key = entry[0];
            var value = entry[1];
            if (key == mainObject) {
                return this.targets.get(key);
            }
        }
    };
    JsonProcessor.isRequired = function (prop) {
        if (this.requiredMap.has(prop)) {
            return true;
        }
        else {
            return false;
        }
    };
    JsonProcessor.getShaclFileText = function () {
        return this.shaclFileText;
    };
    // From config.json, we get:
    // prefixes, terms, , schema_objects(in the main)
    JsonProcessor.config = require('./configs/config-gbfs.json');
    JsonProcessor.rdf_json_objects = new Map();
    JsonProcessor.termMap = new Map();
    JsonProcessor.creators = [];
    // Shacl shape
    JsonProcessor.requiredMap = new Map();
    JsonProcessor.shaclFileText = "";
    JsonProcessor.targets = new Map();
    return JsonProcessor;
}());
exports.JsonProcessor = JsonProcessor;
