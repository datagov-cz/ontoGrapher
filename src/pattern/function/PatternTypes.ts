import { LinkType } from "../../config/Enum";

export type Instance = {
  iri: string;
  terms: { [key: string]: string };
  conns: { [key: string]: string };
  x: number;
  y: number;
};

export type Pattern = {
  title: string;
  author: string;
  date: string;
  description: string;
  terms: {
    [key: string]: {
      name: string;
      types: string[];
      parameter?: boolean;
      optional?: boolean;
      multiple?: boolean;
    };
  };
  conns: {
    [key: string]: {
      name: string;
      to: string;
      from: string;
      sourceCardinality: string;
      targetCardinality: string;
      linkType: LinkType;
    };
  };
};

export var Instances: {
  [key: string]: Instance;
} = {};

export var Patterns: {
  [key: string]: Pattern;
} = {
  ["test"]: {
    title: "gthththt",
    author: "",
    date: "2022-05-14T12:43:53.568Z",
    description: "",
    terms: {
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/mezinárodní-řidičský-průkaz":
        {
          name: "test0",
          types: ["https://slovník.gov.cz/základní/pojem/typ-objektu"],
          parameter: true,
          optional: true,
          multiple: false,
        },
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/autobus": {
        name: "test01",
        types: ["https://slovník.gov.cz/základní/pojem/typ-objektu"],
        parameter: true,
        optional: false,
        multiple: true,
      },
    },
    conns: {
      "13dce549-0a20-4542-adee-a0d1e7b5e0f9": {
        name: "test222",
        to: "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/mezinárodní-řidičský-průkaz",
        from: "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/autobus",
        sourceCardinality: "2",
        targetCardinality: "2",
        linkType: 0,
      },
    },
  },
};

export var PatternUsage: {
  [key: string]: { instance: Instance; model: string; diagram?: string }[];
} = {};
