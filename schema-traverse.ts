import {ShaclTools} from './shaclTools';
import {JsonProcessor} from './jsonProcessor';

import { NamedNode } from "n3/lib/N3DataFactory";
import { convertToObject } from 'typescript';

const {RDFTools} = require("./rdfTools");
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;


let config = require('./configs/config-gbfs.json');

let writer = new N3.Writer({prefixes:config.prefixes});

let prefix ="gbfs";

let rdf_json_objects = new Map<string, string>();

//for (let object in config.jsonObjects){
//    rdf_json_objects.set(object, config.jsonObjects[object]);
//}

RDFTools.initialise("ElectricalMeasurement");

function getJsonObject(mainObject: string){
    for(let entry of Array.from(this.rdf_json_objects.entries())){
        const key = entry[0];
        const value = entry[1];
        if( key == mainObject){
            return this.rdf_json_objects.get(key);
        }
    }
}

function generateDataFromSchema(key,schema, propertyList) {
    
    if (!schema) { 
        return;
    }

    if (schema.type === 'string') {// Base Case
        writer.addQuad(RDFTools.node_node_node(prefix+':'+key, 'rdfs:range', 'xsd:string'));
        return key;
    }
    if (schema.type === 'number') { // Base Case
        writer.addQuad(RDFTools.node_node_node(prefix+':'+key, 'rdfs:range', 'xsd:integer'));
        return key;
    }
    if (schema.type === 'integer') {// Base Case
        writer.addQuad(RDFTools.node_node_node(prefix+':'+key, 'rdfs:range', 'xsd:integer'));
        return key;
    }
    if (schema.type === 'boolean') {
        // Base Case
        writer.addQuad(RDFTools.node_node_node(prefix+':'+key, 'rdfs:range', 'xsd:boolean'));
        return key;
    }
    
    
    const parsedData = {}
    /*
    if (schema.type === 'array'){
        // Recursive step
        console.log("keys", schema);
        for (let item of Object.keys(schema)){
            parsedData[item] = generateDataFromSchema(item,schema[item])
        }
        // minItems?, uniqueItems?
        return;
    }
    */
   
    if (schema.type === 'array'){


        if (schema.items != undefined){
            generateDataFromSchema(key, schema.items, []);
            console.log("schema items", schema.items);
            for(let item of Object.keys(schema.items)){
                generateDataFromSchema(item, schema[item], [])
                console.log("item", item);
            }
        }
        writer.addQuad(RDFTools.node_node_list(prefix+':'+key, 'hasItems', propertyList));
        return;
    }

    if (schema.type === 'object'){
        console.log("key", key);
        console.log("this is an object schema", schema);
        propertyList = []
        if(schema.properties != undefined){
            // Recursive Step
            for (let item of Object.keys(schema.properties)){
                propertyList.push(item);

                generateDataFromSchema(item,schema.properties[item], [])
            }
        }

        console.log("propertyLIst", propertyList);

        writer.addQuad(RDFTools.node_node_list(prefix+':'+key, 'rdfs:hasProperty', propertyList));

        propertyList = []

        return;
   
    }

    /*
    if(schema.properties != undefined){
        writer.addQuad(RDFTools.node_node_node(prefix+':'+key, 'rdfs:range', prefix+':'+key));

        // Recursive step
        for (let item of Object.keys(schema.properties)){
            console.log(item);

            parsedData[item] = generateDataFromSchema(item,schema.properties[item])
        }
    }
    if(schema.items != undefined){
        // Recursive step
        for (let item of Object.keys(schema.items)){
            console.log(item);
            parsedData[item] = generateDataFromSchema(item,schema.items[item])
        }
    }
    */
    
    if(schema.oneOf != undefined){
        // console.log("oneOf",schema.oneOf);
        // Base Case, remove the loop and recursion
        
        //for (let item in schema.items){
        //    console.log(item);
        //    parsedData[item] = generateDataFromSchema(item,schema.oneOf[item])
        //}
        return;
    }
    if(schema.allOf != undefined){
        if(key == "allOf" ){
            writer.addQuad(RDFTools.node_node_node(prefix+':'+key, 'rdfs:range', prefix+':'+key));
        }
        console.log("allOf",schema.allOf);
        // no need for recursion
        for (let item in schema.allOf){
            console.log(item);
            parsedData[item] = generateDataFromSchema(item,schema.allOf[item], [])
        }
    }

    if(schema.enum != undefined){
        console.log("enum is defined", schema.enum);

        // this can occur whenever 

    }
    return parsedData
  }
  

  const batterySmartDataModel = {
      schema : {
            type: "object",
            allOf: [
                {
                    "$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/GSMA-Commons"
                },
                {
                    "$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/Location-Commons"
                },
                {
                    properties: {
                        type: {
                            type: "string",
                            enum: [
                                "Battery"
                            ],
                            description: "Property. NGSI Entity type. It has to be Battery"
                        },
                        refDevice: {
                            anyOf: [
                                {
                                    type: "string",
                                    minLength: 1,
                                    maxLength: 256,
                                    pattern: "^[\\w\\-\\.\\{\\}\\$\\+\\*\\[\\]`|~^@!,:\\\\]+$",
                                    description: "Property. Identifier format of any NGSI entity"
                                },
                                {
                                    type: "string",
                                    format: "uri",
                                    description: "Property. Identifier format of any NGSI entity"
                                }
                            ],
                            description: "Relationship. Model:'http://schema.org/URL'. Device providing the measured data about the battery"
                        },
                        status: {
                            type: "array",
                            description: "Property. Model:'http://schema.org/Text'. Current operational status of the item",
                            minItems: 1,
                            uniqueItems: true,
                            items: {
                                type: "string",
                                enum: [
                                    "outOfService",
                                    "withIncidence",
                                    "working"
                                ]
                            }
                        },
                        cycleLife: {
                            "type": "integer",
                            "description": "Property. Model:'http://schema.org/Number'. Numeric value of the load/unload operation cycles for the item'"
                        },
                        autonomyTime: {
                            type: "string",
                            description: "Property. Model:'http://schema.org/Number'. Autonomy of operations of the item without further charge.",
                            pattern: "^(-?)P(?=\\d|T\\d)(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)([DW]))?(?:T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$"
                        },
                        rechargeTime: {
                            type: "string",
                            description: "Property. Model:'http://schema.org/Number'. Time for the full charge of the battery.",
                            pattern: "^(-?)P(?=\\d|T\\d)(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)([DW]))?(?:T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$"
                        },
                        acPowerInput: {
                            type: "number",
                            description: "Property. Model:'http://schema.org/Number'. Numeric value in volts for the alternate current charge. Units:'volts'"
                        },
                        acPowerOutput: {
                            type: "number",
                            description: "Property. Model:'http://schema.org/Number'. Numeric value in volts for the alternate output. Units:'volts'"
                        },
                        dcPowerInput: {
                            type: "number",
                            description: "Property. Model:'http://schema.org/Number'. Numeric value in volts for the continuous current charge. Units:'volts'"
                        },
                        dcPowerOutput: {
                            type: "number",
                            description: "Property. Model:'http://schema.org/Number'. Numeric value in volts for the continuous current charge. Units:'volts'"
                        }
                    }
                }
            ],
            required: [
                "id",
                "type"
            ]
        
    }
  };

  const electricalmeasurement = {

    schema:{
        
 
    license: "https://smart-data-models.github.io/dataModel.Energy/ThreePhaseAcMeasurement/LICENSE.md",
    type: "object",
    allOf: [
      {
        "$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/GSMA-Commons"
      },
      {
        "$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/Location-Commons"
      },
      {
        properties: {
          type: {
            type: "string",
            enum: [
              "ThreePhaseAcMeasurement"
            ],
            description: "Property. It must be equal to `ThreePhaseAcMeasurement`."
          },
          refDevice: {
            type: "array",
            description: "Relationship. Device(s) used to obtain the measurement.",
            items: {
              "$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/EntityIdentifierType"
            },
            minItems: 1,
            uniqueItems: true
          },
          refTargetDevice: {
            type: "array",
            description: "Relationship. Device(s) for which the measurement was taken.",
            items: {
              $ref: "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/EntityIdentifierType"
            },
            minItems: 1,
            uniqueItems: true
          },
          dateEnergyMeteringStarted: {
            type: "string",
            format: "date-time",
            description: "Property. Model:'http://schema.org/DateTime'. The starting date for metering energy."
          },
         
          totalApparentEnergyExport: {
            type: "number",
            minimum: 0,
            description: "Property. Model:'https://schema.org/Number'. Units:'kilovolt-ampere-reactive-hour (kVArh)'. Total energy exported (with regards to apparent power) since the metering start date (`dateEnergyMeteringStarted`)"
          },
          frequency: {
            type: "number",
            minimum: 0,
            description: "Property. Model:'http://schema.org/Number'. Units:'Hertz (Hz)'. The frequency of the circuit."
          },
          totalActivePower: {
            type: "number",
            description: "Property. Model:'http://schema.org/Number'. Units:'watt (W)'. Active power consumed (counting all phases)"
          },
          reactiveEnergyImport: {
            type: "object",
            description: "Property. Model:'kilovolt-ampere-reactive-hour (kVArh)'. Units:'http://schema.org/StructuredValue'. Fundamental frequency reactive energy imported i.e. consumed per phase since the metering start date. The actual values will be conveyed by subproperties which names will be equal to the name of each of the alternating current phases: L1, L2, L3.",
            properties: {
              L1: {
                type: "number",
                minimum: 0
              },
              L2: {
                type: "number",
                minimum: 0
              },
              L3: {
                type: "number",
                minimum: 0
              }
            }
          },
          
          thdCurrent: {
            type: "object",
            description: "Property. Model:'http://schema.org/StructuredValue'. Units:'0 to 1'. Total harmonic distortion of electrical current. The actual values will be conveyed by one subproperty per alternating current phase: L1, L2 and L3",
            properties: {
              L1: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              L2: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              L3: {
                type: "number",
                minimum: 0,
                maximum: 1
              }
            }
          }
        }
      }
    ],
    required: [
      "id",
      "type"
    ]
    }
  };
  

  const gbfsschema = {
    schema : {
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
    }
  };


