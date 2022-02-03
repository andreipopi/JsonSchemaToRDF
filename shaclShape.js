"use strict";
// We would need to define different shapes for different jsons
exports.__esModule = true;
exports.ShaclShape = void 0;
var ShaclShape = /** @class */ (function () {
    // Constructors
    function ShaclShape(required, source, mainObj) {
        this.shaclRoot = '<https://mymockwebsite.com/shapes/gbfs-station_information>';
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
    ShaclShape.prototype.getShaclTypedProperty = function (nome, type) {
        var prop = 'sh:property [ \n sh:path ' + nome + '; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    ShaclShape.prototype.getShaclTypedRequiredProperty = function (nome, type) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path ' + nome + ';  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    ShaclShape.prototype.getShaclProperty = function (nome) {
        var prop = 'sh:property [ \n sh:path ' + nome + '; \n sh:maxCount 1; \n ];';
        return prop;
    };
    ShaclShape.prototype.getShaclRequiredProperty = function (nome) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path ' + nome + ';  \n sh:minCount 1; \n sh:maxCount 1; \n ];';
        return prop;
    };
    ShaclShape.prototype.getShaclTargetClass = function () {
        return 'sh:targetClass ' + this.targetClass + ';';
    };
    ShaclShape.prototype.getShaclTarget = function (mainObject) {
        switch (mainObject) {
            case 'gbfsvcb:Station': {
                return '<https://w3id.org/gbfs/station>';
                break;
            }
            case 'gbfsvcb:Bike': {
                return '<https://w3id.org/gbfs/bike>';
                break;
            }
            case 'gbfsvcb:Alert': {
                return '<https://w3id.org/gbfs/alert>';
                break;
            }
            case 'gbfsvcb:Region': {
                return '<https://w3id.org/gbfs/region>';
                break;
            }
            case 'gbfsvcb:VehicleType': {
                return '<https://w3id.org/gbfs/vehicleType>';
                break;
            }
            case 'gbfsvcb:PricingPlan': {
                return '<https://w3id.org/gbfs/pricingPlan>';
                break;
            }
            case 'gbfsvcb:Version': {
                return '<https://w3id.org/gbfs/version>';
                break;
            }
            case 'gbfsvcb:Calendar': {
                return '<https://w3id.org/gbfs/calendar>';
                break;
            }
            case 'gbfsvcb:Feed': {
                return '<https://w3id.org/gbfs/feed>';
                break;
            }
            default: {
                //statements; 
                break;
            }
        }
    };
    ShaclShape.prototype.getShaclRoot = function () {
        return this.shaclFileText = this.shaclRoot + ' a sh:NodeShape; \n';
    };
    ShaclShape.prototype.isRequired = function (prop) {
        if (this.requiredProperties.has(prop)) {
            return true;
        }
        else {
            return false;
        }
    };
    return ShaclShape;
}());
exports.ShaclShape = ShaclShape;
