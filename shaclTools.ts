// We would need to define different shapes for different jsons

import { stringify } from "querystring";

export class ShaclTools {

    jsonSchema: any;
    //static config = require('./configs/config-smartdatamodel.json');
    static config = require('./configs/config-gbfs.json');
    //static config = require('./configs/config-battery.json');

    static shaclRoot: any;
    static targetClass: any;
    static shaclFileText = '';
    static fs = require('fs');
    static fileName: any;
    static requiredProperties = [];

    static initialise(filename, mainObj: string){
        this.fileName = filename;
        this.shaclFileText = ""; // reset in case there are more schemas

        console.log("mainObject", mainObj);
        this.targetClass = ShaclTools.getShaclTarget(mainObj);
        this.shaclRoot = this.config.shaclRoot;
        console.log("targetClass", this.targetClass);
        // Create a ShaclShape object and insert the first entries
        this.shaclFileText = this.shaclFileText+ShaclTools.shapeShaclRoot(this.shaclRoot);
        this.shaclFileText = this.shaclFileText+'sh:targetClass ' + this.targetClass+ '; \n';

    }
    static writeShacl (){
        // Write the Shacl shape on file
        let filePath = `build/${this.fileName}shacl.ttl`.replace(/:/g,'');
        this.fs.writeFileSync(filePath, this.shaclFileText , function(err:any){
            if(err){
                return console.log("error");
            }
        });
    }

    static addRequiredTerms (termList){
        this.requiredProperties.concat(termList);
    }

    static isRequired(term: string){
        if (this.requiredProperties.includes(term)!= false) {
            return term; 
        }
        else{
            return false;
        }
    }
    // Methodscompile(mySchema, 'MySchema')


    static getShaclTarget (mainObject:string) {

        for( let entry of Object.entries(this.config.shaclTargets)){
        //for(let entry of Array.from(this.config.shaclTargets.entries())){
            console.log("entry", entry);
            const key = entry[0];
            const value = entry[1];
            if( key == mainObject){
                return this.config.shaclTargets[key];
            }
        }
    }

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