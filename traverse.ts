import {ShaclTools} from './shaclTools';
import {JsonProcessor} from './jsonProcessor';

import { NamedNode } from "n3/lib/N3DataFactory";
import { convertToObject } from 'typescript';

const {RDFTools} = require("./rdfTools");
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;


let config = require('./configs/config-gbfs.json');
let writer = new N3.Writer({prefixes:config.prefixes});
let prefix ="sdm";
RDFTools.initialise("ElectricalMeasurement");

//let schema = require('./GBFS/system_pricing_plan.json');
let schema = require('./GBFS/station_information.json');
//let schema = require('./GBFS/system_hours.json');
//let schema = require('./SmartDataModels/battery.json');
//let schema = require('./SmartDataModels/dataModel.json');
//let schema = require('./GBFS/minecraft.json');



function traverse (parentKey, schema, propertyList ){
    if (!schema) { 
        return;
    }
    if (schema.type != undefined){ // If the schema/sub-schema has a type
        console.log("key: ", parentKey);
        if (schema.type === 'string') { // Base Case
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:string'));
            if (schema.enum != undefined){ // schema.enum can also be found in a string schema
                writer.addQuad(getOneOfQuad(schema.enum, parentKey));
                return;
            }
            return parentKey;
        }
        if (schema.type === 'number') { // Base Case
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:integer'));
            return parentKey;
        }
        if (schema.type === 'integer') {// Base Case
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:integer'));
            return parentKey;
        }
        if (schema.type === 'boolean') {// Base Case
            writer.addQuad(RDFTools.node_node_node(parentKey, 'rdfs:range', 'xsd:boolean'));
            return parentKey;
        }
        if (schema.enum != undefined){ // Base Case: schema.enum
            writer.addQuad(getOneOfQuad(schema.enum, parentKey));
            return parentKey;
        }

        if (schema.type === 'array'){
            console.log("array: ");
            console.log("array schema", schema);

            writer.addQuad(RDFTools.node_node_node(RDFTools.capitalizeFirstLetter(parentKey), 'rdf:type', 'rdfs:Class' ));

            if (schema.items != undefined){
                //
                if (schema.items.type === 'object'){
                    traverse(parentKey, schema.items, []);
                    //console.log("schema items", schema.items);
                    for(let item of Object.keys(schema.items)){
                        traverse(item, schema.items[item], [])
                    //console.log("item", item);
                    }
                }
                if(schema.items.enum != undefined){// schema.items.enum
                    writer.addQuad(getOneOfQuad(schema.items.enum, parentKey));
                }
                if(schema.items['$ref'] != undefined){// No support for $ref
                    writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdfs:hasProperty',schema.items['$ref'] ));
                }
            }
            // key oneof <-,-,-,-,->
            return;
        }

        if (schema.type === 'object'){
            let propertyList:NamedNode[] = [];
            console.log("object: ");
            console.log("object schema", schema);
            propertyList = []
            if(schema.properties != undefined){
                // Recursive Step
                for (let item of Object.keys(schema.properties)){
                    propertyList.push(namedNode(item.toString()));
                    traverse(item,schema.properties[item], [])
                }
                console.log("propertyLIst", propertyList);
                // key hasProperties propertyList
                writer.addQuad(RDFTools.node_node_list(prefix+':'+RDFTools.capitalizeFirstLetter(parentKey), 'rdfs:hasProperty', writer.list(propertyList)));
                propertyList = [];
            }
            // No return here otherwise the program stops
        }
        if(schema.oneOf != undefined){
            console.log("oneOf");
            // console.log("oneOf",schema.oneOf);
            // Base Case, remove the loop and recursion
            //for (let item in schema.items){
            //    console.log(item);
            //    parsedData[item] = generateDataFromSchema(item,schema.oneOf[item])
            //}
        }

        if(schema.allOf != undefined){
            // Data must be valid against all its components;
            // pass its components recursively to be further parsed
            for (let item of Object.keys(schema.allOf)){
                traverse(item,schema.allOf[item], [])
            }
            return;
        }
       
    }
    else{
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
        if(schema.properties != undefined){
            for (let item of Object.keys(schema.properties)){
                traverse(item,schema.properties[item], [])
            }
        }
    }

    // If its none of the above: Danger Zone
    return;
}


function getOneOfQuad(oneOf, name){
    let oneOfValues:NamedNode[] = [];
    for (const value of oneOf){
        oneOfValues.push(namedNode(value.toString()));
    }
    let oneOfQuad = RDFTools.node_node_list(prefix+':'+name, 'owl:oneOf', writer.list(oneOfValues));
    return oneOfQuad;
}

traverse( 'schema',schema,[]);
RDFTools.writeTurtle(writer);