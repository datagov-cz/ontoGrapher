import { Argument } from "./Argument";

export default class Pattern {
  public iri: string;
  public title: string;
  public author: string;
  public arguments: Set<Argument> = new Set<Argument>();

  constructor(iri: string, title: string, author: string) {
    this.iri = iri;
    this.title = title;
    this.author = author;
  }
}
