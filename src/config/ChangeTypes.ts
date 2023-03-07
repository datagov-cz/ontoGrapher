export enum ChangeType {
  ADDITION,
  EDIT,
  // and deletion? Such a change is not in the a-popis-dat ontology.
}

// Logging only changes of the vocabulary. OG-specific attribute change tracking is currently unimplemented.
export var ChangeAttribute = {
  element: {
    prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
    altLabel: "http://www.w3.org/2004/02/skos/core#altLabel",
    definition: "http://www.w3.org/2004/02/skos/core#definition",
    type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    title: "http://purl.org/dc/terms/title",
    inScheme: "http://www.w3.org/2004/02/skos/core#inScheme",
    topConcept: "http://www.w3.org/2004/02/skos/core#topConceptOf",
  },
  // TODO: implement change tracking for relationships
};

export type Change = {
  type: ChangeType;
  vocabulary: string;
  attribute: string;
  entity: string;
  current: string;
  replace: string;
};
