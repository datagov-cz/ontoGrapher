import {Locale} from "./locale/Locale";
import {Cardinality} from "../components/misc/Cardinality";
import {AttributeType} from "../components/misc/AttributeType";
import {SourceData} from "../components/misc/SourceData";

// Represents the pool of available stereotypes.

export var StereotypePool = [
];

// Represents the pool of available languages.
// Key: Code of the language.
// Value: Name of the language.

export var LanguagePool = {
    cs: "Čeština",
    en: "English"
};

// Represents the pool of available attribute types.

export var AttributeTypePool = [
    new AttributeType("String", "http://www.w3.org/2001/XMLSchema#string","http://www.w3.org/2001/XMLSchema#string", false),
    new AttributeType("Integer", "http://www.w3.org/2001/XMLSchema#int","http://www.w3.org/2001/XMLSchema#int", false),
    new AttributeType("Boolean", "http://www.w3.org/2001/XMLSchema#boolean", "http://www.w3.org/2001/XMLSchema#boolean",false),
    new AttributeType("Float", "http://www.w3.org/2001/XMLSchema#float", "http://www.w3.org/2001/XMLSchema#float",false),
    new AttributeType("DateTime", "http://www.w3.org/2001/XMLSchema#dateTime", "http://www.w3.org/2001/XMLSchema#dateTime",false)
]

// Represents the pool of available cardinalities.
// Should always be a string of:
// - a star ("*"),
// - a positive integer ("123"),
// - a positive integer and another positive integer ("2..3"), such that the second number is greater than the first,
// - a positive integer and a star ("2..*").
// In the last two cases, the two elements must always be separated by two dots.

export var CardinalityPool = [
    new Cardinality("*", "*"),
    new Cardinality("0", "0"),
    new Cardinality("0", "*"),
    new Cardinality("0", "1"),
    new Cardinality("1", "1"),
    new Cardinality("1", "*"),
];

// Do not delete!
CardinalityPool.unshift(new Cardinality(Locale.none, Locale.none));
export var GeneralizationPool = {};
export var VocabularyPool = [];
export var Packages = {};
Packages[Locale.root] = false;
export var MandatoryAttributePool = {"&*": []};
export var Models = {};
Models[Locale.untitled] = "";
export var LinkPool = {};
export var LinkPoolPackage = {};
export var StereotypePoolPackage = {};

export var ClassPackage = {};
export var HiddenRelationships = {};
export var HiddenInstances = {};
export var DetailPanelInstances = {};
ClassPackage[Locale.root] = [];

export var LinkEndPool = {
    "Empty": {
        x1: 0,
        y1: -1,
        x2: 1,
        y2: 0,
        x3: 0,
        y3: 1,
        x4: -1,
        y4: 0,
        text: "",
        fill: true
    },
    "FilledEmptyDiamond": {
        x1: 0,
        y1: -10,
        x2: 12,
        y2: 0,
        x3: 0,
        y3: 10,
        x4: -12,
        y4: 0,
        text: "",
        fill: true
    },
    "UnfilledArrow": {
        x1: -10,
        y1: -8,
        x2: 3,
        y2: 0,
        x3: -10,
        y3: 8,
        x4: -10,
        y4: 8,
        text: "",
        fill: false
    },
    "FilledMDiamond": {
        x1: 0,
        y1: -10,
        x2: 12,
        y2: 0,
        x3: 0,
        y3: 10,
        x4: -12,
        y4: 0,
        text: "M",
        fill: true
    },
    "FilledCDiamond": {
        x1: 0,
        y1: -10,
        x2: 12,
        y2: 0,
        x3: 0,
        y3: 10,
        x4: -12,
        y4: 0,
        text: "C",
        fill: true
    },
    "FilledQDiamond": {
        x1: 0,
        y1: -10,
        x2: 12,
        y2: 0,
        x3: 0,
        y3: 10,
        x4: -12,
        y4: 0,
        text: "Q",
        fill: true
    }
};

// "Characterization": ["Empty", true, false, [], "","",""],
// "Component": ["FilledEmptyDiamond", false, false, [], "","",""],
// "Formal": ["Empty", true, false, [], "","",""],
// "Material": ["Empty", true, false, [], "","",""],
// "Mediation": ["Empty", true, false, [], "","",""],
// "Member": ["FilledMDiamond", true, false, [], "","",""],
// "SubCollection": ["FilledCDiamond", false, false, [], "","",""],
// "SubQuantity": ["FilledQDiamond", false, false, [], "","",""]

// LinkEnd, Labeled, Dashed, OCL Constraints

// Represents the pool of available relationship types.

// Key: relationship name
// Value[0]: Tip from LinkEndPool.
// Value[1]: Whether the relationship should have its name as a label.
//           For example, a "Characterization" relationship could have a "«characterization»" label.
// Value[2]: Whether the relationship line should be dashed.
// Value[3]: Array of OCL Constraints.
//           Constraints are objects created with 'new Constraint(statement, linkType)',
//           where 'statement' is the OCL statement and 'linkType' is the name of the link
//           that the statement belongs to.
// Value[4]: IRI source.
// Value[5]: Relationship description.
// Value[6]: Name of the source.

// LinkPool[Locale.generalization] = ["UnfilledArrow", false, false, [
//     new Constraint("self.getSourceCardinality() = \""+ Locale.none +"\"",Locale.generalization,Locale.constraintGeneralization),
//     new Constraint("self.getTargetCardinality() = \""+ Locale.none +"\"",Locale.generalization,Locale.constraintGeneralization)
// ]];

// Defines the tips of various relationships.
// For example, the UnfilledArrow type represents an arrow that has no text inside it and is not filled.
// A tip can have four points.

// xy1: top point
// xy2: right point
// xy3: bottom point
// xy4: left point
// text: text in the center of the tip
// fill: whether the rectangle is filled or not
