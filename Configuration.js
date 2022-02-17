"use strict";
exports.__esModule = true;
exports.Configuration = void 0;
var Configuration = /** @class */ (function () {
    // Constructors
    function Configuration(source) {
        this.jsonSource = '';
        this.baseShaclURI = 'https://mymockwebsite.com/shapes/gbfs-station_information';
        this.baseRdfVocabURI = '';
        this.map = new Map(); // Map of available terms from LOV (manually defined in the constructor)
        this.jsonSource = source;
        this.baseRdfVocabURI = 'https://w3id.org/gbfs/stations#';
        this.map.set('bike_id', 'dcterms:identifier');
        this.map.set('alert_id', 'dcterms:identifier');
        this.map.set('station_id', 'dcterms:identifier');
        this.map.set('vehicle_type_id', 'dcterms:identifier');
        this.map.set('region_id', 'dbpedia-owl:region');
        this.map.set('description', 'dcterms:description');
        this.map.set('type', 'rdf:type');
        this.map.set('last_updated', 'dcterms:modified');
        this.map.set('url', 'schema:url');
        this.map.set('summary', 'ebucore:summary');
        // Station properties terms
        this.map.set('name', 'foaf:name');
        this.map.set('short_name', 'rdfs:label');
        this.map.set('lat', 'geo:lat');
        this.map.set('lon', 'geo:long');
        this.map.set('cross_street', 'airs:locatedAtCrossStreet');
        this.map.set('post_code', 'dbpedia-owl:postalCode');
        this.map.set('capacity', 'dbpedia-owl:capacity');
        // FreeBikeStatus properties terms
        this.map.set('creditcard', 'schema:CreditCard');
        this.map.set('phone', 'foaf:phone');
        // vehicle types
        this.map.set('car', 'schema:car');
        this.map.set('bicycle', 'vso:bicycle');
    }
    ;
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
