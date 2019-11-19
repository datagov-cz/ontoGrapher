import {CardinalityPool, LanguagePool, LinkPool} from "./Variables";

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
    defaultVocabularies: "https://raw.githubusercontent.com/bindetad/ontoGrapher/test/Vocabularies.json"
};