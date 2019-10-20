import {Locale} from "./locale/Locale";
import {Cardinality} from "../components/misc/Cardinality";
import {DefaultVocabularies} from "./Defaults";

// Represents the pool of available stereotypes.

export var StereotypePool = [];

// Represents the pool of available languages.
// Key: Code of the language.
// Value: Name of the language.

export var LanguagePool = {
    cs: "Čeština",
    en: "English"
};

// Represents the pool of available attribute types.
export var AttributeTypePool = {
    "http://www.w3.org/2001/XMLSchema#string" : "String",
    "http://www.w3.org/2001/XMLSchema#int" : "Integer",
    "http://www.w3.org/2001/XMLSchema#boolean" : "Boolean",
    "http://www.w3.org/2001/XMLSchema#float" : "Float",
    "http://www.w3.org/2001/XMLSchema#dateTime" : "DateTime",
};

// Represents the pool of available cardinalities.
// Should always be a string of:
// - a star ("*"),
// - a positive integer ("123"),
// - a positive integer and another positive integer ("2..3"), such that the second number is greater than the first,
// - a positive integer and a star ("2..*").
// In the last two cases, the two elements must always be separated by two dots.

export var CardinalityPool = [
    new Cardinality("*","*"),
    new Cardinality("0","0"),
    new Cardinality("0","*"),
    new Cardinality("0","1"),
    new Cardinality("1","1"),
    new Cardinality("1","*"),
];

// Do not delete!
CardinalityPool.unshift(new Cardinality(Locale.none,Locale.none));
export var GeneralizationPool = {};
export var VocabularyPool = [];