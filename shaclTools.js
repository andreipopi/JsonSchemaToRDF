"use strict";
// We would need to define different shapes for different jsons
exports.__esModule = true;
exports.ShaclTools = void 0;
var ShaclTools = /** @class */ (function () {
    function ShaclTools() {
    }
    /*
    // Constructors
    constructor (required: Map<string, string>, source: string, mainObj: string) {
        
        this.jsonSchema = require(source);
        this.requiredProperties = required;

        console.log("passed object",mainObj);
        console.log("main target",this.getShaclTarget(mainObj));
        
    }*/
    ShaclTools.initialise = function (filename, required, source, mainObj) {
        this.fileName = filename;
        this.targetClass = ShaclTools.getShaclTarget(mainObj);
        this.requiredProperties = required;
    };
    ShaclTools.writeShacl = function (filename, shaclFileText) {
        // Write the Shacl shape on file
        this.fs.writeFileSync("build/" + this.fileName + "shacl.ttl", shaclFileText, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    // Methods
    ShaclTools.getShaclTypedProperty = function (nome, type) {
        var prop = 'sh:property [ \n sh:path <' + nome + '>; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    ShaclTools.getShaclTypedRequiredProperty = function (nome, type) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path <' + nome + '>;  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    ShaclTools.getShaclProperty = function (nome) {
        var prop = 'sh:property [ \n sh:path <' + nome + '>; \n sh:maxCount 1; \n ];';
        return prop;
    };
    ShaclTools.getShaclRequiredProperty = function (nome) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path <' + nome + '>;  \n sh:minCount 1; \n sh:maxCount 1; \n ];';
        return prop;
    };
    ShaclTools.getShaclTargetClass = function () {
        return 'sh:targetClass ' + this.targetClass + ';';
    };
    ShaclTools.getShaclTarget = function (mainObject) {
        switch (mainObject) {
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
    };
    ShaclTools.getShaclRoot = function () {
        return this.shaclFileText = this.shaclRoot + ' a sh:NodeShape; \n';
    };
    ShaclTools.isRequired = function (prop) {
        if (this.requiredProperties.has(prop)) {
            return true;
        }
        else {
            return false;
        }
    };
    ShaclTools.shaclRoot = '<https://w3id.org/gbfs/shapes/>';
    ShaclTools.shaclFileText = '';
    ShaclTools.fs = require('fs');
    return ShaclTools;
}());
exports.ShaclTools = ShaclTools;
