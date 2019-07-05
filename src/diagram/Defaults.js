import {CardinalityPool, LanguagePool} from "../config/Variables";
import {LinkPool} from "../config/LinkVariables";

export var Defaults = {
    selectedLink: Object.keys(LinkPool)[0],
    cardinality: CardinalityPool[0],
    language: Object.keys(LanguagePool)[0],
    stereotypeUrl: "http://onto.fel.cvut.cz/ontologies/ufo-a/current/ontology.ttl",
    offset: {x: 0, y: 0}
};