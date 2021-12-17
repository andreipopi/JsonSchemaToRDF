
// This is a simple json-ttl parser that takes as input a Json schema (info here: https://github.com/NABSA/gbfs/blob/master/gbfs.md#free_bike_statusjson , https://github.com/MobilityData/gbfs-json-schema)
// and returns its RDF version (Turtle in this case). A general version of this is necessary to allow translation of different jsons.
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

const store = new N3.Store();

const jsonSchema = require('/files/free_bike_status.json');


// Write prefixes
var writer = new N3.Writer({ prefixes: {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        foaf: 'http://xmlns.com/foaf/0.1/',
        dc: 'http://purl.org/dc/terms/',
        vs: 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
        vann: 'http://purl.org/vocab/vann/',
        ssn: 'http://www.w3.org/ns/ssn/hasProperty',
        owl: 'http://www.w3.org/2002/07/owl#',
    } });
    
// Define an N3 store to add all Quads



// Basic elements of a Json schema, avaialable in all schemas
const schema = jsonSchema.$schema;
const description = jsonSchema.description;
const id = jsonSchema.$id;

const aDocument = node_node_node(schema, 'rdf:type', 'foaf:Document');
const descriptionQuad = node_node_literal(schema, 'rdfs:comment', description);
const idQuad = node_node_literal(schema, 'rdf:ID', id);
store.addQuad(aDocument);
store.addQuad(descriptionQuad);
store.addQuad(idQuad);




console.log(getQuads(store, schema, 'rdf:type', 'foaf:Document'));


function getQuads (st, subj:string, pred:string, obj:string){
    return st.getQuads(namedNode(subj), namedNode('rdf:type', namedNode('foaf:Document')));
}


// Next, we need to get the properties of the Json schema and add them as quads, in a general way.
// For example, in the properties of one file, in properties we might have bikes,
// In another we might have alerts, and so on...
const containsQuad = node_node_node(schema, 'contains', 'data');

writer.addQuad(aDocument);
writer.addQuad(descriptionQuad);
writer.addQuad(idQuad);
writer.addQuad(containsQuad);


//dc:issued
//dc:modified
//owl:versionInfo



// Data includes set of bikes
const includesBikes = node_node_node('data', 'contains', 'bikes');
// Set of bikes is made of bike
const madeOf = node_node_node('bikes', 'madeOf', 'bike');
// Bike has bike id, lat, lon, is reserved, is disabled
const bikeHasID = node_node_node('bike', 'ssn:hasPropery', 'bike_id');
const bikeHasLat = node_node_node('bike', 'ssn:hasPropery', 'lat');
const bikeHasLon = node_node_node('bike', 'ssn:hasPropery', 'lon');
const bikeHasIsReserved = node_node_node('bike', 'ssn:hasPropery', 'is_reserved');
const bikeHasIsDisabled = node_node_node('bike', 'ssn:hasPropery', 'is_disabled');

writer.addQuad(includesBikes);
writer.addQuad(madeOf);
writer.addQuad(bikeHasID);
writer.addQuad(bikeHasLat);
writer.addQuad(bikeHasLon);
writer.addQuad(bikeHasIsReserved);
writer.addQuad(bikeHasIsDisabled);


// Looping over the the properties of a bike
for (const bikeProp of Object.keys(jsonSchema.properties.data.properties.bikes.items.properties)) {
    let description = '';
    let domain = '';
    let type = '';
    let oneOf = '';
    switch (bikeProp) {
        case 'bike_id': {
            console.log('It’s a match');
            description = jsonSchema.properties.data.properties.bikes.items.properties.bike_id.description;
            type = jsonSchema.properties.data.properties.bikes.items.properties.bike_id.type;
            break;
        }
        case 'lon': {
            description = jsonSchema.properties.data.properties.bikes.items.properties.lon.description;
            type = jsonSchema.properties.data.properties.bikes.items.properties.lon.type;
            // Need to add a min -90 and a max 90
            break;
        }
        case 'lat': {
            description = jsonSchema.properties.data.properties.bikes.items.properties.lat.description;
            type = jsonSchema.properties.data.properties.bikes.items.properties.lat.type;
            // Need to add a min -90 and a max 90
            break;
        }
        case 'is_reserved': {
            description = jsonSchema.properties.data.properties.bikes.items.properties.is_reserved.description;
            //PC: you need to create an rdf:List here
            oneOf = '(boolean number)';
            break;
        }
        case 'is_disabled': {
            description = jsonSchema.properties.data.properties.bikes.items.properties.is_disabled.description;
            //PC: you need to create an rdf:List here
            oneOf = '(boolean number)';
            break;
        }
    }
    console.log(description);
    console.log(bikeProp);

    // We create necessary quads and add them to the writer
    if (bikeProp == 'bike_id' || bikeProp == "lat" || bikeProp == "lon") {
        const typeQuad = node_node_literal(bikeProp, 'rdf:type', type);
        writer.addQuad(typeQuad);
    }
    else {
        const typeQuad = node_node_node(bikeProp, 'owl:oneOf', oneOf);
        writer.addQuad(typeQuad);
    }
    const descriptionQuad = node_node_literal(bikeProp, 'rdfs:comment', description);
    writer.addQuad(descriptionQuad);

}

const fs = require('fs');

// Resulting turtle 
writer.end((error, result) => fs.writeFile('turtleTranslation.ttl', result, (err) => {
                                // throws an error, you could also catch it here
                                if (err) throw err;
                                // success case, the file was saved
                                console.log('Turtle saved!');}));

// Auxiliary functions-------------------------------------------------
/** creates a quad from information parsed from the JSON file */
function node_node_literal (subj: string, pred:string, obj:string) {
    const myQuad = quad( namedNode(subj), namedNode(pred), literal(obj), defaultGraph());
    return myQuad;
}

function node_node_node (subj: string, pred:string, obj:string) {
    const myQuad = quad( namedNode(subj), namedNode(pred), namedNode(obj), defaultGraph());
    return myQuad;
}

function node_literal_literal (subj: string, pred:string, obj:string) {
    const myQuad = quad( namedNode(subj), literal(pred), literal(obj), defaultGraph());
    return myQuad;
}