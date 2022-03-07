// We would need to define different shapes for different jsons

import { stringify } from "querystring";

export class ShaclTools {

    jsonSchema: any;
    //static config = require('./configs/config-smartdatamodel.json');
    static config = require('./configs/config-gbfs.json');

    static targetClass: any;
    static shaclFileText = '';
    static fs = require('fs');
    static fileName: any;
    static requiredProperties: Map<string, string>;

    static initialise(filename, mainObj: string){
        this.fileName = filename;

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
    static shapeShaclRoot(root:string){
        return this.shaclFileText = root+ ' a sh:NodeShape; \n';
    } 
}