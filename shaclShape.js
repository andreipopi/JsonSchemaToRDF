"use strict";
// We would need to define different shapes for different jsons
exports.__esModule = true;
exports.ShaclShape = void 0;
var ShaclShape = /** @class */ (function () {
    // Constructors
    function ShaclShape(required, source) {
        this.shaclRoot = '<https://mymockwebsite.com/shapes/gbfs-station_information>';
        this.requiredProperties = new Map();
        this.shaclFileText = '';
        this.fs = require('fs');
        this.jsonSchema = require(source);
        this.requiredProperties = required;
        this.targetClass = '<https://w3id.org/gbfs/station>';
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
