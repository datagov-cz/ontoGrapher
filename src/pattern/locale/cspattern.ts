import { enPattern } from "./enpattern";

export const csPattern: { [Property in keyof typeof enPattern]: string } = {
  patternDetails: "Pattern details",
  title: "Title",
  author: "Author",
  creationDate: "Creation date",
  description: "Description",
  viewStructure: "View instance internal structure",
  viewStatistics: "View pattern statistics",
  structure: "instance internal structure",
} as const;
