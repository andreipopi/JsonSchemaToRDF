import {Configuration}  from './Configuration';
import {RDFVocabulary} from './rdfVocabulary';
import {ShaclShape} from './shaclShape';

//import {ShaclShape} from './shaclShape';
const files: string[] = ['./files/station_information.json', './files/free_bike_status.json', './files/system_alerts.json'];
const objects: string[] = ['gbfsvcb:Station', 'gbfsvcb:Bike', 'gbfsvcb:Alert'];
const  fs = require('fs');

let i = 0;
for (const obj of objects){
    const config = new Configuration(files[i]);
    i +=1;
    const rdfVocab = new RDFVocabulary(config.getTermMapping(), config.getJsonSource(), obj);
    console.log(config.getVocabURI());
    rdfVocab.parseBasicsToQuads();
    rdfVocab.parseMainObjectPropertiesToQuads();
}

/**
 * Creating the json-ld context: hard-coded since common to all files. A static solution could be found.
 */
const config = new Configuration(files[0]);
const rdfVocab = new RDFVocabulary(config.getTermMapping(), config.getJsonSource(), objects[0]);
const prefixes:Map<string, string> = rdfVocab.getPrefixes().prefixes;
const mapping:Map<string, string> = config.getTermMapping();
//const size=  Object.keys(prefixes).length;
let context = `{ \n \t "@context": { \n \t`;
for(const prefix in prefixes){
    //if( prefix != Array.from(Object.keys(prefixes))[size-1])
    context += `\t \t "${prefix}": `+`"${prefixes[prefix]}"`+`, \n`;
};
for(const [key, value] of Array.from(mapping.entries())){
    if (key != Array.from(mapping.keys()).pop()){
        context += `\t \t "${key}": `+`"${value}"`+`, \n`;
    }
    else{
        context += `\t \t "${key}": `+`"${value}"`+`\n`;
    }
};
context += `\n  \t } \n }`;
// Write the Shacl shape on file
fs.writeFileSync(`build/ldContext.json`, context , function(err){
    if(err){
        return console.log("error");
    }
});