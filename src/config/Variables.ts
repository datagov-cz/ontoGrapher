import { Cardinality } from "../datatypes/Cardinality";
import { PackageNode } from "../datatypes/PackageNode";
import { initLanguageObject } from "../function/FunctionEditVars";
import { Restriction } from "../datatypes/Restriction";
import { Representation } from "./Enum";
import * as joint from "jointjs";
import { Environment } from "./Environment";

// language code : language label
export var Languages: { [key: string]: string } = {};

export var WorkspaceElements: {
  [key: string]: {
    //iri pointing to VocabularyElements
    iri: string;
    //array of ProjectLink ids
    connections: string[];
    //diagram indices in which elem is present/hidden
    diagrams: number[];
    //if hidden in diagram index
    hidden: { [key: number]: boolean };
    //position on graph by diagram index
    position: { [key: number]: { x: number; y: number } };
    //if usable in graph
    active: boolean;
    //package
    package: PackageNode;
    //selected label from pref/altLabels
    selectedLabel: { [key: string]: string };
  };
} = {};

export var WorkspaceLinks: {
  [key: string]: {
    //iri pointing to VocabularyElements/Links
    iri: string;
    //source ProjectElements id
    source: string;
    //target ProjectElements id
    target: string;
    //source cardinality Cardinality object
    sourceCardinality: Cardinality;
    //target cardinality Cardinality object
    targetCardinality: Cardinality;
    //vertices - point breaks of link by diagram
    vertices: { [key: number]: joint.dia.Link.Vertex[] };
    //type - dictates saving/loading behaviour
    type: number;
    //active
    active: boolean;
  };
} = {};

export var WorkspaceVocabularies: {
  [key: string]: {
    labels: { [key: string]: string };
    readOnly: boolean;
    glossary: string;
    count: number;
    namespace: string;
    graph: string;
    color: string;
  };
} = {};

export var Prefixes: { [key: string]: string } = {
  skos: "http://www.w3.org/2004/02/skos/core#",
  owl: "http://www.w3.org/2002/07/owl#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  og: "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  "d-sgov-pracovní-prostor-pojem":
    "https://slovník.gov.cz/datový/pracovní-prostor/pojem/",
  "z-sgov-pojem": "https://slovník.gov.cz/základní/pojem/",
  "v-sgov-pojem": "https://slovník.gov.cz/veřejný-sektor/pojem/",
};

export var PackageRoot: PackageNode = new PackageNode(
  initLanguageObject("Root"),
  undefined,
  true,
  ""
);

export var WorkspaceTerms: {
  [key: string]: {
    labels: { [key: string]: string };
    altLabels: { label: string; language: string }[];
    definitions: { [key: string]: string };
    inScheme: string;
    domain: string | undefined;
    range: string | undefined;
    types: string[];
    subClassOf: string[];
    restrictions: Restriction[];
    active: boolean;
    topConcept: string | undefined;
  };
} = {};

export var Links: {
  [key: string]: {
    labels: { [key: string]: string };
    definitions: { [key: string]: string };
    inScheme: string;
    type: number;
    domain: string;
    range: string;
    subClassOfDomain: string[];
    subClassOfRange: string[];
    inverseOf: string;
    defaultSourceCardinality: Cardinality;
    defaultTargetCardinality: Cardinality;
  };
} = {};

export var Stereotypes: {
  [key: string]: {
    labels: { [key: string]: string };
    definitions: { [key: string]: string };
    inScheme: string;
    types: string[];
    subClassOf: string[];
    character: string | undefined;
  };
} = {};

export var Diagrams: {
  name: string;
  active: boolean;
  origin: { x: number; y: number };
  scale: number;
}[] = [{ name: "Untitled", active: true, origin: { x: 0, y: 0 }, scale: 1 }];

export var AppSettings: {
  name: { [key: string]: string };
  description: { [key: string]: string };
  selectedDiagram: number;
  selectedLanguage: string;
  selectedLink: string;
  contextIRI: string;
  contextEndpoint: string;
  ontographerContext: string;
  cacheContext: string;
  luceneConnector: string;
  initWorkspace: boolean;
  representation: number;
  defaultCardinality1: string;
  defaultCardinality2: string;
  contextVersion: number;
  latestContextVersion: number;
  lastTransaction: string;
  lastTransactionID: string;
  switchElements: string[];
  defaultLanguage: string;
  viewStereotypes: boolean;
  viewZoom: number;
  viewColorPool: string;
  viewItemPanelTypes: boolean;
  viewLanguage: string;
  selectedElements: string[];
} = {
  name: {},
  description: {},
  selectedDiagram: 0,
  selectedLanguage: Object.keys(Languages)[0],
  selectedLink: "",
  contextIRI: "",
  initWorkspace: false,
  contextEndpoint: Environment.components["al-db-server"].url,
  ontographerContext:
    "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher",
  cacheContext: "https://slovník.gov.cz",
  luceneConnector: "label_index",
  representation: Representation.FULL,
  defaultCardinality1: "0",
  defaultCardinality2: "*",
  contextVersion: 1,
  latestContextVersion: 2,
  lastTransaction: "",
  lastTransactionID: "",
  switchElements: [],
  defaultLanguage: "cs",
  viewStereotypes: true,
  viewZoom: 1,
  viewColorPool: "pastelLow",
  viewItemPanelTypes: true,
  viewLanguage: "en",
  selectedElements: [],
};

export var CardinalityPool: Cardinality[] = [
  new Cardinality("", ""),
  new Cardinality("*", "*"),
  new Cardinality("0", "0"),
  new Cardinality("0", "*"),
  new Cardinality("0", "1"),
  new Cardinality("1", "1"),
  new Cardinality("1", "*"),
  new Cardinality("0", "2"),
  new Cardinality("1", "2"),
  new Cardinality("2", "2"),
  new Cardinality("2", "*"),
];
