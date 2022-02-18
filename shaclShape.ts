// We would need to define different shapes for different jsons

import { stringify } from "querystring";

export class ShaclShape {

    jsonSchema: any;
    targetClass: any;
    shaclRoot = '<https://mymockwebsite.com/shapes/gbfs-station_information>';
    requiredProperties = new Map<string, string>();
    shaclFileText = '';
    fs = require('fs');

    // Constructors
    constructor (required: Map<string, string>, source: string, mainObj: string) {
        this.jsonSchema = require(source);
        this.requiredProperties = required;
        console.log("passed object",mainObj);
        console.log("main target",this.getShaclTarget(mainObj));
        this.targetClass = this.getShaclTarget(mainObj);
    }

    // Methods
    getShaclTypedProperty (nome: string, type: string) {
        const prop = 'sh:property [ \n sh:path '+nome+ '; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }

    getShaclTypedRequiredProperty(nome: string, type: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path '+nome+ ';  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }
    getShaclProperty (nome: string) {
        const prop = 'sh:property [ \n sh:path '+nome+ '; \n sh:maxCount 1; \n ];';
        return prop;
    }
    getShaclRequiredProperty(nome: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path '+nome+ ';  \n sh:minCount 1; \n sh:maxCount 1; \n ];';
        return prop;
    }
    getShaclTargetClass(){
        return 'sh:targetClass ' + this.targetClass+ ';';
    }
    getShaclTarget (mainObject:string) {
        switch(mainObject) { 
            case 'gbfsvcb:Station': { 
                return '<https://w3id.org/gbfs/station>';
                break; 
            } 
            case 'gbfsvcb:Bike': { 
               return '<https://w3id.org/gbfs/bike>';
               break;
            } 
            case 'gbfsvcb:Alert': { 
                return '<https://w3id.org/gbfs/alert>';
                break;
            }
            case 'gbfsvcb:Region': { 
                return '<https://w3id.org/gbfs/region>';
                break;
            }
            case 'gbfsvcb:VehicleType': { 
                return '<https://w3id.org/gbfs/vehicleType>';
                break;
            }
            case 'gbfsvcb:PricingPlan': { 
                return '<https://w3id.org/gbfs/pricingPlan>';
                break;
            }
            case 'gbfsvcb:Version': { 
                return '<https://w3id.org/gbfs/version>';
                break;
            }
            case 'gbfsvcb:Calendar': { 
                return '<https://w3id.org/gbfs/calendar>';
                break;
            }
            case 'gbfsvcb:RentalHour': { 
                return '<https://w3id.org/gbfs/rentalHour>';
                break;
            }
            case 'gbfsvcb:Feed': { 
                return '<https://w3id.org/gbfs/feed>';
                break;
            } 

             
            default: { 
               //statements; 
               break; 
            } 
         } 
    }

    getShaclRoot(){
        return this.shaclFileText = this.shaclRoot+ ' a sh:NodeShape; \n';
    }

    isRequired (prop:string){
        if (this.requiredProperties.has(prop)){
            return true;
        }
        else{
            return false;
        }
    }
}