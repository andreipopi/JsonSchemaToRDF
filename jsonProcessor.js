"use strict";
exports.__esModule = true;
exports.JsonProcessor = void 0;
var rdfTools_1 = require("./rdfTools");
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var JsonProcessor = /** @class */ (function () {
    function JsonProcessor() {
    }
    JsonProcessor.initialise = function (source, mainObj) {
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
        // Set path (TODO: set from confi.json)
        this.path = this.jsonSchema[this.mainJsonObject];
        this.properties = this.path[2].properties; // Path to the properties of the main object
    };
    JsonProcessor.callJsonTraverseRecursive = function () {
        var depth = 0;
        for (var prop in this.properties) {
            this.mainJsonObject = JsonProcessor.getJsonObject('sdm:' + rdfTools_1.RDFTools.capitalizeFirstLetter(prop));
            this.jsonTraverseRecursive(this.writer, depth, this.path, this.mainJsonObject, prop);
        }
        ;
        return;
    };
    JsonProcessor.jsonTraverseRecursive = function (writer, depth, path, mainJsonObject, prop) {
        // We only deal to depths <= 1; the following setups take care of that.
        var tmpPath;
        var propType;
        var subProperties;
        var subItems;
        var propDescription;
        var directEnum;
        if (depth == 0) {
            propType = path[2].properties[prop].type;
            subProperties = path[2].properties[prop].properties; //
            subItems = path[2].properties[prop].items;
            propDescription = path[2].properties[prop].description;
            directEnum = path[2].properties[prop]["enum"];
            //let subSubProperties = path[2].properties[prop].properties;
        }
        if (depth == 1) {
            tmpPath = path[2].properties[mainJsonObject]; // adapt the path at depth 1 for the currently mainObject            
            console.log(mainJsonObject);
            console.log("property", prop);
            console.log("prop", tmpPath);
            if (tmpPath.properties != undefined) {
                propType = tmpPath.properties[prop].type;
                subProperties = tmpPath.properties;
            }
            if (tmpPath.items != undefined) {
                propType = tmpPath.items[prop].type;
                subItems = tmpPath.items[prop];
                directEnum = tmpPath.items[prop]["enum"];
            }
            console.log("proptype", propType);
            propDescription = tmpPath.description;
            //let subSubProperties = path.properties[prop].properties;
        }
        // Base cases 
        if (depth > 2) {
            return;
        }
        if (propType == 'number') {
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, 'sdm:' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('sdm:' + prop, 'rdfs:range', 'xsd:integer'));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('sdm:' + prop, 'rdfs:label', propDescription.toString()));
                }
            }
            return;
        }
        if (propType == 'boolean') {
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, 'sdm:' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('sdm:' + prop, 'rdfs:range', 'xsd:boolean'));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('sdm:' + prop, 'rdfs:label', propDescription.toString()));
                }
            }
            return;
        }
        // Recursive step
        if (propType == 'object' || propType == 'array') {
            if (this.termMap.has(prop) == false) {
                this.termMap.set(prop, 'sdm:' + prop);
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('sdm:' + prop, 'rdf:type', 'rdf:Property')); // Add the property and its label
                var newClassName = rdfTools_1.RDFTools.capitalizeFirstLetter(prop); // Since it is an object/array, we give it a new class as a range
                this.writer.addQuad(rdfTools_1.RDFTools.node_node_node('sdm:' + prop, 'rdfs:range', 'sdm:' + newClassName));
                if (propDescription != undefined) {
                    this.writer.addQuad(rdfTools_1.RDFTools.node_node_literal('sdm:' + prop, 'rdfs:label', propDescription.toString()));
                }
                if (directEnum != undefined) {
                    var oneOfValues = [];
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
                    console.log("this is the list of values", oneOfValues);
                    var subPropQuad = rdfTools_1.RDFTools.node_node_list('sdm:' + newClassName, 'owl:oneOf', this.writer.list(oneOfValues));
                    this.writer.addQuad(subPropQuad);
                }
            }
            depth += 1;
            mainJsonObject = JsonProcessor.getJsonObject('sdm:' + rdfTools_1.RDFTools.capitalizeFirstLetter(prop));
            // An object can have sub properties
            if (subProperties != undefined) {
                for (var prop_1 in subProperties) {
                    this.jsonTraverseRecursive(this.writer, depth, path, mainJsonObject, prop_1);
                }
            }
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
    // From config.json, we get:
    // prefixes, terms, , schema_objects(in the main)
    JsonProcessor.config = require('./configs/config-smartdatamodel.json');
    JsonProcessor.rdf_json_objects = new Map();
    JsonProcessor.termMap = new Map();
    return JsonProcessor;
}());
exports.JsonProcessor = JsonProcessor;
