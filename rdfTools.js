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
    RDFTools.initialise = function (filename) {
        this.fs = require('fs');
        this.fileName = filename;
    };
    // Write with the writer that is passed; fileName and fs have been set previously
    RDFTools.writeTurtle = function (writer) {
        var _this = this;
        // Write the content of the writer in the .ttl
        writer.end(function (error, result) { return _this.fs.writeFile("build/" + _this.fileName + ".ttl", result, function (err) {
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
    return RDFTools;
}());
exports.RDFTools = RDFTools;
