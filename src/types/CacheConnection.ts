export type CacheConnection = {
  link: string;
  linkLabels: { [key: string]: string };
  target: {
    iri: string;
    labels: { [key: string]: string };
    definitions: { [key: string]: string };
    vocabulary: string;
  };
  direction: string;
  sourceCardinality?: string;
  targetCardinality?: string;
};
