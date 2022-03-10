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
        console.log("CALL INITIALISE");
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
        console.log("MainJsonObject: ", this.mainJsonObject);
        this.prefix = this.config.prefix;
        // Set path (TODO: set from confi.json)
        // SMD
        //this.path = this.jsonSchema[this.mainJsonObject];
        //this.properties = this.path[2].properties; // Path to the properties of the main object
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
        for (var prop in this.properties) {
            //console.log("prop",prop);
            //console.log("mainobj", this.mainObject);
            //this.mainJsonObject = JsonProcessor.getJsonObject(this.prefix+':'+ RDFTools.capitalizeFirstLetter(prop));
            this.mainJsonObject = JsonProcessor.getJsonObject(this.mainObject);
            //console.log("mainjson",this.mainJsonObject);
            this.jsonTraverseRecursive(this.writer, depth, this.path, this.mainJsonObject, prop);
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
    JsonProcessor.jsonTraverseRecursive = function (writer, depth, path, mainJsonObject, prop) {
        // We only deal to depths <= 1; the following setups take care of that.
        var tmpPath;
        var propType;
        var subProperties;
        var subItems;
        var propDescription;
        var directEnum;
        var oneOf;
        if (depth == 0) {
            // SMD
            /*
            propType = path[2].properties[prop].type;
            subProperties = path[2].properties[prop].properties;
            subItems = path[2].properties[prop].items;
            propDescription = path[2].properties[prop].description;
            directEnum = path[2].properties[prop].enum;
            */
            // GBFS
            propType = path.items.properties[prop].type;
            subProperties = path.items.properties[prop].properties;
            subItems = path.items.properties[prop].items;
            propDescription = path.items.properties[prop].description;
            directEnum = path.items.properties[prop]["enum"];
            oneOf = path.items.properties[prop].oneOf;
        }
        if (depth == 1) {
            // SMD
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
                directEnum = tmpPath["enum"];
                oneOf = tmpPath.oneOf;
            }
        }
        // Base cases 
        if (depth > 2) {
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
            return;
        }
        // Verify if there is a oneOf defined
        if (oneOf != undefined) {
            console.log("there is an enum", oneOf);
            var oneOfValues = [];
            for (var _i = 0, oneOf_1 = oneOf; _i < oneOf_1.length; _i++) {
                var value = oneOf_1[_i];
                console.log("oneof value", value);
                //We get the values from the mapping, else we create new terms
                if (this.termMap.has(value)) {
                    oneOfValues.push(namedNode(this.termMap.get(value.toString())));
                }
                else {
                    oneOfValues.push(namedNode(value));
                }
            }
            console.log("this is the list of values", oneOfValues);
            var subPropQuad = rdfTools_1.RDFTools.node_node_list(this.prefix + ':' + prop, 'owl:oneOf', oneOfValues);
            this.writer.addQuad(subPropQuad);
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
                if (directEnum != undefined) {
                    var oneOfValues = [];
                    for (var _a = 0, directEnum_1 = directEnum; _a < directEnum_1.length; _a++) {
                        var value = directEnum_1[_a];
                        //We get the values from the mapping, else we create new terms
                        if (this.termMap.get(value) != undefined) {
                            oneOfValues.push(namedNode(this.termMap.get(value)));
                        }
                        else {
                            oneOfValues.push(namedNode(value));
                        }
                    }
                    var subPropQuad = rdfTools_1.RDFTools.node_node_list(this.prefix + ':' + newClassName, 'owl:oneOf', this.writer.list(oneOfValues));
                    this.writer.addQuad(subPropQuad);
                }
                // Shacl shape text
                if (JsonProcessor.isRequired(prop)) {
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclRequiredProperty(prop) + '\n';
                }
                else { // Else the property is not required
                    this.shaclFileText = this.shaclFileText + shaclTools_1.ShaclTools.getShaclProperty(prop) + '\n';
                }
            }
            depth += 1;
            //mainJsonObject = JsonProcessor.getJsonObject(this.prefix+':'+ RDFTools.capitalizeFirstLetter(prop));
            mainJsonObject = JsonProcessor.getJsonObject(this.prefix + ':' + newClassName);
            // An object can have sub properties
            if (subProperties != undefined) {
                for (var prop_1 in subProperties) {
                    this.jsonTraverseRecursive(this.writer, depth, path, mainJsonObject, prop_1);
                }
            }
            // An array can have sub items
            if (subItems != undefined) {
                for (var item in subItems) {
                    this.jsonTraverseRecursive(this.writer, depth, path, mainJsonObject, item);
                }
            }
        }
        return;
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
