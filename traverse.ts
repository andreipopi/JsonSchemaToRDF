import {ShaclTools} from './shaclTools';
import {JsonProcessor} from './jsonProcessor';
import { NamedNode } from "n3/lib/N3DataFactory";
import { convertToObject } from 'typescript';

const {RDFTools} = require("./rdfTools");
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;


//let config = require('./configs/config-gbfs.json');
let prefix ="gbfs";

//let schema = require('./GBFS/system_pricing_plan.json');
//let schema = require('./GBFS/station_information.json');
//let schema = require('./GBFS/system_hours.json');
//let schema = require('./SmartDataModels/battery.json');
//let schema = require('./SmartDataModels/dataModel.json');
//let schema = require('./GBFS/minecraft.json');
//let schema = require('./GBFS/gbfs.json');

export class Traverse{

static writer:any;

static initialise (writer){
    this.writer = writer;
}

static traverse (parentKey, schema){
    if (!schema) { 
        return;
    }
    if (schema.type != undefined){ // If the schema/sub-schema has a type
        console.log("key: ", parentKey);
        if (schema.type === 'string') { // Base Case
            this.writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdf:type', 'xsd:string'));
            this.writer.addQuad(RDFTools.node_node_literal(prefix+':'+parentKey, 'rdfs:label', schema.description));

            if (schema.enum != undefined){ // schema.enum can also be found in a string schema
                this.writer.addQuad(RDFTools.getOneOfQuad(prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.enum, this.writer));
                return;
            }
            return parentKey;
        }
        if (schema.type === 'number') { // Base Case
            this.writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdf:type', 'xsd:integer'));
            this.writer.addQuad(RDFTools.node_node_literal(prefix+':'+parentKey, 'rdfs:label', schema.description));
            return parentKey;
        }
        if (schema.type === 'integer') {// Base Case
            this.writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdf:type', 'xsd:integer'));
            this.writer.addQuad(RDFTools.node_node_literal(prefix+':'+parentKey, 'rdfs:label', schema.description));
            return parentKey;
        }
        if (schema.type === 'boolean') {// Base Case
            this.writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdf:type', 'xsd:boolean'));
            this.writer.addQuad(RDFTools.node_node_literal(prefix+':'+parentKey, 'rdfs:label', schema.description));
            return parentKey;
        }
        if (schema.enum != undefined){ // Base Case: schema.enum
            this.writer.addQuad(RDFTools.getOneOfQuad(prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.items.enum, this.writer));
            this.writer.addQuad(RDFTools.node_node_literal(prefix+':'+parentKey, 'rdfs:label', schema.description));
            return parentKey;
        }

        if (schema.type === 'array'){
            console.log("array: ");
            console.log("array schema", schema);

            this.writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdfs:range', prefix+":"+RDFTools.capitalizeFirstLetter(parentKey) ));
            this.writer.addQuad(RDFTools.node_node_node(prefix+':'+RDFTools.capitalizeFirstLetter(parentKey), 'rdf:type', 'rdfs:Class' ));

            if (schema.items != undefined){
                //
                if (schema.items.type === 'object'){
                    this.traverse(parentKey, schema.items);
                    //console.log("schema items", schema.items);
                    for(let item of Object.keys(schema.items)){
                        this.traverse(item, schema.items[item])
                    //console.log("item", item);
                    }
                }
                if(schema.items.enum != undefined){// schema.items.enum
                    this.writer.addQuad(RDFTools.getOneOfQuad(prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.items.enum, this.writer));
                }
                if(schema.items['$ref'] != undefined){// No support for $ref
                    this.writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdfs:hasProperty',schema.items['$ref'] ));
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
                    this.traverse(item,schema.properties[item])
                }
                console.log("propertyLIst", propertyList);
                // key hasProperties propertyList
                this.writer.addQuad(RDFTools.node_node_node(prefix+':'+parentKey, 'rdfs:range', prefix+":"+RDFTools.capitalizeFirstLetter(parentKey) ));

                this.writer.addQuad(RDFTools.node_node_list(prefix+':'+RDFTools.capitalizeFirstLetter(parentKey), 'rdfs:hasProperty', this.writer.list(propertyList)));
                propertyList = [];
            }
            // if(schema.patternProperties != undefined // No support yet){
            //}
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
                this.traverse(item,schema.allOf[item])
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
                this.traverse(item,schema.properties[item])
            }
        }
    }

    // If its none of the above: Danger Zone
    return;
}



    static getWriter (){
        return this.writer;
    }


}
