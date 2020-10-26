import * as Locale from "../locale/LocaleMain.json";
import {Cardinality} from "../datatypes/Cardinality";
import {PackageNode} from "../datatypes/PackageNode";
import {initLanguageObject} from "../function/FunctionEditVars";
import {RestrictionObject} from "../datatypes/RestrictionObject";
import {ConnectionObject} from "../datatypes/ConnectionObject";
import {Representation} from "./Enum";

// language code : language label
export var Languages: { [key: string]: string } = {};

export var ProjectElements: {
    [key: string]: {
        //iri pointing to VocabularyElements
        iri: string,
        //array of ProjectLink ids
        connections: string[],
        //diagram indexes in which elem is present/hidden
        diagrams: number[],
        //if hidden in diagram index
        hidden: { [key: number]: boolean }
        //position on graph by diagram index
        position: { [key: number]: { x: number, y: number } };
        //if usable in graph
        active: boolean;
        //package
        package: PackageNode;
    }
} = {};

export var ProjectLinks: {
    [key: string]: {
        //iri pointing to VocabularyElements/Links
        iri: string,
        //source ProjectElements id
        source: string,
        //target ProjectElements id
        target: string,
        //source cardinality Cardinality object
        sourceCardinality: Cardinality,
        //target cardinality Cardinality object
        targetCardinality: Cardinality,
        //vertices - point breaks of link
        vertices: joint.dia.Link.Vertex[],
        //type - dictates saving/loading behaviour
        type: number,
        //active
        active: boolean
    }
} = {};

export var Schemes: {
    [key: string]: {
        labels: { [key: string]: string },
        readOnly: boolean,
        graph: string,
        color: string,
        letter: string,
    }
} = {};

export var Prefixes: { [key: string]: string } = {
    skos: "http://www.w3.org/2004/02/skos/core#",
    ex: "http://example.com/ontoGrapher/",
    owl: "http://www.w3.org/2002/07/owl#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    og: "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/",
    "d-sgov-pracovní-prostor-pojem": "https://slovník.gov.cz/datový/pracovní-prostor/pojem/",
    "z-sgov-pojem": "https://slovník.gov.cz/základní/pojem/",
    "v-sgov-pojem": "https://slovník.gov.cz/veřejný-sektor/pojem/"
};

export var PackageRoot: PackageNode = new PackageNode(initLanguageObject("Root"), undefined, true, "");

export var VocabularyElements: {
    [key: string]:
        {
            labels: { [key: string]: string },
            definitions: { [key: string]: string },
            inScheme: string,
            domain: string | undefined,
            range: string | undefined,
            types: string[],
            subClassOf: string[],
            restrictions: RestrictionObject[],
            connections: ConnectionObject[],
            active: boolean,
            topConcept: string | undefined
        }
} = {};

export var Links: {
    [key: string]: {
        labels: { [key: string]: string },
        definitions: { [key: string]: string },
        inScheme: string,
        type: number,
        domain: string;
        range: string;
        typesDomain: string[],
        subClassOfDomain: string[]
        typesRange: string[],
        subClassOfRange: string[]
    }
} = {};

export var Stereotypes: {
    [key: string]: {
        labels: { [key: string]: string },
        definitions: { [key: string]: string },
        inScheme: string,
        types: string[],
        subClassOf: string[],
        character: string | undefined,
    }
} = {};

export var Diagrams: { name: string, json: any, active: boolean }[] = [
    {name: "Untitled", json: {}, active: true}
];

export var ProjectSettings: {
    name: { [key: string]: string },
    description: { [key: string]: string },
    selectedDiagram: number,
    selectedLanguage: string,
    contextIRI: string,
    contextEndpoint: string,
    ontographerContext: string,
    initialized: boolean,
    representation: number,
    lastUpdate: { func: Function, args: [] },
    switchElements: string[],
    viewStereotypes: boolean,
    viewZoom: number
} = {
    name: {},
    description: {},
    selectedDiagram: 0,
    selectedLanguage: Object.keys(Languages)[0],
    contextIRI: "",
    contextEndpoint: "",
    ontographerContext: "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher",
    initialized: false,
    representation: Representation.FULL,
    lastUpdate: {
        func: function () {
        }, args: []
    },
    switchElements: [],
    viewStereotypes: true,
    viewZoom: 1
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
