import * as Locale from "../locale/LocaleMain.json";
import {AttributeType} from "../components/AttributeType";
import {Cardinality} from "../components/Cardinality";
import * as joint from 'jointjs';
import {PackageNode} from "../components/PackageNode";
import {addLink} from "../misc/Helper";

export var graph = new joint.dia.Graph;

export var selectedDiagram: string = "";


// language code : language name
export var Languages: {[key:string]: string} = {};



//names
//iri
//connections
//descriptions
//attributes
//package
//diagrams
//hidden
//active
//properties
export var ProjectElements: {[key:string]: any} = {};

//sourceCard
//targetCard
//iri
//diagram
//source
//target
//description
export var ProjectLinks:{[key:string]: any} = {};

//display:
//1 - namespace:name
//2 - rdfs:label
export var ViewSettings: {[key:string]: any} = {
    display: 2
};

export var StereotypeCategories: string[] = [
];

export var ModelCategories: string[] = [];
// export var PackageCategories: {[key:string]: any} = {
//     0: {name: "Root", contents:{}}
// };

export var currentBuildDate = "build 18 March";

export var PackageRoot: PackageNode = new PackageNode("Root", undefined, true);
//labels
//prefix
//suffix
//category
export var Stereotypes: {[key:string]: any} = {

};

export var ModelElements:{[key:string]: any} = {};

export var Links: {[key:string]: any} = {

};


//name : address
export var Namespaces: {[key:string]: any} = {

};

export var Diagrams: {[key:string]: any}[] = [
    {name: "Untitled", json: ""}
];
export var ProjectSettings: {[key: string]: any} = {
    name: {},
    description: {},
    selectedDiagram: 0
};
export var AttributeTypePool: {[key:string]: any} = {
    "http://www.w3.org/2001/XMLSchema#string": {name:"String", array: false},
    "http://www.w3.org/2001/XMLSchema#int":{name:"Integer", array: false},
    "http://www.w3.org/2001/XMLSchema#boolean":{name:"Boolean", array: false},
    "http://www.w3.org/2001/XMLSchema#float":{name:"Float", array: false},
    "http://www.w3.org/2001/XMLSchema#dateTime":{name:"DateTime", array: false}
};
//     new AttributeType("String", "http://www.w3.org/2001/XMLSchema#string","http://www.w3.org/2001/XMLSchema#string", false),
//     new AttributeType("Integer", "http://www.w3.org/2001/XMLSchema#int","http://www.w3.org/2001/XMLSchema#int", false),
//     new AttributeType("Boolean", "http://www.w3.org/2001/XMLSchema#boolean", "http://www.w3.org/2001/XMLSchema#boolean",false),
//     new AttributeType("Float", "http://www.w3.org/2001/XMLSchema#float", "http://www.w3.org/2001/XMLSchema#float",false),
//     new AttributeType("DateTime", "http://www.w3.org/2001/XMLSchema#dateTime", "http://www.w3.org/2001/XMLSchema#dateTime",false)
// ];

export var CardinalityPool = [
    new Cardinality("*", "*"),
    new Cardinality("0", "0"),
    new Cardinality("0", "*"),
    new Cardinality("0", "1"),
    new Cardinality("1", "1"),
    new Cardinality("1", "*"),
];

CardinalityPool.unshift(new Cardinality(Locale.none, Locale.none));
export var GeneralizationPool: {[key:string]: any} = {

};
export var VocabularyPool = [];
export var Packages: {[key:string]: any} = {

};
Packages[Locale.root] = false;
export var PropertyPool: {[key:string]: any} = {"&*": [], "Manual": []};
export var Models: {[key:string]: any} = {

};
Models[Locale.untitled] = "";
export var LinkPool: {[key:string]: any} = {

};
export var LinkPoolPackage: {[key:string]: any} = {

};
export var StereotypePoolPackage: {[key:string]: any} = {

};

export var ClassPackage: {[key:string]: any} = {

};
export var HiddenRelationships: {[key:string]: any} = {

};
export var HiddenInstances: {[key:string]: any} = {

};
export var DetailPanelInstances: {[key:string]: any} = {

};
ClassPackage[Locale.root] = [];