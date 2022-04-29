import { Instance, Patterns } from "./PatternTypes";
import { createNewConcept } from "../function/FunctionElem";
import { initLanguageObject, parsePrefix } from "../function/FunctionEditVars";
import { AppSettings } from "../config/Variables";
import { getVocabularyFromScheme } from "../function/FunctionGetVars";
import { updateProjectElement, updateProjectElementDiagram } from "../queries/update/UpdateElementQueries";
import { saveNewLink } from "../function/FunctionLink";
import { Representation } from "../config/Enum";

export function produceOttrPattern(pattern: string) {
  // let counter = 0;
  const ret = [
    `<${pattern}> a ottr:Pattern.`,
    `<${pattern}> skos:prefLabel "${Patterns[pattern].title}".`,
    `<${pattern}> dc:creator "${Patterns[pattern].author}".`,
    `<${pattern}> pav:createdOn "${Patterns[pattern].date}"^xsd:dateTime.`,
    `<${pattern}> dc:description "${Patterns[pattern].description}".`,
    `<${pattern}> ottr:parameters (`,
    ...Patterns[pattern].terms
      .filter((t) => t.parameter)
      .map((t, i) =>
        [
          "[",
          t.types.length > 0 ? `ottr:type ${t.types[0]};` : "",
          t.optional ? "ottr:modifier ottr:optional;" : "",
          `ottr:variable _:b${i}]`,
        ].join("")
      ),
    ...Patterns[pattern].terms
      .filter((t) => !t.parameter)
      .map((t, i) =>
        [
          "[",
          `ottr:type xsd:string;`,
          `ottr:variable _:b${
            i + Patterns[pattern].terms.filter((t) => t.parameter).length
          }]`,
        ].join("")
      ),
    ...Patterns[pattern].conns.map((c, i) =>
      [
        "[",
        `ottr:type xsd:string;`,
        `ottr:variable _:b${i + Patterns[pattern].terms.length}]`,
      ].join("")
    ),
    ");",
    ...Patterns[pattern].terms.map((t, i) => ["ottr:pattern "].join("")),
    ");",
  ].join("");
}
export function produceInstance(instance: Instance): string[] {
  const queries: string[] = [];
  const matrixLength = Math.max(instance.terms.length);
  const matrixDimension = Math.ceil(Math.sqrt(matrixLength));
  instance.terms.forEach((t, i) => {
    const term = Patterns[instance.iri].terms[i];
    const id = createNewConcept(
      { x: 0, y: 0 },
      initLanguageObject(t.name),
      AppSettings.canvasLanguage,
      getVocabularyFromScheme(t.scheme),
      term.types
    );
    queries.push(id);
  });
  instance.conns.forEach((c, i) => {
    const conn = Patterns[instance.iri].conns[i];
    const id = createNewConcept(
      { x: 0, y: 0 },
      initLanguageObject(c.name),
      AppSettings.canvasLanguage,
      getVocabularyFromScheme(c.scheme),
      [parsePrefix("z-sgov-pojem", "typ-vztahu")]
    );
    queries.push(updateProjectElement(true, id),
      updateProjectElementDiagram(AppSettings.selectedDiagram, id),
      ...saveNewLink(
      id,
      connections[0],
      connections[1],
      Representation.COMPACT
    )¨)
  });
  return queries;
}
