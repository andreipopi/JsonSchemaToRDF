import { write } from "fs";
import { arrayBuffer } from "stream/consumers";
import {DataFactory, Literal, Quad, Store} from "n3";
import literal = DataFactory.literal;
import { NamedNode } from "n3/lib/N3DataFactory";
import { off } from "process";

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;




/**
 * This class is contains auxiliary methods and tools for Pattern clas (e.g. smdPattern, gbfsPattern,...)
 * to write Turtle
 */
export class RDFTools {


static fileName: string;
static fs:any;

/**
 * First method of this class to be called; RDFTools has to be initialised right after a *Pattern class has been created.
 * @param filename 
 */
static initialise (filename: string){
    this.fs = require('fs');
    this.fileName = filename;
}

// Write with the writer that is passed; fileName and fs have been set previously
static writeTurtle (writer){
    // Write the content of the writer in the .ttl
    writer.end((error:any, result:any) => this.fs.writeFile(`build/${this.fileName}.ttl`, result, (err:any) => {
        // throws an error, you could also catch it here
        if (err) throw err;
        // success case, the file was saved
        console.log('Turtle saved!');}));
}

// Create quads of different shape
static node_node_literal (subj: string, pred:string, obj:string) {
    if(pred == 'rdfs:label' || pred == 'rdfs:comment'){
        const myQuad = quad( namedNode(subj), namedNode(pred), literal(obj, 'en'), defaultGraph());
        return myQuad;
    }
    else{
        const myQuad = quad( namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
        return myQuad;
    }
}
static node_node_node (subj: string, pred:string, obj:string) {
    const myQuad = quad( namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
    return myQuad;
}
static node_node_list (subj: string, pred:string, writerList/*list:NamedNode[]*/) {
    const myQuad = quad( namedNode(subj), namedNode(pred), writerList, defaultGraph());
    return myQuad;
}
static node_literal_literal (subj: string, pred:string, obj:string) {
    const myQuad = quad( namedNode(subj), literal(pred), literal(obj), defaultGraph());
    return myQuad;
}

static getXsdType (t:string) {
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

static capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

}