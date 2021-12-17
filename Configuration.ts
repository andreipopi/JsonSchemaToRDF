
interface TermMapping{
    key: string;
    term: string;   
}

export class Configuration {
    baseShaclURI = '/files/';
    baseRdfVocabURI = ''; 
    jsonTraverse = require('json-schema-traverse');
    jsonSchema = require('./files/station_information.json');

    // Mapping of available terms (manually defined in the constructor)
    termsMapping: TermMapping[] = [];

    constructor (){
        this.baseRdfVocabURI = 'https://w3id.org/gbfs/stations#';
        // In the optimal case we traverse json and add existing terms
        this.termsMapping.push( {key: 'description', term:'dcterms/description'} );
        this.termsMapping.push( {key: 'last_updated', term:'dcterms/modified'} );
        this.termsMapping.push( {key: 'type', term:'rdf:type'} );
        this.termsMapping.push( {key: 'station', term:'dbpedialowl:Station'} );
        this.termsMapping.push( {key: 'cross_street', term:'airs:locatedAtCrossStreet'} );


        //console.log(this.termsMapping['key']['term']);
        //.......complete list!

        //
        
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

        /*for (const elem in this.jsonSchema.properties.data.properties.stations.items.properties){

            if (this.termsMapping['key'].find(elem.toString()) == true){
                //console.log("elem", elem);
            }
            
        }*/
       
    };
    
    getShaclURI (){
        return this.baseShaclURI;
    };
    getVocabURI (){
        return this.baseRdfVocabURI;
    };
    getTermMapping (){
        return this.termsMapping;
    };
}