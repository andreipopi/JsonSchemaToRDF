
// This is a simple json-ttl parser that takes as input a file of the shape of free_bike_status.json (info here: https://github.com/NABSA/gbfs/blob/master/gbfs.md#free_bike_statusjson , https://github.com/MobilityData/gbfs-json-schema)
// and returns its ttl version. A fully general version of this is necessary to allow translation of different jsons.
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
import { json } from "stream/consumers";
const jsonSchema = require("./files/free_bike_status.json");
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

// Write prefixes
const writer = new N3.Writer({ prefixes: { 
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#', 
    foaf: 'http://xmlns.com/foaf/0.1/', 
    owl:  'http://www.w3.org/2002/07/owl#'}});

const aDocument = node_node_node('http://json-schema.org/draft-07/schema', 'a', 'foaf:Document');
const descriptionQuad = node_node_literal('http://json-schema.org/draft-07/schema', 'rdfs:comment', jsonSchema.description);
const containsQuad = node_node_node('http://json-schema.org/draft-07/schema', 'contains', 'data');
// Data includes set of bikes
const includesBikes = node_node_node('data', 'contains', 'bikes');
// Set of bikes is made of bike
const madeOf = node_node_node('bikes', 'madeOf', 'bike');
// Bike has bike id, lat, lon, is reserved, is disabled
const bikeHasID = node_node_node('bike', 'hasPropery', 'bike_id');
const bikeHasLat = node_node_node('bike', 'hasPropery', 'lat');
const bikeHasLon = node_node_node('bike', 'hasPropery', 'lon');
const bikeHasIsReserved = node_node_node('bike', 'hasPropery', 'is_reserved');
const bikeHasIsDisabled = node_node_node('bike', 'hasPropery', 'is_disabled');

writer.addQuad(aDocument);
writer.addQuad(descriptionQuad);
writer.addQuad(containsQuad);
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
            console.log('its a match');
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
            oneOf = '(boolean number)';
            break;
        }
        case 'is_disabled': {
            description = jsonSchema.properties.data.properties.bikes.items.properties.is_disabled.description;
            oneOf = '(boolean number)';
            break;
        }
    }
    console.log(description);
    console.log(bikeProp);

    // We create necessary quads and add them to the writer
    if (bikeProp == 'bike_id' || bikeProp == "lat" || bikeProp == "lon") {
        const typeQuad = node_literal_literal(bikeProp, 'a', type);
        writer.addQuad(typeQuad);
    }
    else {
        const typeQuad = node_literal_literal(bikeProp, 'owl:oneOf', oneOf);
        writer.addQuad(typeQuad);
    }
    const descriptionQuad = node_literal_literal(bikeProp, 'rdfs:comment', description);
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
    const myQuad = quad(
        namedNode(subj),
        namedNode(pred),
        literal(obj),
        defaultGraph(),
      );
    return myQuad;
}

function node_node_node (subj: string, pred:string, obj:string) {
    const myQuad = quad(
        namedNode(subj),
        namedNode(pred),
        namedNode(obj),
        defaultGraph(),
      );
    return myQuad;
}

function node_literal_literal (subj: string, pred:string, obj:string) {
    const myQuad = quad(
        namedNode(subj),
        literal(pred),
        literal(obj),
        defaultGraph(),
      );
    return myQuad;
}

/** adds necessary prefixes to the .ttl file */
function addPrefixesToTtl(){
    return null;
}

/** adds available quads to the .ttl file */
function addQuadsToTtl(){
    return null;
}

//rules that define the json file
//
//
//rules
