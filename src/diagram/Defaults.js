import {CardinalityPool, LanguagePool} from "../config/Variables";
import {LinkPool} from "../config/LinkVariables";

export var Defaults = {
    selectedLink: Object.keys(LinkPool)[0],
    cardinality: CardinalityPool[0],
    language: Object.keys(LanguagePool)[0],
    stereotypeUrl: "http://onto.fel.cvut.cz/ontologies/ufo-a/current/ontology.ttl",
    offset: {x: 0, y: 0},
    endpoint: "https://slovník.gov.cz/sparql",
    typeIRI: "http://www.w3.org/2004/02/skos/core#inScheme",
    sourceIRI: "https://slovník.gov.cz/základní/glosář",
    stereotypeIRI: ["https://slovník.gov.cz/základní/pojem/typ-objektu","https://slovník.gov.cz/základní/pojem/typ-události","https://slovník.gov.cz/základní/pojem/typ-vlastnosti"],
    relationshipIRI: ["https://slovník.gov.cz/základní/pojem/typ-vztahu"],
    attributeIRI: []
};