// We would need to define different shapes for different jsons

import { stringify } from "querystring";

export class ShaclShape {

    jsonSchema: any;
    targetClass = 'https://w3id.org/gbfs/station';
    requiredProperties = new Map<string, string>();

    // Constructors
    constructor (required: Map<string, string>, source: string) {
        this.jsonSchema = require(source);
        this.requiredProperties = required;
    }


    // Methods
    writeConstraints (){
        const fs = require('fs');
        let textFile = '';

        let i = 0;
        for (let entry of Array.from(this.requiredProperties.entries())){
            console.log(entry);
            console.log("required", entry[0]);
            const type  = this.jsonSchema.properties.data.properties.stations.items.properties[entry[0]].type;
            textFile = textFile+(this.mustHaveProperty(entry[1], type)).toString()+'\n';
            i++;
        }
        fs.writeFileSync("shacl.ttl",textFile , function(err){
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