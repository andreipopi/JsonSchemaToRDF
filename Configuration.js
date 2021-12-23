"use strict";
exports.__esModule = true;
exports.Configuration = void 0;
var Configuration = /** @class */ (function () {
    // Constructors
    function Configuration() {
        //jsonSource = './files/station_information.json';
        this.jsonSource = './files/free_bike_status.json';
        //jsonSource =  './files/system_alerts.json';
        //jsonSchema = require(this.jsonSource);
        this.baseShaclURI = 'https://mymockwebsite.com/shapes/gbfs-station_information';
        this.baseRdfVocabURI = '';
        this.jsonTraverse = require('json-schema-traverse');
        // Mapping of available terms (manually defined in the constructor)
        this.map = new Map();
        this.newTermsMap = new Map();
        this.baseRdfVocabURI = 'https://w3id.org/gbfs/stations#';
        // Configuration.ts
        // Step 0) We have a hardcoded map of existing terms, assuming that we have also checked new incoming jsonSchemas
        // rdfVocabulary.ts
        // Step 1) create Turtle for the basic structure of the json schema: $schema, $id, $description, $properties
        // Step 2) check the properties{} of the schema, which contains domain specific objects, e.g. stations, bikes, etc...
        // In step 1 and 2, we will use the map to check what terms already exist
        this.map.set('description', 'dcterms:description');
        this.map.set('last_updated', 'dcterms:modified');
        this.map.set('type', 'rdf:type');
        this.map.set('url', 'schema:url');
        this.map.set('summary', 'ebucore:summary');
        // Station properties terms
        this.map.set('station_id', 'dcterms:identifier');
        this.map.set('name', 'foaf:name');
        this.map.set('short_name', 'rdfs:label');
        this.map.set('lat', 'geo:lat');
        this.map.set('lon', 'geo:long');
        this.map.set('cross_street', 'airs:locatedAtCrossStreet');
        this.map.set('region_id', 'dbpedia-owl:region');
        this.map.set('post_code', 'dbpedia-owl:postalCode');
        this.map.set('capacity', 'dbpedia-owl:capacity');
        // FreeBikeStatus properties terms
        this.map.set('bike_id', 'dcterms:identifier');
        this.map.set('alert_id', 'dcterms:identifier');
        this.newTermsMap.set('address', 'new');
        this.newTermsMap.set('rental_methods', 'new');
        this.newTermsMap.set('is_virtual_station', 'new');
        this.newTermsMap.set('station_area', 'new');
        this.newTermsMap.set('vehicle_capacity', 'new');
        this.newTermsMap.set('is_valet_station', 'new');
        this.newTermsMap.set('is_charging_station', 'new');
        this.newTermsMap.set('rental_uris', 'new');
        this.newTermsMap.set('vehicle_type_capacity', 'new');
    }
    ;
    // Station_information file parsing
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
    /*traverse () {
        for (const elem in this.jsonSchema.properties.data.properties.stations.items.properties){
            console.log('elemento', elem);
            if (this.map.has(elem)) {
                console.log("elem", this.map.get(elem));
            }
            
        }
       
    };*/
    Configuration.prototype.getJsonSource = function () {
        return this.jsonSource;
    };
    Configuration.prototype.getShaclURI = function () {
        return this.baseShaclURI;
    };
    ;
    Configuration.prototype.getVocabURI = function () {
        return this.baseRdfVocabURI;
    };
    ;
    Configuration.prototype.getTermMapping = function () {
        return this.map;
    };
    ;
    return Configuration;
}());
exports.Configuration = Configuration;
