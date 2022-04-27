import { Quad } from "n3";

export type Argument = {
  name: string;
  type: string;
  optional?: boolean;
};

export type Instance = { iri: string; parameters: string[] };

export type Pattern = {
  title: string;
  author: string;
  arguments: Argument[];
};

export var Instances: {
  [key: string]: Instance;
} = {};

export var Patterns: {
  [key: string]: Pattern;
} = {};

export type PatternRefactorResults = {
  replaces: Quad[];
  instance: Instance;
};

export var PatternUsage: {
  [key: string]: { instance: Instance; model: string; diagram?: string }[];
} = {};
