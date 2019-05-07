import {Locale} from "./Locale";

// Represents the pool of available stereotypes.
// Key: RDF source of the stereotype.
// Value: Name of the stereotype.

export var StereotypePool = {
    "http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-mixin": "Anti Rigid Mixin",
    "http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-sortal": "Anti Rigid Sortal",
    "http://onto.fel.cvut.cz/ontologies/ufo/category": "Category",
    "http://onto.fel.cvut.cz/ontologies/ufo/collective": "Collective",
    "http://onto.fel.cvut.cz/ontologies/ufo/endurant": "Endurant"
};

// Represents the pool of available languages.
// Key: Code of the language.
// Value: Name of the language.

export var LanguagePool = {
    cs: "Čeština",
    en: "English"
};

// Represents the pool of available attribute types.

export var AttributeTypePool = [
    "String",
    "Long",
    "Integer",
    "Boolean"
];

// Represents the pool of available cardinalities.

export var CardinalityPool = [
    "*",
    "0",
    "0..*",
    "0..1",
    "1",
    "1..",
    "1..*"
];

//Do not delete!
CardinalityPool.unshift(Locale.none);
export var GeneralizationPool = {};