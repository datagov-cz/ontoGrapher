import {Locale} from "./Locale";

export var StereotypePool = {
    "http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-mixin": "Anti Rigid Mixin",
    "http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-sortal": "Anti Rigid Sortal",
    "http://onto.fel.cvut.cz/ontologies/ufo/category": "Category",
    "http://onto.fel.cvut.cz/ontologies/ufo/collective": "Collective",
    "http://onto.fel.cvut.cz/ontologies/ufo/endurant": "Endurant"
};

export var LanguagePool = {
    cs: "Čeština",
    en: "English"
};

export var AttributeTypePool = [
    "String",
    "Long",
    "Integer",
    "Boolean"
];

export var CardinalityPool = [
    "*",
    "0",
    "0..*",
    "0..1",
    "1",
    "1..",
    "1..*"
];

CardinalityPool.unshift(Locale.none);

export var GeneralizationPool = {};