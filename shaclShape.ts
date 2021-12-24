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
    constructor (required: Map<string, string>, source: string) {
        this.jsonSchema = require(source);
        this.requiredProperties = required;
        this.targetClass = '<https://w3id.org/gbfs/station>';
    }

    // Methods
    getShaclProperty (nome: string, type: string) {
        const prop = 'sh:property [ \n sh:path '+nome+ '; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }

    getShaclRequiredProperty(nome: string, type: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path '+nome+ ';  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }

    getShaclTargetClass(){
        return 'sh:targetClass ' + this.targetClass+ ';';
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