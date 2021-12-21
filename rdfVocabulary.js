"use strict";
exports.__esModule = true;
exports.RDFVocabulary = void 0;
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var RDFVocabulary = /** @class */ (function () {
    // Constructors
    function RDFVocabulary(termMapping, source) {
        this.store = new N3.Store();
        this.prefixes = {
            prefixes: {
                gbfsst: 'https://w3id.org/gbfs/stations#',
                schema: 'http://schema.org/url#',
                ebucore: 'http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#',
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                foaf: 'http://xmlns.com/foaf/0.1/',
                dcterms: 'http://purl.org/dc/terms/',
                vs: 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
                geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
                vann: 'http://purl.org/vocab/vann/',
                owl: 'http://www.w3.org/2002/07/owl#',
                airs: 'https://raw.githubusercontent.com/airs-linked-data/lov/latest/src/airs_vocabulary.ttl#',
                "dbpedia-owl": 'http://dbpedia.org/ontology/'
            }
        };
        this.writer = new N3.Writer(this.prefixes);
        this.newTerms = [];
        this.jsonSchema = require(source);
        this.map = termMapping;
        // Hardcoded -> can be made more general 
        this.mainObject = this.jsonSchema.properties.data.properties.stations;
    }
    // Methods
    /** creates and writes quads for the basic properties of a jsonSchema of the bike sharing system */
    RDFVocabulary.prototype.parseBasicsToQuads = function () {
        this.schema = this.jsonSchema.$schema;
        this.description = this.jsonSchema.description;
        this.id = this.jsonSchema.$id;
        this.vocabularyPrimaryTopic = this.node_node_node('https://w3id.org/gbfs/stations', 'foaf:primaryTopic', 'https://w3id.org/gbfs/stations#');
        this.aDocument = this.node_node_node('https://w3id.org/gbfs/stations', 'rdf:type', 'foaf:Document');
        this.descriptionQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'rdfs:comment', this.description);
        this.uriQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'vann:preferredNamespaceUri', 'https://w3id.org/gbfs/stations#');
        this.containsQuad = this.node_node_node('https://w3id.org/gbfs/stations', 'contains', 'gbfsst:station');
        this.writer.addQuad(this.vocabularyPrimaryTopic);
        this.writer.addQuad(this.aDocument);
        this.writer.addQuad(this.descriptionQuad);
        this.writer.addQuad(this.uriQuad);
        this.writer.addQuad(this.containsQuad);
    };
    /** creates and writes quads(in the rdf vocab.) for the main object's properties, by checking if new terms are encountered (against map) */
    RDFVocabulary.prototype.parseMainObjectPropertiesToQuads = function () {
        var fs = require('fs');
        // For each property IN the main object of json file (in this case station)
        for (var elem in this.jsonSchema.properties.data.properties.stations.items.properties) {
            console.log("element is this", elem);
            // If the property does not exists in the mapping, then we add it to the vocabulary
            if (this.map.has(elem) == false) {
                console.log("HAS NOT elem");
                this.newTerms.push(elem);
                // Then create the quad and add it to the writer
                var newQuad = this.node_node_node('gbfsst:station', 'rdf:Property', elem);
                this.writer.addQuad(newQuad);
            }
        }
        var mainObj = 'stations';
        for (var _i = 0, _a = this.newTerms; _i < _a.length; _i++) {
            var newTerm = _a[_i];
            console.log(newTerm);
            console.log("newterm", newTerm);
            var termType = this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm].type;
            var termProperties = this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm].properties;
            // check for objects or arrays 
            if (termType == 'object' && termProperties != undefined) {
                var newQuad = this.node_node_node(newTerm, 'rdf:Class', 'Object');
                this.writer.addQuad(newQuad);
                console.log("object", this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm].properties);
                // Then there might be other subproperties
                for (var subProperty in this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm].properties) {
                    var subPropQuad = this.node_node_node(newTerm, 'rdf:Property', subProperty);
                    this.writer.addQuad(subPropQuad);
                }
            }
            if (termType == 'array') {
                console.log("array");
                var newQuad = this.node_node_node(newTerm, 'rdf:Class', 'Array');
                this.writer.addQuad(newQuad);
                // Then there are elements
                for (var _b = 0, _c = this.jsonSchema.properties.data.properties[mainObj].items.properties[newTerm]; _b < _c.length; _b++) {
                    var subProperty = _c[_b];
                }
            }
            if (termType != 'array' && termType != 'object') {
                var newQuad = this.node_node_node(newTerm, 'rdf:type', termType);
                this.writer.addQuad(newQuad);
            }
        }
        this.writer.end(function (error, result) { return fs.writeFile('turtleTranslation.ttl', result, function (err) {
            // throws an error, you could also catch it here
            if (err)
                throw err;
            // success case, the file was saved
            console.log('Turtle saved!');
        }); });
    };
    /** returns the properties of the main object which are required. Useful in the shaclshape class in order to create the shacl shape */
    RDFVocabulary.prototype.getRequiredProperties = function () {
        var requiredMap = new Map();
        // For each OF the values in the required
        for (var _i = 0, _a = this.jsonSchema.properties.data.properties.stations.items.required; _i < _a.length; _i++) {
            var requiredProp = _a[_i];
            requiredMap.set(requiredProp.toString(), this.map.get(requiredProp.toString()));
        }
        return requiredMap;
    };
    // Create quads of different shape
    RDFVocabulary.prototype.node_node_literal = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
        return myQuad;
    };
    RDFVocabulary.prototype.node_node_node = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
        return myQuad;
    };
    RDFVocabulary.prototype.node_literal_literal = function (subj, pred, obj) {
        var myQuad = quad(namedNode(subj), literal(pred), literal(obj), defaultGraph());
        return myQuad;
    };
    return RDFVocabulary;
}());
exports.RDFVocabulary = RDFVocabulary;
