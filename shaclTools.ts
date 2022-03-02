// We would need to define different shapes for different jsons

import { stringify } from "querystring";

export class ShaclTools {

    jsonSchema: any;
    static targetClass: any;
    static shaclRoot = '<https://w3id.org/gbfs/shapes/>';
    static shaclFileText = '';
    static fs = require('fs');
    static fileName: any;
    static requiredProperties: Map<string, string>;

    static initialise(filename, required: Map<string, string>, source: string, mainObj: string){
        this.fileName = filename;
        this.targetClass = ShaclTools.getShaclTarget(mainObj);
        this.requiredProperties = required;
    }

    static writeShacl (filename, shaclFileText){
        // Write the Shacl shape on file
        this.fs.writeFileSync(`build/${this.fileName}shacl.ttl`, shaclFileText , function(err:any){
            if(err){
                return console.log("error");
            }
        });
    }

    // Methods
    static getShaclTypedProperty (nome: string, type: string) {
        const prop = 'sh:property [ \n sh:path <'+nome+ '>; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }

    static getShaclTypedRequiredProperty(nome: string, type: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path <'+nome+ '>;  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }
    static getShaclProperty (nome: string) {
        const prop = 'sh:property [ \n sh:path <'+nome+ '>; \n sh:maxCount 1; \n ];';
        return prop;
    }
    static getShaclRequiredProperty(nome: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path <'+nome+ '>;  \n sh:minCount 1; \n sh:maxCount 1; \n ];';
        return prop;
    }
    static getShaclTargetClass(){
        return 'sh:targetClass ' + this.targetClass+ ';';
    }
    static getShaclTarget (mainObject:string) {
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

    static getShaclRoot(){
        return this.shaclFileText = this.shaclRoot+ ' a sh:NodeShape; \n';
    }

    static isRequired (prop:string){
        if (this.requiredProperties.has(prop)){
            return true;
        }
        else{
            return false;
        }
    }
}