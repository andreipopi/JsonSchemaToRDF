"use strict";
// We would need to define different shapes for different jsons
exports.__esModule = true;
exports.ShaclTools = void 0;
var ShaclTools = /** @class */ (function () {
    function ShaclTools() {
    }
    ShaclTools.initialise = function (filename, mainObj) {
        this.fileName = filename;
        this.shaclFileText = ""; // reset in case there are more schemas
        this.targetClass = ShaclTools.getShaclTarget(mainObj);
        this.shaclRoot = this.config.shaclRoot;
        // Create a ShaclShape object and insert the first entries
        this.shaclFileText = this.shaclFileText + ShaclTools.shapeShaclRoot(this.shaclRoot);
        this.shaclFileText = this.shaclFileText + 'sh:targetClass ' + this.targetClass + '; \n';
    };
    ShaclTools.writeShacl = function () {
        // Write the Shacl shape on file
        var filePath = ("build/" + this.fileName + "shacl.ttl").replace(/:/g, '');
        this.fs.writeFileSync(filePath, this.shaclFileText, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    ShaclTools.getRequiredProperties = function () {
        return this.requiredProperties;
    };
    ShaclTools.addRequiredTerms = function (termList) {
        this.requiredProperties = this.requiredProperties + termList;
    };
    ShaclTools.isRequired = function (term) {
        if (this.requiredProperties.includes(term) != false) {
            return term;
        }
        else {
            return false;
        }
    };
    // Methodscompile(mySchema, 'MySchema')
    ShaclTools.getShaclTarget = function (mainObject) {
        for (var _i = 0, _a = Object.entries(this.config.shaclTargets); _i < _a.length; _i++) {
            var entry = _a[_i];
            //for(let entry of Array.from(this.config.shaclTargets.entries())){
            console.log("entry", entry);
            var key = entry[0];
            var value = entry[1];
            if (key == mainObject) {
                return this.config.shaclTargets[key];
            }
        }
    };
    ShaclTools.addToShape = function (prop) {
        this.shaclFileText = this.shaclFileText + prop;
    };
    ShaclTools.getShaclTypedProperty = function (nome, type) {
        var prop = 'sh:property [ \n sh:path <' + nome + '>; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    ShaclTools.getShaclTypedRequiredProperty = function (nome, type) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path <' + nome + '>;  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ]; \n';
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
    ShaclTools.shapeShaclRoot = function (root) {
        return this.shaclFileText = root + ' a sh:NodeShape; \n';
    };
    //static config = require('./configs/config-smartdatamodel.json');
    ShaclTools.config = require('./configs/config-gbfs.json');
    ShaclTools.shaclFileText = '';
    ShaclTools.fs = require('fs');
    ShaclTools.requiredProperties = [];
    return ShaclTools;
}());
exports.ShaclTools = ShaclTools;
