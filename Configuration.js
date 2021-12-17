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
        this.baseRdfVocabURI = 'https://w3id.org/gbfs/stations#';
        // In the optimal case we traverse json and add existing terms
        this.termsMapping.push({ key: 'description', term: 'dcterms/description' });
        this.termsMapping.push({ key: 'last_updated', term: 'dcterms/modified' });
        this.termsMapping.push({ key: 'type', term: 'rdf:type' });
        this.termsMapping.push({ key: 'station', term: 'dbpedialowl:Station' });
        this.termsMapping.push({ key: 'cross_street', term: 'airs:locatedAtCrossStreet' });
        console.log(this.termsMapping['key']['term']);
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
            if (this.termsMapping['key'].find(elem.toString()) == true) {
                //console.log("elem", elem);
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
