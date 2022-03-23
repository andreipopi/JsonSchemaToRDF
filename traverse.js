"use strict";
exports.__esModule = true;
exports.Traverse = void 0;
var shaclTools_1 = require("./shaclTools");
var RDFTools = require("./rdfTools").RDFTools;
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var Traverse = /** @class */ (function () {
    function Traverse() {
    }
    Traverse.initialise = function (writer, prefix) {
        this.writer = writer;
        this.prefix = prefix;
    };
    Traverse.traverse = function (parentKey, schema) {
        if (!schema) {
            return;
        }
        if (schema.type != undefined) { // If the schema/sub-schema has a type
            console.log("key: ", parentKey);
            if (schema.type === 'string') { // Base Case
                this.writer.addQuad(RDFTools.node_node_node(this.prefix + ':' + parentKey, 'rdf:type', 'xsd:string'));
                this.writer.addQuad(RDFTools.node_node_literal(this.prefix + ':' + parentKey, 'rdfs:label', schema.description));
                console.log("parentKey", parentKey);
                console.log("required in if", shaclTools_1.ShaclTools.getRequiredProperties());
                if (shaclTools_1.ShaclTools.isRequired(parentKey)) {
                    console.log("this property is required");
                    shaclTools_1.ShaclTools.addToShape(shaclTools_1.ShaclTools.getShaclTypedRequiredProperty(parentKey, 'string'));
                }
                if (schema["enum"] != undefined) { // schema.enum can also be found in a string schema
                    this.writer.addQuad(RDFTools.getOneOfQuad(this.prefix, RDFTools.capitalizeFirstLetter(parentKey), schema["enum"], this.writer));
                    return;
                }
                return parentKey;
            }
            if (schema.type === 'number') { // Base Case
                if (!RDFTools.inMap(parentKey)) {
                    this.writer.addQuad(RDFTools.node_node_node(this.prefix + ':' + parentKey, 'rdf:type', 'xsd:integer'));
                    this.writer.addQuad(RDFTools.node_node_literal(this.prefix + ':' + parentKey, 'rdfs:label', schema.description));
                }
                if (shaclTools_1.ShaclTools.isRequired(parentKey)) {
                    shaclTools_1.ShaclTools.addToShape(shaclTools_1.ShaclTools.getShaclTypedRequiredProperty(parentKey, 'integer'));
                }
                return parentKey;
            }
            if (schema.type === 'integer') { // Base Case
                if (!RDFTools.inMap(parentKey)) {
                    this.writer.addQuad(RDFTools.node_node_node(this.prefix + ':' + parentKey, 'rdf:type', 'xsd:integer'));
                    this.writer.addQuad(RDFTools.node_node_literal(this.prefix + ':' + parentKey, 'rdfs:label', schema.description));
                }
                if (shaclTools_1.ShaclTools.isRequired(parentKey)) {
                    shaclTools_1.ShaclTools.addToShape(shaclTools_1.ShaclTools.getShaclTypedRequiredProperty(parentKey, 'integer'));
                }
                return parentKey;
            }
            if (schema.type === 'boolean') { // Base Case
                if (!RDFTools.inMap(parentKey)) {
                    this.writer.addQuad(RDFTools.node_node_node(this.prefix + ':' + parentKey, 'rdf:type', 'xsd:boolean'));
                    this.writer.addQuad(RDFTools.node_node_literal(this.prefix + ':' + parentKey, 'rdfs:label', schema.description));
                }
                return parentKey;
            }
            if (schema["enum"] != undefined) { // Base Case: schema.enum
                this.writer.addQuad(RDFTools.getOneOfQuad(this.prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.items["enum"], this.writer));
                this.writer.addQuad(RDFTools.node_node_literal(this.prefix + ':' + parentKey, 'rdfs:label', schema.description));
                return parentKey;
            }
            if (schema.type === 'array') {
                var newClass = this.prefix + ":" + RDFTools.capitalizeFirstLetter(parentKey);
                this.writer.addQuad(RDFTools.node_node_node(this.prefix + ':' + parentKey, 'rdfs:range', newClass));
                this.writer.addQuad(RDFTools.node_node_node(newClass, 'rdf:type', 'rdfs:Class'));
                if (schema.items != undefined) { // usually an array has items
                    if (schema.items.type === 'object') { //  but it can happen that it has a nested object
                        this.traverse(parentKey, schema.items);
                        //console.log("schema items", schema.items);
                        for (var _i = 0, _a = Object.keys(schema.items); _i < _a.length; _i++) {
                            var item = _a[_i];
                            this.traverse(item, schema.items[item]);
                            //console.log("item", item);
                        }
                    }
                    if (schema.items["enum"] != undefined) { // schema.items.enum
                        this.writer.addQuad(RDFTools.getOneOfQuad(this.prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.items["enum"], this.writer));
                    }
                    if (schema.items['$ref'] != undefined) { // No support for $ref
                        this.writer.addQuad(RDFTools.node_node_node(this.prefix + ':' + parentKey, 'rdfs:hasProperty', schema.items['$ref']));
                    }
                }
                // key oneof <-,-,-,-,->
                return;
            }
            if (schema.type === 'object') {
                var required = schema.required;
                shaclTools_1.ShaclTools.addRequiredTerms(required);
                if (shaclTools_1.ShaclTools.isRequired(parentKey)) {
                    shaclTools_1.ShaclTools.addToShape(shaclTools_1.ShaclTools.getShaclRequiredProperty(parentKey));
                }
                var propertyList = [];
                propertyList = [];
                if (schema.properties != undefined) {
                    for (var _b = 0, _c = Object.keys(schema.properties); _b < _c.length; _b++) {
                        var item = _c[_b];
                        propertyList.push(namedNode(item.toString()));
                        this.traverse(item, schema.properties[item]); // Recursive Step
                    }
                    var newClass = this.prefix + ":" + RDFTools.capitalizeFirstLetter(parentKey);
                    this.writer.addQuad(RDFTools.node_node_node(this.prefix + ':' + parentKey, 'rdfs:range', newClass));
                    this.writer.addQuad(RDFTools.node_node_list(newClass, 'rdfs:hasProperty', this.writer.list(propertyList)));
                    propertyList = [];
                }
                // if(schema.patternProperties != undefined // No support yet){
                //}
                // Objects can have required properties defined: these will becom Shacl constraints
                // required:[]
                // if 
                // Don't return here: there might be further things defined in an objcet!?
            }
            if (schema.oneOf != undefined) {
                console.log("oneOf");
                // console.log("oneOf",schema.oneOf);
                // Base Case, remove the loop and recursion
                //for (let item in schema.items){
                //    console.log(item);
                //    parsedData[item] = generateDataFromSchema(item,schema.oneOf[item])
                //}
            }
            if (schema.allOf != undefined) {
                // Data must be valid against all its components;
                // pass its components recursively to be further parsed
                for (var _d = 0, _e = Object.keys(schema.allOf); _d < _e.length; _d++) {
                    var item = _e[_d];
                    this.traverse(item, schema.allOf[item]);
                }
                return;
            }
        }
        else {
            //Good luck managing arbitrary schemas.
            /*
            e.g.: properties:{} occuring in a construct with no type
            allOf :[
                {
                },
                {
                  properties:{
                  }
                }
            ]
            */
            if (schema.properties != undefined) {
                for (var _f = 0, _g = Object.keys(schema.properties); _f < _g.length; _f++) {
                    var item = _g[_f];
                    this.traverse(item, schema.properties[item]);
                }
            }
        }
        // If its none of the above: Danger Zone
        return;
    };
    Traverse.getWriter = function () {
        return this.writer;
    };
    return Traverse;
}());
exports.Traverse = Traverse;
