import {Configuration}  from './Configuration';
import {RDFVocabulary} from './rdfVocabulary';
import { ShaclShape } from './shaclShape';
//import {ShaclShape} from './shaclShape';

// Create a configuration object that will take care of preprocessing
const config = new Configuration();
const rdfVocab = new RDFVocabulary(config.getTermMapping(), config.getJsonSource());

console.log(config.getVocabURI());

rdfVocab.parseBasicsToQuads();
rdfVocab.parseMainObjectPropertiesToQuads();

const shape = new ShaclShape(rdfVocab.getRequiredProperties(),config.getJsonSource());
shape.writeConstraints();
shape.writeTargetClass();
// Create a shaclShape object
// Create an RDFVocab object