const gbfsstation = {
    schema : {
    
          
            type: "object",
            properties: {
              last_updated: {
                description:
                  "Last time the data in the feed was updated in POSIX time.",
                type: "integer",
                minimum: 1450155600
              },
              ttl: {
                description:
                  "Number of seconds before the data in the feed will be updated again (0 if the data should always be refreshed).",
                type: "integer",
                minimum: 0
              },
              version: {
                description:
                  "GBFS version number to which the feed conforms, according to the versioning framework (added in v1.1).",
                type: "string",
                const: "2.3-RC"
              },
              data: {
                description:
                  "Array that contains one object per station as defined below.",
                type: "object",
                properties: {
                  stations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        station_id: {
                          description: "Identifier of a station.",
                          type: "string"
                        },
                       
                        lat: {
                          description: "The latitude of the station.",
                          type: "number",
                          minimum: -90,
                          maximum: 90
                        },
                       
                        cross_street: {
                          description:
                            "Cross street or landmark where the station is located.",
                          type: "string"
                        },
                        region_id: {
                          description:
                            "Identifier of the region where the station is located.",
                          type: "string"
                        },
                        
                        rental_methods: {
                          description: "Payment methods accepted at this station.",
                          type: "array",
                          items: {
                            type: "string",
                            enum: [
                              "key",
                              "creditcard",
                              "paypass",
                              "applepay",
                              "androidpay",
                              "transitcard",
                              "accountnumber",
                              "phone"
                            ]
                          },
                          minItems: 1
                        },
                        is_virtual_station: {
                          description:
                            "Is this station a location with or without physical infrastructure? (added in v2.1-RC)",
                          type: "boolean"
                        },
                        station_area: {
                          description:
                            "A multipolygon that describes the area of a virtual station (added in v2.1-RC).",
                          type: "object",
                          required: ["type", "coordinates"],
                          properties: {
                            type: {
                              type: "string",
                              enum: ["MultiPolygon"]
                            },
                            coordinates: {
                              type: "array",
                              items: {
                                type: "array",
                                items: {
                                  type: "array",
                                  minItems: 4,
                                  items: {
                                    type: "array",
                                    minItems: 2,
                                    items: {
                                      type: "number"
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        capacity: {
                          description:
                            "Number of total docking points installed at this station, both available and unavailable.",
                          type: "integer",
                          minimum: 0
                        },
                        vehicle_capacity: {
                          description:
                            "An object where each key is a vehicle_type_id and the value is a number presenting the total number of vehicles of this type that can park within the station_area (added in v2.1-RC).",
                          type: "object",
                          additionalProperties: {
                            type: "number"
                          }
                        },
                        is_valet_station: {
                          description:
                            "Are valet services provided at this station? (added in v2.1-RC)",
                          type: "boolean"
                        },
                        
                        rental_uris: {
                          description:
                            "Contains rental uris for Android, iOS, and web in the android, ios, and web fields (added in v1.1).",
                          type: "object",
                          properties: {
                            android: {
                              description:
                                "URI that can be passed to an Android app with an intent (added in v1.1).",
                              type: "string",
                              format: "uri"
                            },
                            ios: {
                              description:
                                "URI that can be used on iOS to launch the rental app for this station (added in v1.1).",
                              type: "string",
                              format: "uri"
                            },
                            web: {
                              description:
                                "URL that can be used by a web browser to show more information about renting a vehicle at this station (added in v1.1).",
                              type: "string",
                              format: "uri"
                            }
                          }
                        },
                        vehicle_type_capacity: {
                          description:
                            "An object where each key is a vehicle_type_id and the value is a number representing the total docking points installed at this station for each vehicle type (added in v2.1-RC).",
                          type: "object",
                          additionalProperties: {
                            type: "number"
                          }
                        }
                      },
                      required: ["station_id", "name", "lat", "lon"]
                    }
                  }
                },
                required: ["stations"]
              }
            },
            required: ["last_updated", "ttl", "version", "data"]
          
    }
};




//JsonProcessor.initialise(gbfsstation, object);

generateDataFromSchema(gbfsstation,gbfsstation.schema, [])


RDFTools.writeTurtle(writer);

