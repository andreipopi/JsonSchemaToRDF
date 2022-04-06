"use strict";
exports.__esModule = true;
exports.RDFTools = void 0;
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
/**
 * This class is contains auxiliary methods and tools for Pattern clas (e.g. smdPattern, gbfsPattern,...)
 * to write Turtle
 */
var RDFTools = /** @class */ (function () {
    function RDFTools() {
    }
    /**
     * First method of this class to be called; RDFTools has to be initialised right after a *Pattern class has been created.
     * @param filename
     */
    RDFTools.initialise = function (filename, map) {
        this.fs = require('fs');
        this.fileName = filename;
        for (var object in map) {
            this.termMap.set(object, map[object]);
        }
    };
    RDFTools.inMap = function (term) {
        if (this.termMap.has(term) != false) {
            return this.termMap.get(term);
        }
        else {
            return false;
        }
    };
    RDFTools.getOneOfQuad = function (prefix, name, oneOf, writer) {
        var oneOfValues = [];
        for (var _i = 0, oneOf_1 = oneOf; _i < oneOf_1.length; _i++) {
            var value = oneOf_1[_i];
            if (RDFTools.inMap(value) != false) {
                oneOfValues.push(namedNode(RDFTools.inMap(value)));
            }
            else {
                oneOfValues.push(namedNode(value.toString()));
            }
        }
        var oneOfQuad = RDFTools.node_node_list(prefix + ':' + name, 'owl:oneOf', writer.list(oneOfValues));
        return oneOfQuad;
    };
    /* Might need this method
    tatic getEnumerationQuad(directEnum, name){
            let oneOfValues:NamedNode[] = [];
            let subPropQuad;
    
            if (Array.isArray(directEnum)){
                console.log("is array", directEnum);
                for (const value of directEnum){
                    //We get the values from the mapping, else we create new terms
                    if (this.termMap.get(value)!= undefined) {
                        oneOfValues.push(namedNode(this.termMap.get(value)));
                    }
                    else{
                        oneOfValues.push(namedNode(value));
                    }
                }
                subPropQuad = RDFTools.node_node_list(this.prefix+':'+name, 'owl:oneOf', this.writer.list(oneOfValues));
            }
            // trial to manage different anyOf, but they all result in arrays.
            //if (typeof directEnum === 'object' ){
            //}
            return subPropQuad;
        }
    */
    // Write with the writer that is passed; fileName and fs have been set previously
    RDFTools.writeTurtle = function (writer) {
        var _this = this;
        // Write the content of the writer in the .ttl
        var filePath = ("build/" + this.fileName + ".ttl").replace(/:/g, '');
        writer.end(function (error, result) { return _this.fs.writeFile(filePath, result, function (err) {
            // throws an error, you could also catch it here
            if (err)
                throw err;
            // success case, the file was saved
            console.log('Turtle saved!');
        }); });
    };
    // Create quads of different shape
    RDFTools.node_node_literal = function (subj, pred, obj) {
        if (pred == 'rdfs:label' || pred == 'rdfs:comment') {
            var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj, 'en'), defaultGraph());
            return myQuad;
        }
        else {
            var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
            return myQuad;
        }
    };
    RDFTools.node_node_node = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
        return myQuad;
    };
    RDFTools.node_node_list = function (subj, pred, writerList /*list:NamedNode[]*/) {
        var myQuad = quad(namedNode(subj), namedNode(pred), writerList, defaultGraph());
        return myQuad;
    };
    RDFTools.node_literal_literal = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), literal(pred), literal(obj), defaultGraph());
        return myQuad;
    };
    RDFTools.getXsdType = function (t) {
        switch (t) {
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
            case 'integer': {
                return 'xsd:integer';
                break;
            }
            default: {
                //statements; 
                break;
            }
        }
    };
    RDFTools.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    RDFTools.termMap = new Map();
    return RDFTools;
}());
exports.RDFTools = RDFTools;
