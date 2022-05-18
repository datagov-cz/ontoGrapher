import { LinkType } from "../../config/Enum";

export type Instance = {
  iri: string;
  terms: { [key: string]: string[] };
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
} = {};
