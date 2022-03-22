import {ShaclTools} from './shaclTools';
import {JsonProcessor} from './jsonProcessor';
import { NamedNode } from "n3/lib/N3DataFactory";
import { convertToObject } from 'typescript';

const {RDFTools} = require("./rdfTools");
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class Traverse{

static writer:any;
static prefix:any;

static initialise (writer, prefix){
    this.writer = writer;
    this.prefix = prefix;
}

static traverse (parentKey, schema){
    if (!schema) { 
        return;
    }
    if (schema.type != undefined){ // If the schema/sub-schema has a type
        console.log("key: ", parentKey);
        if (schema.type === 'string') { // Base Case
            this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+parentKey, 'rdf:type', 'xsd:string'));
            this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+parentKey, 'rdfs:label', schema.description));

            if (schema.enum != undefined){ // schema.enum can also be found in a string schema
                this.writer.addQuad(RDFTools.getOneOfQuad(this.prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.enum, this.writer));
                return;
            }
            return parentKey;
        }
        if (schema.type === 'number') { // Base Case
            if (!RDFTools.inMap(parentKey)){
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+parentKey, 'rdf:type', 'xsd:integer'));
                this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+parentKey, 'rdfs:label', schema.description));
            }
            return parentKey;
        }
        if (schema.type === 'integer') {// Base Case
            if (!RDFTools.inMap(parentKey)){
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+parentKey, 'rdf:type', 'xsd:integer'));
                this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+parentKey, 'rdfs:label', schema.description));
            }
            return parentKey;
        }
        if (schema.type === 'boolean') {// Base Case
            if (!RDFTools.inMap(parentKey)){
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+parentKey, 'rdf:type', 'xsd:boolean'));
                this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+parentKey, 'rdfs:label', schema.description));
            }
            return parentKey;
        }
        if (schema.enum != undefined){ // Base Case: schema.enum
            this.writer.addQuad(RDFTools.getOneOfQuad(this.prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.items.enum, this.writer));
            this.writer.addQuad(RDFTools.node_node_literal(this.prefix+':'+parentKey, 'rdfs:label', schema.description));
            return parentKey;
        }

        if (schema.type === 'array'){

            let newClass = this.prefix+":"+RDFTools.capitalizeFirstLetter(parentKey) ;
            this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+parentKey, 'rdfs:range', newClass));
            this.writer.addQuad(RDFTools.node_node_node(newClass, 'rdf:type', 'rdfs:Class' ));

            if (schema.items != undefined){  // usually an array has items
                if (schema.items.type === 'object'){    //  but it can happen that it has a nested object
                    this.traverse(parentKey, schema.items);
                    //console.log("schema items", schema.items);
                    for(let item of Object.keys(schema.items)){
                        this.traverse(item, schema.items[item])
                    //console.log("item", item);
                    }
                }
                if(schema.items.enum != undefined){// schema.items.enum
                    this.writer.addQuad(RDFTools.getOneOfQuad(this.prefix, RDFTools.capitalizeFirstLetter(parentKey), schema.items.enum, this.writer));
                }
                if(schema.items['$ref'] != undefined){// No support for $ref
                    this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+parentKey, 'rdfs:hasProperty',schema.items['$ref'] ));
                }
            }
            // key oneof <-,-,-,-,->
            return;
        }

        if (schema.type === 'object'){
            let propertyList:NamedNode[] = [];
            propertyList = [] 
            if(schema.properties != undefined){
                for (let item of Object.keys(schema.properties)){
                    propertyList.push(namedNode(item.toString()));
                    this.traverse(item,schema.properties[item]) // Recursive Step
                }
                let newClass = this.prefix+":"+RDFTools.capitalizeFirstLetter(parentKey);
                this.writer.addQuad(RDFTools.node_node_node(this.prefix+':'+parentKey, 'rdfs:range', newClass ));
                this.writer.addQuad(RDFTools.node_node_list(newClass, 'rdfs:hasProperty', this.writer.list(propertyList)));
                propertyList = [];
            }
            // if(schema.patternProperties != undefined // No support yet){
            //}
            // Don't return here: there might be further things defined in an objcet!?
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
