import {Configuration}  from './Configuration';
import {RDFVocabulary} from './rdfVocabulary';
import {ShaclShape} from './shaclShape';
//import {ShaclShape} from './shaclShape';



let files: Array<string> = ['./files/station_information.json', './files/free_bike_status.json', './files/system_alerts.json'];
let objects: Array<string> = ['gbfsvcb:Station', 'gbfsvcb:Bike', 'gbfsvcb:Alert'];

let i = 0;
for (let obj in objects){

    const config = new Configuration(files[i]);
    i++;
    const rdfVocab = new RDFVocabulary(config.getTermMapping(), config.getJsonSource(), obj);
    
    console.log(config.getVocabURI());
    rdfVocab.parseBasicsToQuads();
    rdfVocab.parseMainObjectPropertiesToQuads();
}

// Create a configuration object that will take care of preprocessing






// Create a shaclShape object
// Create an RDFVocab object
