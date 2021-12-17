"use strict";
exports.__esModule = true;
exports.Configuration = void 0;
var Configuration = /** @class */ (function () {
    function Configuration() {
        this.baseShaclURI = '/files/';
        this.baseRdfVocabURI = '';
        this.jsonTraverse = require('json-schema-traverse');
        this.jsonSchema = require('./files/station_information.json');
        // Mapping of available terms (manually defined in the constructor)
        this.termsMapping = [];
        this.map = new Map();
        this.baseRdfVocabURI = 'https://w3id.org/gbfs/stations#';
        // We have a hardcoded map of existing terms, assuming that we have also checked new incoming jsonSchemas
        // Step 1) create Turtle for the basic structure of the json schema: $schema, $id, $description, $properties
        // Step 2) check the properties{} of the schema, which contains domain specific objects, e.g. stations, bikes, etc...
        // In step 1 and 2, we use the map to check what terms already exist
        this.map.set('description', 'dcterms/description');
        this.map.set('last_updated', 'dcterms/modified');
        this.map.set('type', 'rdf:type');
        this.map.set('station', 'dbpedialowl:Station');
        this.map.set('station_id', 'dcterms/identifier');
        this.map.set('cross_street', 'airs:locatedAtCrossStreet');
        //console.log(this.termsMapping['key']['term']);
        //.......complete list!
        //
    }
    ;
    // Station_information file parsing
    // json-schema-traverse is a not mantained
    /*traverse (){
        let data = [];
        this.jsonTraverse(this.jsonSchema.properties, (cb) => {
            console.log()
            console.log(cb.data);
            data = cb.data;
            for (const elem in cb){
                console.log(elem);
            }
        });
        console.log("========");
        this.jsonTraverse(this.jsonSchema.properties.data.properties.stations.items, (cb) => {
            console.log('-----');
            console.log(cb);
            data = cb;
            for (const elem in cb){
                console.log("elem", elem.valueOf());
            }
        });
     
    };*/
    Configuration.prototype.traverse = function () {
        var data = [];
        this.jsonTraverse(this.jsonSchema.properties.data.properties.stations.items.properties, function (cb) {
            //console.log(cb);
            data = cb;
        });
        for (var elem in this.jsonSchema.properties.data.properties.stations.items.properties) {
            console.log('elemento', elem);
            if (this.map.has(elem)) {
                console.log("elem", this.map.get(elem));
            }
        }
    };
    ;
    Configuration.prototype.getShaclURI = function () {
        return this.baseShaclURI;
    };
    ;
    Configuration.prototype.getVocabURI = function () {
        return this.baseRdfVocabURI;
    };
    ;
    Configuration.prototype.getTermMapping = function () {
        return this.termsMapping;
    };
    ;
    return Configuration;
}());
exports.Configuration = Configuration;
