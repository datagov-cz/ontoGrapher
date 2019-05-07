import {Locale} from "./Locale";

// LinkEnd, Labeled, Dashed, OCL Constraints

// Represents the pool of available relationship types.

// Key: relationship name
// Value[0]: Tip from LinkEndPool
// Value[1]: Whether the relationship should have its name as a label.
//           For example, a "Characterization" relationship could have a "«characterization»" label.
// Value[2]: Whether the relationship line should be dashed.
// Value[3]: Array of OCL Constraints.
//           Constraints are objects created with 'new Constraint(statement, linkType)',
//           where 'statement' is the OCL statement and 'linkType' is the name of the link
//           that the statement belongs to.

export var LinkPool = {
    "Characterization": ["Empty", true, false, []],
    "Component": ["FilledEmptyDiamond", false, false, []],
    "Derivation": ["Empty", false, true, []],
    "Formal": ["Empty", true, false, []],
    "Material": ["Empty", true, false, []],
    "Mediation": ["Empty", true, false, []],
    "Member": ["FilledMDiamond", true, false, []],
    "SubCollection": ["FilledCDiamond", true, false, []],
    "SubQuantity": ["FilledQDiamond", true, false, []]
};

// Do not delete!
LinkPool[Locale.generalization] = ["UnfilledArrow", false, false, []];



// Defines the tips of various relationships.
// For example, the UnfilledArrow type represents an arrow that has no text inside it and is not filled.
// A tip can have four points.

// xy1: top point
// xy2: right point
// xy3: bottom point
// xy4: left point
// text: text in the center of the tip
// fill: whether the

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