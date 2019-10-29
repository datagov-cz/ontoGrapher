import {CardinalityPool, LanguagePool} from "./Variables";
import {LinkPool} from "./LinkVariables";

export var Defaults = {
    selectedLink: Object.keys(LinkPool)[0],
    cardinality: CardinalityPool[0],
    language: Object.keys(LanguagePool)[0],
    classSourceIRI: "http://onto.fel.cvut.cz/ontologies/ufo-a/current/ontology.ttl",
    classIRI: "http://www.w3.org/2002/07/owl#Class",
    relationshipSourceIRI: "http://onto.fel.cvut.cz/ontologies/ufo-a/current/ontology.ttl",
    relationshipIRI: "http://www.w3.org/2002/07/owl#ObjectProperty",
    sourceLanguage: "en",
    offset: {x: 0, y: 0},
    defaultVocabularies: DefaultVocabularies
};

export var DefaultVocabularies = [
    {
        name: "VS-GOV",
        endpoint: "https://slovník.gov.cz/sparql",
        language: "cs",
        classIRI: "http://www.w3.org/2004/02/skos/core#inScheme",
        sourceIRI: "https://slovník.gov.cz/základní/glosář",
        labelIRI: "http://www.w3.org/2004/02/skos/core#prefLabel",
        definitionIRI: "http://www.w3.org/2004/02/skos/core#definition",
        stereotypeIRI: ["http://www.w3.org/2002/07/owl#Class"],
        relationshipIRI: ["http://www.w3.org/2002/07/owl#ObjectProperty"],
        attributeIRI: []
    },
];

