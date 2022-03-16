"use strict";
exports.__esModule = true;
var RDFTools = require("./rdfTools").RDFTools;
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var config = require('./configs/config-gbfs.json');
var writer = new N3.Writer({ prefixes: config.prefixes });
var prefix = "sdm";
RDFTools.initialise("ElectricalMeasurement");
//let schema = require('./GBFS/system_pricing_plan.json');
//let schema = require('./GBFS/station_information.json');
//let schema = require('./GBFS/system_hours.json');
//let schema = require('./SmartDataModels/battery.json');
//let schema = require('./SmartDataModels/dataModel.json');
var schema = require('./GBFS/minecraft.json');
function traverse(parentKey, schema, propertyList) {
    if (!schema) {
        return;
    }
    if (schema.type != undefined) {
        console.log("key: ", parentKey);
        // Base cases
        if (schema.type === 'string') { // Base Case
            console.log("string: ");
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:string'));
            return parentKey;
        }
        if (schema.type === 'number') { // Base Case
            console.log("number: ");
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:integer'));
            return parentKey;
        }
        if (schema.type === 'integer') { // Base Case
            console.log("integer: ");
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:integer'));
            return parentKey;
        }
        if (schema.type === 'boolean') {
            console.log("boolean: ");
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:boolean'));
            return parentKey;
        }
        if (schema["enum"] != undefined) {
            console.log("enum: ");
            writer.addQuad(getOneOfQuad(schema.items["enum"], parentKey));
            // key oneOf <-,-,-,-,->
            return;
        }
        if (schema.type === 'array') {
            console.log("array: ");
            console.log("array schema", schema);
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdf:type', 'rdfs:Class'));
            if (schema.items != undefined) {
                //
                if (schema.items.type === 'object') {
                    traverse(parentKey, schema.items, []);
                    //console.log("schema items", schema.items);
                    for (var _i = 0, _a = Object.keys(schema.items); _i < _a.length; _i++) {
                        var item = _a[_i];
                        traverse(item, schema.items[item], []);
                        //console.log("item", item);
                    }
                }
                if (schema.items["enum"] != undefined) { // If there is an enum
                    writer.addQuad(getOneOfQuad(schema.items["enum"], parentKey));
                }
                if (schema.items['$ref'] != undefined) { // No support for $ref
                    writer.addQuad(RDFTools.node_node_node(prefix + ':' + parentKey, 'rdfs:hasProperty', schema.items['$ref']));
                }
            }
            // key oneof <-,-,-,-,->
            return;
        }
        if (schema.type === 'object') {
            var propertyList_1 = [];
            console.log("object: ");
            console.log("object schema", schema);
            propertyList_1 = [];
            if (schema.properties != undefined) {
                // Recursive Step
                for (var _b = 0, _c = Object.keys(schema.properties); _b < _c.length; _b++) {
                    var item = _c[_b];
                    propertyList_1.push(namedNode(item.toString()));
                    traverse(item, schema.properties[item], []);
                }
                console.log("propertyLIst", propertyList_1);
                // key hasProperties propertyList
                writer.addQuad(RDFTools.node_node_list(prefix + ':' + parentKey, 'rdfs:hasProperty', writer.list(propertyList_1)));
                propertyList_1 = [];
            }
            // No return here otherwise the program stops
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
                traverse(item, schema.allOf[item], []);
            }
            return;
        }
        if (schema["enum"] != undefined) {
            console.log("enum is defined", schema["enum"]);
            // this can occur in different scenarios: how to manage? 
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
                traverse(item, schema.properties[item], []);
            }
        }
    }
    // If its none of the above
    return;
}
function getOneOfQuad(oneOf, name) {
    var oneOfValues = [];
    for (var _i = 0, oneOf_1 = oneOf; _i < oneOf_1.length; _i++) {
        var value = oneOf_1[_i];
        oneOfValues.push(namedNode(value.toString()));
    }
    var oneOfQuad = RDFTools.node_node_list(prefix + ':' + name, 'owl:oneOf', writer.list(oneOfValues));
    return oneOfQuad;
}
traverse('schema', schema, []);
RDFTools.writeTurtle(writer);
