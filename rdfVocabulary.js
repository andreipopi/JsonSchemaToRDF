"use strict";
exports.__esModule = true;
exports.RDFVocabulary = void 0;
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode, literal = DataFactory.literal, defaultGraph = DataFactory.defaultGraph, quad = DataFactory.quad;
var RDFVocabulary = /** @class */ (function () {
    // Constructors
    function RDFVocabulary(map, source) {
        this.store = new N3.Store();
        this.prefixes = {
            prefixes: {
                gtfsst: 'https://w3id.org/gbfs/stations#',
                schema: 'http://schema.org/url#',
                ebucore: 'http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#',
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                foaf: 'http://xmlns.com/foaf/0.1/',
                dcterms: 'http://purl.org/dc/terms/',
                vs: 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
                geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
                vann: 'http://purl.org/vocab/vann/',
                "w3c-ssn": 'http://www.w3.org/ns/ssn/hasProperty',
                owl: 'http://www.w3.org/2002/07/owl#',
                airs: 'https://raw.githubusercontent.com/airs-linked-data/lov/latest/src/airs_vocabulary.ttl#',
                "dbpedia-owl": 'http://dbpedia.org/ontology/'
            }
        };
        this.writer = new N3.Writer(this.prefixes);
        // Properties of a station
        this.has_station_id = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'dcterms:identifier');
        this.has_name = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'foaf:name');
        this.has_short_name = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'rdf:label');
        this.has_lat = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'geo:lat');
        this.has_lon = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'geo:long');
        this.has_address = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'address'); // require more
        this.has_cross_street = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'airs:locatedAtCrossStreet');
        this.has_region_id = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'dbpedia-owl:region');
        this.has_post_code = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'dbpedia-owl:postalCode');
        this.has_rental_methods = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'rental_methods'); // require more
        this.has_is_virtual_station = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'is_virtual_station'); // boolean + description
        this.has_station_area = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'station_area'); // require more
        this.has_capacity = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'dbpedia-owl:capacity');
        this.has_vehicle_capacity = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'vehicle_capacity'); // require more
        this.has_is_valet_station = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'is_valet_station'); //boolean + description
        this.has_is_charging_station = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'is_charging_station'); // boolean+ description
        this.has_rental_uris = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'rental_uris'); //require more
        this.has_vehicle_type_capacity = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', 'vehicle_type_capacity');
        this.jsonSchema = require(source);
        this.map = map;
        this.schema = this.jsonSchema.$schema;
        this.description = this.jsonSchema.description;
        this.id = this.jsonSchema.$id;
        this.vocabularyPrimaryTopic = this.node_node_node('https://w3id.org/gbfs/stations', 'foaf:primaryTopic', 'https://w3id.org/gbfs/stations#');
        this.aDocument = this.node_node_node('https://w3id.org/gbfs/stations', 'rdf:type', 'foaf:Document');
        this.descriptionQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'rdfs:comment', this.description);
        this.uriQuad = this.node_node_literal('https://w3id.org/gbfs/stations', 'vann:preferredNamespaceUri', 'https://w3id.org/gbfs/stations#');
        this.containsQuad = this.node_node_node('https://w3id.org/gbfs/stations', 'contains', 'gtfsst:station');
    }
    // Methods
    RDFVocabulary.prototype.addQuadsToStore = function () {
        this.store.addQuad(this.vocabularyPrimaryTopic);
        this.store.addQuad(this.aDocument);
        this.store.addQuad(this.descriptionQuad);
        this.store.addQuad(this.uriQuad);
        this.store.addQuad(this.containsQuad);
        this.store.addQuad(this.has_station_id);
        this.store.addQuad(this.has_name);
        this.store.addQuad(this.has_short_name);
        this.store.addQuad(this.has_lat);
        this.store.addQuad(this.has_lon);
        this.store.addQuad(this.has_address);
        this.store.addQuad(this.has_cross_street);
        this.store.addQuad(this.has_region_id);
        this.store.addQuad(this.has_post_code);
        this.store.addQuad(this.has_rental_methods);
        this.store.addQuad(this.has_is_virtual_station);
        this.store.addQuad(this.has_station_area);
        this.store.addQuad(this.has_capacity);
        this.store.addQuad(this.has_vehicle_capacity);
        this.store.addQuad(this.has_is_valet_station);
        this.store.addQuad(this.has_is_charging_station);
        this.store.addQuad(this.has_rental_uris);
        this.store.addQuad(this.has_vehicle_type_capacity);
    };
    // still TODO
    // Take care of beginning of file
    // Take care of types ^^datetime
    // Take care of required from json
    RDFVocabulary.prototype.writeQuads = function () {
        /*for (const quad in this.store.getQuads(null, null, null, null)){
            console.log(quad);
            this.writer.addQuad(quad);
        }*/
        this.writer.addQuad(this.vocabularyPrimaryTopic);
        this.writer.addQuad(this.aDocument);
        this.writer.addQuad(this.descriptionQuad);
        this.writer.addQuad(this.uriQuad);
        this.writer.addQuad(this.containsQuad);
        // Write properties of a Station
        // required ["station_id", "name", "lat", "lon"]
        this.writer.addQuad(this.has_station_id);
        this.writer.addQuad(this.has_name);
        this.writer.addQuad(this.has_short_name);
        this.writer.addQuad(this.has_lat);
        this.writer.addQuad(this.has_lon);
        this.writer.addQuad(this.has_address);
        this.writer.addQuad(this.has_cross_street);
        this.writer.addQuad(this.has_region_id);
        this.writer.addQuad(this.has_post_code);
        this.writer.addQuad(this.has_rental_methods);
        this.writer.addQuad(this.has_is_virtual_station);
        this.writer.addQuad(this.has_station_area);
        this.writer.addQuad(this.has_capacity);
        this.writer.addQuad(this.has_vehicle_capacity);
        this.writer.addQuad(this.has_is_valet_station);
        this.writer.addQuad(this.has_is_charging_station);
        this.writer.addQuad(this.has_rental_uris);
        this.writer.addQuad(this.has_vehicle_type_capacity);
        var fs = require('fs');
        // Resulting turtle 
        this.writer.end(function (error, result) { return fs.writeFile('turtleTranslation.ttl', result, function (err) {
            // throws an error, you could also catch it here
            if (err)
                throw err;
            // success case, the file was saved
            console.log('Turtle saved!');
        }); });
    };
    RDFVocabulary.prototype.getQuads = function (st, subj, pred, obj) {
        return st.getQuads(namedNode(subj), namedNode('rdf:type', namedNode('foaf:Document')));
    };
    // Auxiliary functions
    /** creates quads from the with the terms in mapping */
    RDFVocabulary.prototype.parsePropertiesToQuads = function () {
        var fs = require('fs');
        // We have
        // this.store
        // this.map
        // For each property of the main object of json file (in this case station)
        for (var elem in this.jsonSchema.properties.data.properties.alerts.items.properties) {
            console.log(elem);
            // If the property exists in the mapping
            if (this.map.has(elem)) {
                console.log("  ", this.map.get(elem));
                // Then create the quad and add it to the writer
                var newQuad = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', this.map.get(elem));
                this.writer.addQuad(newQuad);
            }
            // else create a new term for the property and add it to the writer
            else {
                var newQuad = this.node_node_node('gtfsst:station', 'w3c-ssn:hasProperty', elem);
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
