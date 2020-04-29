import * as Locale from "../locale/LocaleMain.json";
import {Cardinality} from "../components/Cardinality";
import * as joint from 'jointjs';
import {PackageNode} from "../components/PackageNode";
import {parsePrefix} from "../function/Helper";

export var graph = new joint.dia.Graph();

export var loading = {
    loaded: 0,
    load: 0
};


// language code : language name
export var Languages: {[key:string]: string} = {};



//names: {}
//iriElem: string
//connections: []
//definitions: {}
//attributes: {}
//package: string
//diagrams: []
//hidden: boolean
//active: boolean
//properties: {}
//untitled: boolean
export var ProjectElements: {[key:string]: any} = {};

//sourceCard
//targetCard
//iriElem
//diagram
//source
//target
//definitions
export var ProjectLinks:{[key:string]: any} = {};

//display:
//1 - namespace:name
//2 - rdfs:label
export var ViewSettings: {[key:string]: any} = {
    display: 2
};



export var StereotypeCategories: string[] = [
];

export var Schemes: {[key:string]: any} = {
};

export var Prefixes: {[key:string]: string} = {
    skos: "http://www.w3.org/2004/02/skos/core#",
    ex: "http://example.com/ontoGrapher/",
    owl: "http://www.w3.org/2002/07/owl#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    "z-sgov-pojem": "https://slovník.gov.cz/základní/pojem/"
};

export var structures: {[key:string]: string} = {
    "z-sgov-pojem:základní-struktura": parsePrefix("z-sgov-pojem", "základní-struktura"),
    "z-sgov-pojem:legislativní-struktura": parsePrefix("z-sgov-pojem", "legislativní-struktura"),
    "z-sgov-pojem:agendová-struktura": parsePrefix("z-sgov-pojem", "agendová-struktura"),
    "z-sgov-pojem:datová-struktura": parsePrefix("z-sgov-pojem", "datová-struktura")
};

export var structuresShort: {[key:string]: string} = {
    "z-sgov-pojem:základní-struktura": "základní",
    "z-sgov-pojem:legislativní-struktura": "legislativní",
    "z-sgov-pojem:agendová-struktura": "agendová",
    "z-sgov-pojem:datová-struktura": "datová"
};

export var PackageRoot: PackageNode = new PackageNode("Root", undefined, true, "");

//labels
//category
export var Stereotypes: {[key:string]: any} = {

};

export var ModelElements:{[key:string]: any} = {};

export var VocabularyElements:{[key:string]: any} = {};


export var Links: {[key:string]: any} = {

};


//name : address
export var Namespaces: {[key:string]: any} = {

};

export var Diagrams: {[key:string]: any}[] = [
    {name: "Untitled", json: ""}
];
export var ProjectSettings: {
    name: {[key:string]: string},
    description: {[key:string]: string},
    selectedDiagram: number,
    selectedPackage: PackageNode,
    knowledgeStructure: string
} = {
    name: {},
    description: {},
    selectedDiagram: 0,
    selectedPackage: PackageRoot,
    knowledgeStructure: Object.keys(structures)[0]
};
export var AttributeTypePool: {[key:string]: any} = {
    "http://www.w3.org/2001/XMLSchema#string": {name:"String", array: false},
    "http://www.w3.org/2001/XMLSchema#int":{name:"Integer", array: false},
    "http://www.w3.org/2001/XMLSchema#boolean":{name:"Boolean", array: false},
    "http://www.w3.org/2001/XMLSchema#float":{name:"Float", array: false},
    "http://www.w3.org/2001/XMLSchema#dateTime":{name:"DateTime", array: false}
};

export var CardinalityPool = [
    new Cardinality("*", "*"),
    new Cardinality("0", "0"),
    new Cardinality("0", "*"),
    new Cardinality("0", "1"),
    new Cardinality("1", "1"),
    new Cardinality("1", "*"),
];

CardinalityPool.unshift(new Cardinality(Locale.none, Locale.none));

export var VocabularyPool = [];
export var Packages: {[key:string]: any} = {

};
Packages[Locale.root] = false;
export var PropertyPool: {[key:string]: any} = {"&*": [], "Manual": []};
