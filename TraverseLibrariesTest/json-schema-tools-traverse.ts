const traverse = require("@json-schema-tools/traverse").default;
//import traverse from "@json-schema-tools/traverse"

const mySchema = 
    {
        $schema: "http://json-schema.org/draft-07/schema",
        $id: "https://github.com/NABSA/gbfs/blob/v1.0/gbfs.md#free_bike_statusjson",
        description: "Describes the vehicles that are available for rent (as of v2.1-RC2).",
        type: "object",
        properties: {
          last_updated: {
            description: "Last time the data in the feed was updated in POSIX time.",
            type: "integer",
            minimum: 0,
            maximum: 1924988399
          },
          ttl: {
            description: "Number of seconds before the data in the feed will be updated again (0 if the data should always be refreshed).",
            type: "integer",
            minimum: 0
          },
          data: {
            description: "Array that contains one object per bike as defined below.",
            type: "object",
            properties: {
              bikes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    bike_id: {
                      description: "Rotating (as of v2.0) identifier of a vehicle.",
                      type: "string"
                    },
                    lat: {
                      description: "The latitude of the vehicle.",
                      type: "number",
                      minimum: -90,
                      maximum: 90
                    },
                    lon: {
                      description: 	"The longitude of the vehicle.",
                      type: "number",
                      minimum: -180,
                      maximum: 180
                    },
                    is_reserved: {
                      description: "Is the vehicle currently reserved?",
                      oneOf: [{ "type": "boolean" }, { "type": "number" }]
                    },
                    is_disabled: {
                      description: "Is the vehicle currently disabled (broken)?",
                      oneOf: [{ "type": "boolean" }, { "type": "number" }]
                    }
                  },
                  required: ["bike_id", "lat", "lon", "is_reserved", "is_disabled"]
                }
              }
            },
            required: ["bikes"]
          }
        },
        required: ["last_updated", "ttl", "data"]
      
};


const schema2 = {
    "prefix": "sdm",
    "jsonObjects": {
        "sdm:Battery":  "allOf",
        "sdm:Type": "type",
        "sdm:RefDevice": "refDevice",
        "sdm:Status": "status",
        "sdm:CycleLife": "cycleLife",
        "sdm:AutonomyTime": "autonomyTime",
        "sdm:RechargeTime": "rechargeTime",
        "sdm:AcPowerInput": "acPowerInput",
        "sdm:AcPowerOutput": "acPowerOutput",
        "sdm:DcPowerInput": "dcPowerInput",
        "sdm:DcPowerOutput": "dcPowerOutput"
    },
    "sources": {
        "./SmartDataModels/battery.json": "sdm:Battery"
    },
  
    "shaclTargets": {
        "sdm:Battery": ""
    },
    "shaclRoot": "",
    
    "prefixes": {
        "sdm": "https://smart-data-models.github.io/dataModel.Energy/ThreePhaseAcMeasurement/terms",
        "schema": "http://schema.org/#",
        "ebucore": "http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "dcterms": "http://purl.org/dc/terms/",
        "vs": "http://www.w3.org/2003/06/sw-vocab-status/ns#",
        "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
        "vann": "http://purl.org/vocab/vann/",
        "owl": "http://www.w3.org/2002/07/owl#",
        "jsonsc": "https://www.w3.org/2019/wot/json-schema#",
        "airs": "https://raw.githubusercontent.com/airs-linked-data/lov/latest/src/airs_vocabulary.ttl#",
        "vso": "http://purl.org/vso/ns#",
        "dbpedia-owl": "http://dbpedia.org/ontology/"
    },
    
    "terms": {
        "description":"dcterms:description",
        "type": "rdf:type",
        "last_updated": "dcterms:modified" ,
        "url": "schema:url",
        "summary": "ebucore:summary",
        "name": "foaf:name",
        "short_name": "rdfs:label",
        "lat": "geo:lat",
        "lon": "geo:long",
        "cross_street": "airs:locatedAtCrossStreet",
        "post_code": "dbpedia-owl:postalCode",
        "capacity": "dbpedia-owl:capacity",
        "creditcard": "schema:CreditCard",
        "phone": "foaf:phone",
        "car": "schema:car"
    },

    "creators": {
        "creator1": "https://pietercolpaert.be/#me",
        "creator2": "https://www.linkedin.com/in/andrei-popescu/"
    }
  
};

traverse(mySchema, (schemaOrSubschema) => {
  console.log(schemaOrSubschema.title);
});

