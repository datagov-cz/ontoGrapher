import {LinkPool} from "./LinkPool";
import {CardinalityPool} from "./CardinalityPool";
import {LanguagePool} from "./LanguagePool";

export var Defaults = {
    selectedLink: Object.keys(LinkPool)[0],
    cardinality: CardinalityPool[0],
    language: Object.keys(LanguagePool)[0]
};