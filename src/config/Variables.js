import {Locale} from "./Locale";
import {Cardinality} from "../components/misc/Cardinality";
import * as Helper from "../misc/Helper";

// Represents the pool of available stereotypes.
// Key: IRI source of the stereotype.
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
// Should always be a string of:
// - a star ("*"),
// - a positive integer ("123"),
// - a positive integer and another positive integer ("2..3"), such that the second number is greater than the first,
// - a positive integer and a star ("2..*").
// In the last two cases, the two elements must always be separated by two dots.

// export var CardinalityPool = [
//     "*",
//     "0",
//     "0..*",
//     "0..1",
//     "1",
//     "1..*"
// ];

export var CardinalityPool = [
    new Cardinality("*","*"),
    new Cardinality("0","0"),
    new Cardinality("0","*"),
    new Cardinality("0","1"),
    new Cardinality("1","1"),
    new Cardinality("1","*"),
];

//Do not delete!
CardinalityPool.unshift(new Cardinality(Locale.none,Locale.none));
export var GeneralizationPool = {};