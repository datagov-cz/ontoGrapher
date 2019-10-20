import {CardinalityPool, LanguagePool} from "./Variables";
import {LinkPool} from "./LinkVariables";

export var Defaults = {
    selectedLink: Object.keys(LinkPool)[0],
    cardinality: CardinalityPool[0],
    language: Object.keys(LanguagePool)[0],
    stereotypeUrl: "http://onto.fel.cvut.cz/ontologies/ufo-a/current/ontology.ttl",
    typeIRI: "http://www.w3.org/2002/07/owl#Class",
    offset: {x: 0, y: 0},
    defaultVocabularies: DefaultVocabularies
};

export var DefaultVocabularies = [
    {
        name: "VS-GOV",
        endpoint: "https://slovník.gov.cz/sparql",
        language: "cs",
        typeIRI: "http://www.w3.org/2004/02/skos/core#inScheme",
        sourceIRI: "https://slovník.gov.cz/základní/glosář",
        labelIRI: "http://www.w3.org/2004/02/skos/core#prefLabel",
        definitionIRI: "http://www.w3.org/2004/02/skos/core#definition",
        stereotypeIRI: ["https://slovník.gov.cz/základní/pojem/typ-objektu","https://slovník.gov.cz/základní/pojem/typ-události","https://slovník.gov.cz/základní/pojem/typ-vlastnosti"],
        relationshipIRI: ["https://slovník.gov.cz/základní/pojem/typ-vztahu"],
        attributeIRI: []
    },
];

