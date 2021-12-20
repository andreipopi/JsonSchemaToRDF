// We would need to define different shapes for different jsons

import { stringify } from "querystring";

export class ShaclShape {

    jsonSchema: any;
    targetClass = '<https://w3id.org/gbfs/station>';
    shaclRoot = '<https://mymockwebsite.com/shapes/gbfs-station_information>';
    requiredProperties = new Map<string, string>();
    shaclFileText = '';
    fs = require('fs');

    // Constructors
    constructor (required: Map<string, string>, source: string) {
        this.jsonSchema = require(source);
        this.requiredProperties = required;
    }


    // Methods
    writeConstraints (){
        
        

        let i = 0;
        for (let entry of Array.from(this.requiredProperties.entries())){
            console.log(entry);
            console.log("required", entry[0]);
            const type  = this.jsonSchema.properties.data.properties.stations.items.properties[entry[0]].type;
            this.shaclFileText = this.shaclFileText+(this.mustHaveProperty(entry[1], type)).toString()+'\n';
            i++;
        }
        this.fs.writeFileSync("shacl.ttl", this.shaclFileText , function(err){
            if(err){
              return console.log("error");
            }
        });
        
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


    mustHaveProperty(nome: string, type: string) {
        console.log(nome);
        const prop = 'sh:property [ \n sh:path '+nome+ ';  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype '+ type+'; \n ];';
        return prop;
    }

}