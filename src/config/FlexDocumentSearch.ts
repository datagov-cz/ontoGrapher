import { Document } from "flexsearch";

type FlexDocument = {
  id: number;
  language: string;
  selectedLabel: string;
  prefLabel: string;
  altLabel: string[];
};

export var FlexDocumentSearch = new Document<FlexDocument>({
  worker: false,
  tokenize: "reverse",
  charset: "latin:advanced",
  document: {
    id: "id",
    tag: "language",
    index: ["selectedLabel", "prefLabel", "altLabel"],
  },
});

export var FlexDocumentIDTable: { [key: number]: string } = {};
