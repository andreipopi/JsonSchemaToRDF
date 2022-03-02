// We would need to define different shapes for different jsons

import { stringify } from "querystring";

export class ShaclTools {

    jsonSchema: any;
    targetClass: any;
    shaclRoot = '<https://w3id.org/gbfs/shapes/>';
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
        const prop = 'sh:property [ \n sh:path <'+nome+ '>; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }

    getShaclTypedRequiredProperty(nome: string, type: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path <'+nome+ '>;  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }
    getShaclProperty (nome: string) {
        const prop = 'sh:property [ \n sh:path <'+nome+ '>; \n sh:maxCount 1; \n ];';
        return prop;
    }
    getShaclRequiredProperty(nome: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path <'+nome+ '>;  \n sh:minCount 1; \n sh:maxCount 1; \n ];';
        return prop;
    }
    getShaclTargetClass(){
        return 'sh:targetClass ' + this.targetClass+ ';';
    }
    getShaclTarget (mainObject:string) {
        switch(mainObject) { 
            case 'gbfs:Station': { 
                return '<https://w3id.org/gbfs/terms/station>';
                break; 
            } 
            case 'gbfs:Bike': { 
               return '<https://w3id.org/gbfs/terms/bike>';
               break;
            } 
            case 'gbfs:Alert': { 
                return '<https://w3id.org/gbfs/terms/alert>';
                break;
            }
            case 'gbfs:Region': { 
                return '<https://w3id.org/gbfs/terms/region>';
                break;
            }
            case 'gbfs:VehicleType': { 
                return '<https://w3id.org/gbfs/terms/vehicleType>';
                break;
            }
            case 'gbfs:PricingPlan': { 
                return '<https://w3id.org/gbfs/terms/pricingPlan>';
                break;
            }
            case 'gbfs:Version': { 
                return '<https://w3id.org/gbfs/terms/version>';
                break;
            }
            case 'gbfs:Calendar': { 
                return '<https://w3id.org/gbfs/terms/calendar>';
                break;
            }
            case 'gbfs:RentalHour': { 
                return '<https://w3id.org/gbfs/terms/rentalHour>';
                break;
            }
            case 'gbfs:Feed': { 
                return '<https://w3id.org/gbfs/terms/feed>';
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