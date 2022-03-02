"use strict";
// We would need to define different shapes for different jsons
exports.__esModule = true;
exports.ShaclTools = void 0;
var ShaclTools = /** @class */ (function () {
    // Constructors
    function ShaclTools(required, source, mainObj) {
        this.shaclRoot = '<https://w3id.org/gbfs/shapes/>';
        this.requiredProperties = new Map();
        this.shaclFileText = '';
        this.fs = require('fs');
        this.jsonSchema = require(source);
        this.requiredProperties = required;
        console.log("passed object", mainObj);
        console.log("main target", this.getShaclTarget(mainObj));
        this.targetClass = this.getShaclTarget(mainObj);
    }
    // Methods
    ShaclTools.prototype.getShaclTypedProperty = function (nome, type) {
        var prop = 'sh:property [ \n sh:path <' + nome + '>; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    ShaclTools.prototype.getShaclTypedRequiredProperty = function (nome, type) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path <' + nome + '>;  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    ShaclTools.prototype.getShaclProperty = function (nome) {
        var prop = 'sh:property [ \n sh:path <' + nome + '>; \n sh:maxCount 1; \n ];';
        return prop;
    };
    ShaclTools.prototype.getShaclRequiredProperty = function (nome) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path <' + nome + '>;  \n sh:minCount 1; \n sh:maxCount 1; \n ];';
        return prop;
    };
    ShaclTools.prototype.getShaclTargetClass = function () {
        return 'sh:targetClass ' + this.targetClass + ';';
    };
    ShaclTools.prototype.getShaclTarget = function (mainObject) {
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
    ShaclTools.prototype.getShaclRoot = function () {
        return this.shaclFileText = this.shaclRoot + ' a sh:NodeShape; \n';
    };
    ShaclTools.prototype.isRequired = function (prop) {
        if (this.requiredProperties.has(prop)) {
            return true;
        }
        else {
            return false;
        }
    };
    return ShaclTools;
}());
exports.ShaclTools = ShaclTools;
