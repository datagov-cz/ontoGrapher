import {CardinalityPool, LanguagePool} from "./Variables";
import {LinkPool} from "./LinkVariables";

export var Defaults = {
    selectedLink: Object.keys(LinkPool)[0],
    cardinality: CardinalityPool[0],
    language: Object.keys(LanguagePool)[0],
    stereotypeUrl: "http://onto.fel.cvut.cz/ontologies/ufo-a/current/ontology.ttl",
    stereotypeLanguage: "en",
    offset: {x: 0, y: 0}
};