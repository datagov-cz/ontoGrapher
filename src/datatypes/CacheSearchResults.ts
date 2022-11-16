import { Representation } from "../config/Enum";

export type CacheSearchResults = {
  [key: string]: {
    labels: { [key: string]: string };
    types: string[];
    altLabels: { label: string; language: string }[];
    definitions: { [key: string]: string };
    vocabulary: string;
  };
};

export var CacheSearchVocabularies: {
  [key: string]: {
    labels: { [key: string]: string };
    namespace: string;
    count: { [key in Representation]: number };
    glossary: string;
    diagrams: string[];
  };
} = {};
