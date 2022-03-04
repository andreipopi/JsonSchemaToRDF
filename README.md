# JSON Schema to RDF

According to Linked-Data best practices, RDF vocabularies and Shacl shapes are desiderata.
This is a component tailored to the current GBFS specification and its json schema structure.
It transforms GBFS Json schemas into corresponding RDF vocabularies and Shacl shapes.

## How to use

 * Fork on your machine. 
 * Install dependencies using `npm install`
 * Build the typescript using `npm run build`
 * Run by `node main.js`


<!--

## Program flow
* the `files` folder contains GBFS json schemas.
* the `build` folder contains the vocabularies and shapes generated by the component.
* foreach json schema in `files`, `main.ts`instantiates `rdfVocabulary.ts`to create the equivalent vocabulary and shape.
* `rdfVocabulary.ts`is responsible for creating both the vocabulary and shapes.
* `rdfVocabulary.ts` uses `shaclShape.ts` to initialize the basics of the shape such as the target class, and to get the corresponding property shapes.

 <img src="images/pseudocode.png" width="500"> -->
 
## Useful links
 * mobility data bike sharing system json schemas: https://github.com/MobilityData/gbfs-json-schema

## Author
Andrei Popescu <andrei.popescu@ugent.be>

## Future Work
* Main challenge: How to be fully general with respect to the Json Schema Specification? https://json-schema.org/draft/ 2020-12/json-schema-core.html


 

