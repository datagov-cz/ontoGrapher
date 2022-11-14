import { Cardinality } from "../datatypes/Cardinality";
import { Restriction } from "../datatypes/Restriction";
import { Representation } from "./Enum";
import * as joint from "jointjs";
import { Environment } from "./Environment";

// language code : language label
export var Languages: { [key: string]: string } = {};

export var WorkspaceElements: {
  [key: string]: {
    //if hidden in diagram ID
    hidden: { [key: string]: boolean };
    //position on graph by diagram ID
    position: { [key: string]: { x: number; y: number } };
    //if usable in graph
    active: boolean;
    //selected label from pref/altLabels
    selectedLabel: { [key: string]: string };
    //vocabulary (if known)
    vocabulary?: string;
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
    //vertices - point breaks of link by diagram ID
    vertices: { [key: string]: joint.dia.Link.Vertex[] };
    //type - dictates saving/loading behaviour
    type: number;
    //active
    active: boolean;
    //inverse link presence for source cardinality purposes
    hasInverse: boolean;
    linkIRI: string;
  };
} = {};

export var WorkspaceVocabularies: {
  [key: string]: {
    labels: { [key: string]: string };
    readOnly: boolean;
    glossary: string;
    count: { [key in Representation]: number };
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
  dc: "http://purl.org/dc/terms/",
  og: "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  "d-sgov-pracovní-prostor-pojem":
    "https://slovník.gov.cz/datový/pracovní-prostor/pojem/",
  "z-sgov-pojem": "https://slovník.gov.cz/základní/pojem/",
  "v-sgov-pojem": "https://slovník.gov.cz/veřejný-sektor/pojem/",
  "a-popis-dat-pojem":
    "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/",
  "slovník-gov": "https://slovník.gov.cz/",
};

export var WorkspaceTerms: {
  [key: string]: {
    labels: { [key: string]: string };
    altLabels: { label: string; language: string }[];
    definitions: { [key: string]: string };
    inScheme: string;
    types: string[];
    subClassOf: string[];
    restrictions: Restriction[];
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
  [key: string]: {
    name: string;
    active: boolean;
    origin: { x: number; y: number };
    scale: number;
    representation: Representation;
    index: number;
    iri: string;
    graph: string;
    saved: boolean;
    // TODO: refactor for all implementations of Diagrams
    vocabularies: string[];
  };
} = {};

export var AppSettings: {
  name: { [key: string]: string };
  description: { [key: string]: string };
  selectedDiagram: string;
  canvasLanguage: string;
  contextIRIs: string[];
  contextEndpoint: string;
  applicationContext: string;
  ontographerContext: string;
  cacheContext: string;
  luceneConnector: string;
  initWorkspace: boolean;
  representation: Representation;
  defaultCardinalitySource: Cardinality;
  defaultCardinalityTarget: Cardinality;
  contextVersion: number;
  latestContextVersion: number;
  lastTransactions: string[];
  lastTransactionID: string;
  switchElements: string[];
  defaultLanguage: string;
  viewStereotypes: boolean;
  viewZoom: number;
  viewColorPool: string;
  viewItemPanelTypes: boolean;
  interfaceLanguage: string;
  selectedElements: string[];
  selectedLinks: string[];
} = {
  name: {},
  description: {},
  selectedDiagram: "",
  canvasLanguage: Object.keys(Languages)[0],
  contextIRIs: [],
  applicationContext: "",
  initWorkspace: false,
  contextEndpoint: Environment.components["al-db-server"].url,
  ontographerContext:
    "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher",
  cacheContext: "https://slovník.gov.cz",
  luceneConnector: "label_index",
  representation: Representation.COMPACT,
  defaultCardinalitySource: new Cardinality("0", "*"),
  defaultCardinalityTarget: new Cardinality("0", "*"),
  contextVersion: 4,
  latestContextVersion: 4,
  lastTransactions: [],
  lastTransactionID: "",
  switchElements: [],
  defaultLanguage: "cs",
  viewStereotypes: true,
  viewZoom: 1,
  viewColorPool: "pastelLow",
  viewItemPanelTypes: true,
  interfaceLanguage: "en",
  selectedElements: [],
  selectedLinks: [],
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
