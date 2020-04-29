import * as Locale from "../locale/LocaleMain.json";
import {Cardinality} from "../datatypes/Cardinality";
import {PackageNode} from "../datatypes/PackageNode";
import {parsePrefix} from "../function/FunctionEditVars";
import {AttributeObject} from "../datatypes/AttributeObject";
import {AttributeType} from "../datatypes/AttributeType";


//TODO: create default package on new project call
//TODO: separate modals from items
//TODO: retry button for fetch
//TODO: redo/scrap addDomainOfIRIs
//TODO: collapse canvas onDrop function
//TODO: decouple cellTools
//TODO: ts-nocheck on canvas
//TODO: test saving, loading


// language code : language labels
export var Languages: { [key: string]: string } = {};

export var ProjectElements: {
    [key: string]: {
        //iri pointing to VocabularyElements
        iri: string,
        //array of ProjectLink ids
        connections: string[],
        //whether the labels are initialized
        untitled: boolean,
        //AttributeObject array
        attributes: AttributeObject[],
        //if present in diagram index
        diagrams: boolean[],
        //property array
        properties: AttributeObject[],
        //if hidden in diagram index
        hidden: { [key: number]: boolean }
    }
} = {};

export var ProjectLinks: {
    [key: string]: {
        //iri pointing to VocabularyElements
        iri: string,
        //source ProjectElements id
        source: string,
        //target ProjectElements id
        target: string,
        //source cardinality Cardinality object
        sourceCardinality: Cardinality,
        //target cardinality Cardinality object
        targetCardinality: Cardinality,
        //diagram index
        diagram: number,
        //vertices
        vertices: joint.dia.Link.Vertex[] | undefined;
    }
} = {};

export var Schemes: {
    [key: string]: {
        labels: { [key: string]: string },
        readOnly: boolean,
    }
} = {};

export var Prefixes: { [key: string]: string } = {
    skos: "http://www.w3.org/2004/02/skos/core#",
    ex: "http://example.com/ontoGrapher/",
    owl: "http://www.w3.org/2002/07/owl#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    "z-sgov-pojem": "https://slovník.gov.cz/základní/pojem/"
};

export var Structures: { [key: string]: string } = {
    "z-sgov-pojem:základní-struktura": parsePrefix("z-sgov-pojem", "základní-struktura"),
    "z-sgov-pojem:legislativní-struktura": parsePrefix("z-sgov-pojem", "legislativní-struktura"),
    "z-sgov-pojem:agendová-struktura": parsePrefix("z-sgov-pojem", "agendová-struktura"),
    "z-sgov-pojem:datová-struktura": parsePrefix("z-sgov-pojem", "datová-struktura")
};

export var structuresShort: { [key: string]: string } = {
    "z-sgov-pojem:základní-struktura": "základní",
    "z-sgov-pojem:legislativní-struktura": "legislativní",
    "z-sgov-pojem:agendová-struktura": "agendová",
    "z-sgov-pojem:datová-struktura": "datová"
};

export var PackageRoot: PackageNode = new PackageNode("Root", undefined, true, "");

export var VocabularyElements: {
    [key: string]:
        {
            labels: { [key: string]: string },
            definitions: { [key: string]: string },
            inScheme: string,
            domain: string | undefined,
               range: string | undefined,
            types: string[],
            domainOf: string[],
        }
} = {};

export var Links: {
    [key: string]: {
        labels: { [key: string]: string },
        definitions: { [key: string]: string },
        inScheme: string,
    }
} = {};


export var Stereotypes: {
    [key: string]: {
        labels: { [key: string]: string },
        descriptions: { [key: string]: string },
        inScheme: string,
    }
} = {};

export var Diagrams: { name: string, json: any }[] = [
    {name: "Untitled", json: ""}
];

export var ProjectSettings: {
    name: { [key: string]: string },
    description: { [key: string]: string },
    selectedDiagram: number,
    selectedPackage: PackageNode,
    knowledgeStructure: string,
    selectedLanguage: string,
    selectedLink: string,
    status: string
} = {
    name: {},
    description: {},
    selectedDiagram: 0,
    selectedPackage: PackageRoot,
    knowledgeStructure: Object.keys(Structures)[0],
    selectedLanguage: Object.keys(Languages)[0],
    selectedLink: Object.keys(Links)[0],
    status: ""
};
export var AttributeTypePool: { [key: string]: { name: string, array: boolean } } = {
    "http://www.w3.org/2001/XMLSchema#string": {name: "String", array: false},
    "http://www.w3.org/2001/XMLSchema#int": {name: "Integer", array: false},
    "http://www.w3.org/2001/XMLSchema#boolean": {name: "Boolean", array: false},
    "http://www.w3.org/2001/XMLSchema#float": {name: "Float", array: false},
    "http://www.w3.org/2001/XMLSchema#dateTime": {name: "DateTime", array: false}
};

export var CardinalityPool: Cardinality[] = [
    new Cardinality(Locale.none, Locale.none),
    new Cardinality("*", "*"),
    new Cardinality("0", "0"),
    new Cardinality("0", "*"),
    new Cardinality("0", "1"),
    new Cardinality("1", "1"),
    new Cardinality("1", "*"),
];

export var PropertyPool: { [key: string]: AttributeType[] } = {};
