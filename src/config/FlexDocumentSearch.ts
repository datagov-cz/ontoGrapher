import { Document } from "flexsearch";

type FlexDocument = {
  id: number;
  tag: string;
  index: {
    selectedLabel: string;
    prefLabel: string;
    // altLabel: string[];
  };
};

export var FlexDocumentSearch = new Document({
  worker: true,
  encode: "simple",
  preset: "performance",
  tokenize: "reverse",
  document: {
    id: "id",
    tag: "language",
    index: [
      "selectedLabel",
      "prefLabel",
      // "altLabel"
    ],
  },
});
export var FlexDocumentIDTable: { [key: number]: string } = {};
