import {Configuration}  from './Configuration';
import {RDFVocabulary} from './rdfVocabulary';
import {ShaclShape} from './shaclShape';
//import {ShaclShape} from './shaclShape';



const files: string[] = ['./files/station_information.json', './files/free_bike_status.json', './files/system_alerts.json'];
const objects: string[] = ['gbfsvcb:Station', 'gbfsvcb:Bike', 'gbfsvcb:Alert'];

let i = 0;
for (const obj of objects){

    const config = new Configuration(files[i]);
    i +=1;
    const rdfVocab = new RDFVocabulary(config.getTermMapping(), config.getJsonSource(), obj);
    
    console.log(config.getVocabURI());
    rdfVocab.parseBasicsToQuads();
    rdfVocab.parseMainObjectPropertiesToQuads();
}

// Create a configuration object that will take care of preprocessing






// Create a shaclShape object
// Create an RDFVocab object
