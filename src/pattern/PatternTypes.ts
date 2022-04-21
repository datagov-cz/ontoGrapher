export type Argument = {
  name: string;
  type: string;
};

export var Instances: { iri: string; parameters: Set<string> }[] = [];

export var Patterns: {
  [key: string]: {
    title: string;
    author: string;
    arguments: Set<Argument>;
  };
} = {};
