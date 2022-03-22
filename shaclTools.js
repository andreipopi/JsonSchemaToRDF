"use strict";
// We would need to define different shapes for different jsons
exports.__esModule = true;
exports.ShaclTools = void 0;
var ShaclTools = /** @class */ (function () {
    function ShaclTools() {
    }
    ShaclTools.initialise = function (filename, mainObj) {
        this.fileName = filename;
    };
    ShaclTools.writeShacl = function (filename, shaclFileText) {
        // Write the Shacl shape on file
        this.fs.writeFileSync("build/" + filename + "shacl.ttl", shaclFileText, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    // Methodscompile(mySchema, 'MySchema')
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
    ShaclTools.shapeShaclRoot = function (root) {
        return this.shaclFileText = root + ' a sh:NodeShape; \n';
    };
    //static config = require('./configs/config-smartdatamodel.json');
    ShaclTools.config = require('./configs/config-gbfs.json');
    ShaclTools.shaclFileText = '';
    ShaclTools.fs = require('fs');
    return ShaclTools;
}());
exports.ShaclTools = ShaclTools;
