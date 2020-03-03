import * as Locale from "../locale/LocaleMain.json";
import {AttributeType} from "../components/AttributeType";
import {Cardinality} from "../components/Cardinality";
import * as joint from 'jointjs';

export var graph = new joint.dia.Graph;
export var selectedCell: string = "";


// language code : language name
export var Languages: {[key:string]: string} = {};

export var ProjectSettings: {[key: string]: any} = {
    name: {},
    description: {}
};

//display:
//1 - namespace:name
//2 - rdfs:label
export var ViewSettings: {[key:string]: any} = {
    display: 2
};

export var StereotypeCategories: string[] = [
];

//labels
//prefix
//suffix
//category
export var Stereotypes: {[key:string]: any} = {

};

export var Links: {[key:string]: any} = {

};


//name : address
export var Namespaces: {[key:string]: any} = {

};

export var Diagrams: {[key:string]: any} = {
    "Untitled": {}
};

export var AttributeTypePool = [
    new AttributeType("String", "http://www.w3.org/2001/XMLSchema#string","http://www.w3.org/2001/XMLSchema#string", false),
    new AttributeType("Integer", "http://www.w3.org/2001/XMLSchema#int","http://www.w3.org/2001/XMLSchema#int", false),
    new AttributeType("Boolean", "http://www.w3.org/2001/XMLSchema#boolean", "http://www.w3.org/2001/XMLSchema#boolean",false),
    new AttributeType("Float", "http://www.w3.org/2001/XMLSchema#float", "http://www.w3.org/2001/XMLSchema#float",false),
    new AttributeType("DateTime", "http://www.w3.org/2001/XMLSchema#dateTime", "http://www.w3.org/2001/XMLSchema#dateTime",false)
];

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
export var MandatoryAttributePool: {[key:string]: any} = {"&*": []};
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