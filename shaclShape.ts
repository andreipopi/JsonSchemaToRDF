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
    writeConstraints (mainJsonObject:string ){
        let i = 0;
        for (let entry of Array.from(this.requiredProperties.entries())){
            console.log(entry);
            console.log("required", entry[0]);
            const type  = this.jsonSchema.properties.data.properties[mainJsonObject].items.properties[entry[0]].type;
            this.shaclFileText = this.shaclFileText+(this.getShaclRequiredProperty(entry[1], type)).toString()+'\n';
            i++;
        }
        this.fs.writeFileSync("shacl.ttl", this.shaclFileText , function(err){
            if(err){
              return console.log("error");
            }
        });
        
    }


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

    writeTargetClass (){
        this.shaclFileText = 'sh:targetClass ' + this.targetClass+ ';\n' +this.shaclFileText;
        this.fs.writeFileSync("shacl.ttl", this.shaclFileText , function(err){
            if(err){
              return console.log("error");
            }
        });
    }

    writeShaclRoot (){
        this.shaclFileText = this.shaclRoot+ ' a sh:NodeShape; \n' +this.shaclFileText;
        this.fs.writeFileSync("shacl.ttl", this.shaclFileText , function(err){
            if(err){
              return console.log("error");
            }
        });
    }
}