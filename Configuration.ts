export class Configuration {
    baseShaclURI = 'https://mymockwebsite.com/shapes/gbfs-station_information';
    baseRdfVocabURI = ''; 
    jsonTraverse = require('json-schema-traverse');
    jsonSchema = require('./files/station_information.json');

    // Mapping of available terms (manually defined in the constructor)
    map = new Map<string, string>();

    constructor (){
        this.baseRdfVocabURI = 'https://w3id.org/gbfs/stations#';

        // Step 0) We have a hardcoded map of existing terms, assuming that we have also checked new incoming jsonSchemas
        // Step 1) create Turtle for the basic structure of the json schema: $schema, $id, $description, $properties
        // Step 2) check the properties{} of the schema, which contains domain specific objects, e.g. stations, bikes, etc...
        // In step 1 and 2, we will use the map to check what terms already exist

        this.map.set('description','dcterms/description');
        this.map.set('last_updated', 'dcterms/modified' );
        this.map.set('type', 'rdf:type');

        // Station properties terms
        this.map.set('station_id','dcterms/identifier');
        this.map.set( 'name', 'foaf:name');
        this.map.set( 'short_name', 'rdf:label');
        this.map.set( 'lat', 'geo_lat');
        this.map.set( 'lon', 'geo:long');
        this.map.set( 'address', 'new');
        this.map.set( 'cross_street', 'airs:locatedAtCrossStreet');
        this.map.set( 'region_id', 'dbpedia-owl:region');
        this.map.set( 'post_code', 'dbpedia-owl:postalCode');
        this.map.set( 'rental_methods', 'new');
        this.map.set( 'is_virtual_station', 'new');
        this.map.set( 'station_area', 'new');
        this.map.set( 'capacity', 'dbpedia-owl:capacity');
        this.map.set( 'vehicle_capacity', 'new');
        this.map.set( 'is_valet_station', 'new');
        this.map.set( 'is_charging_station', 'new');
        this.map.set( 'rental_uris', 'new');
        this.map.set( 'vehicle_type_capacity', 'new');

    };
    
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

    traverse () {

        let data = [];
        this.jsonTraverse(this.jsonSchema.properties.data.properties.stations.items.properties, (cb) => {
            
            //console.log(cb);
            data = cb;

        });

        for (const elem in this.jsonSchema.properties.data.properties.stations.items.properties){

         
            console.log('elemento', elem);
            if (this.map.has(elem)) {
                console.log("elem", this.map.get(elem));
            }
            
        }
       
    };
    
    getShaclURI (){
        return this.baseShaclURI;
    };
    getVocabURI (){
        return this.baseRdfVocabURI;
    };
    getTermMapping (){
        return this.map;
    };
}