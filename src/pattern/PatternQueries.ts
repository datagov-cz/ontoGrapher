import { Environment } from "../config/Environment";
import * as N3 from "n3";
import { Quad } from "n3";
import Pattern from "./Pattern";
import { parsePrefix } from "../function/FunctionEditVars";

export function getPattern(iri: string) {
  fetch(`${Environment.pattern}/template?iri=${iri}`)
    .then((r) => r.text())
    .then((text) => {
      const parser = new N3.Parser();
      const quads: Quad[] = parser.parse(text);
      const pattern: Pattern = new Pattern(iri, "", "");
      for (const quad of quads) {
        if (quad.predicate.value === parsePrefix("dc", "title")) {
          pattern.title = quad.object.value;
        }
        if (quad.predicate.value === parsePrefix("dc", "creator")) {
          pattern.author = quad.object.value;
        }
        if (quad.predicate.value === parsePrefix("ottr", "parameters")) {
        }
        if (quad.predicate.value === parsePrefix("ottr", "pattern")) {
        }
      }
    });
}
