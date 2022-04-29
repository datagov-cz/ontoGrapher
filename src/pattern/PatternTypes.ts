import { Quad } from "n3";

export type Instance = {
  iri: string;
  terms: {
    iri: string;
    qualities: string[];
  }[];
  conns: {
    iri: string;
    to: string;
    from: string;
    sourceCardinality: string;
    targetCardinality: string;
  }[];
  x: number;
  y: number;
};

export type Pattern = {
  title: string;
  author: string;
  date: string;
  description: string;
  terms: {
    name: string;
    types: string[];
    parameter: boolean;
    qualities: string[];
    optional?: boolean;
    multiple?: boolean;
    convolution?: boolean;
  }[];
  conns: {
    name: string;
    to: string;
    from: string;
    sourceCardinality: string;
    targetCardinality: string;
  }[];
};

export var Instances: {
  [key: string]: Instance;
} = {};

export var Patterns: {
  [key: string]: Pattern;
} = {
  text: {
    title: "test",
    author: "jíá",
    date: "2022-05-02T11:46:18.638Z",
    description: "ff",
    terms: [
      {
        parameter: false,
        types: [
          "http://www.w3.org/2002/07/owl#Class",
          "http://www.w3.org/2004/02/skos/core#Concept",
          "https://slovník.gov.cz/základní/pojem/typ-objektu",
        ],
        name: "Mezinárodní řidičský průkaz",
        qualities: [],
      },
      {
        parameter: false,
        types: [
          "http://www.w3.org/2002/07/owl#Class",
          "http://www.w3.org/2004/02/skos/core#Concept",
          "https://slovník.gov.cz/základní/pojem/typ-objektu",
        ],
        name: "Autobus",
        qualities: [
          "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/mnohem-delší-vlastnost",
          "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/počet-míst",
          "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/a-ještě-ta-nejdelší-vlastnost-ze-všech-ostatních",
        ],
      },
    ],
    conns: [
      {
        name: "tčtččč",
        from: "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/autobus",
        to: "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/mezinárodní-řidičský-průkaz",
        sourceCardinality: "3",
        targetCardinality: "6",
      },
    ],
  },
};

export type PatternRefactorResults = {
  replaces: Quad[];
  instance: Instance;
};

export var PatternUsage: {
  [key: string]: { instance: Instance; model: string; diagram?: string }[];
} = {};
