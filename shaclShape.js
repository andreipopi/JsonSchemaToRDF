"use strict";
// We would need to define different shapes for different jsons
exports.__esModule = true;
exports.ShaclShape = void 0;
var ShaclShape = /** @class */ (function () {
    // Constructors
    function ShaclShape(required, source) {
        this.targetClass = 'https://w3id.org/gbfs/station';
        this.requiredProperties = new Map();
        this.jsonSchema = require(source);
        this.requiredProperties = required;
    }
    // Methods
    ShaclShape.prototype.writeConstraints = function () {
        var fs = require('fs');
        var textFile = '';
        var i = 0;
        for (var _i = 0, _a = Array.from(this.requiredProperties.entries()); _i < _a.length; _i++) {
            var entry = _a[_i];
            console.log(entry);
            console.log("required", entry[0]);
            var type = this.jsonSchema.properties.data.properties.stations.items.properties[entry[0]].type;
            console.log("shacl entry", (this.mustHaveProperty(entry[1], type)).toString());
            console.log("textfile", textFile);
            textFile = textFile + (this.mustHaveProperty(entry[1], type)).toString() + '\n';
            console.log("textfile after", textFile);
            i++;
        }
        fs.writeFileSync("shacl.ttl", textFile, function (err) {
            if (err) {
                return console.log("error");
            }
        });
    };
    ShaclShape.prototype.mustHaveProperty = function (nome, type) {
        console.log(nome);
        var prop = 'sh:property [ \n sh:path ' + nome + ';  \n sh:minCount 1; \n sh:maxCount 1; \n sh:datatype ' + type + '; \n ];';
        return prop;
    };
    return ShaclShape;
}());
exports.ShaclShape = ShaclShape;
