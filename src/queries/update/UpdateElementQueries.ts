import {
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import {
  getVocabularyFromScheme,
  getWorkspaceContextIRI,
} from "../../function/FunctionGetVars";

export function updateProjectElement(del: boolean, ...ids: string[]): string {
  let data: { [key: string]: string[] } = { [getWorkspaceContextIRI()]: [] };
  let deletes: string[] = [];
  let inserts: string[] = [];

  if (ids.length === 0) return "";
  for (const id of ids) {
    checkElem(id);
    const iri = WorkspaceElements[id].iri;
    const vocabElem = WorkspaceTerms[WorkspaceElements[id].iri];
    const scheme = vocabElem.inScheme;
    const graph =
      WorkspaceVocabularies[getVocabularyFromScheme(vocabElem.inScheme)].graph;
    const types = vocabElem.types.map((type) => qb.i(type));
    const labels = Object.keys(vocabElem.labels)
      .filter((lang) => vocabElem.labels[lang])
      .map((lang) => qb.ll(vocabElem.labels[lang], lang));
    const altLabels = vocabElem.altLabels.map((alt) =>
      qb.ll(alt.label, alt.language)
    );
    const definitions = Object.keys(vocabElem.definitions)
      .filter((lang) => vocabElem.definitions[lang])
      .map((lang) => qb.ll(vocabElem.definitions[lang], lang));
    const names = Object.keys(WorkspaceElements[id].selectedLabel).map((lang) =>
      qb.ll(WorkspaceElements[id].selectedLabel[lang], lang)
    );
    const diagrams = WorkspaceElements[id].diagrams.map((diag) =>
      qb.i(`${WorkspaceElements[id].iri}/diagram-${diag + 1}`)
    );

    if (!(graph in data)) data[graph] = [];
    if (del)
      data[graph].push(
        qb.s(qb.i(iri), "rdf:type", qb.a(types)),
        qb.s(qb.i(iri), "skos:prefLabel", qb.a(labels)),
        qb.s(qb.i(iri), "skos:altLabel", qb.a(altLabels), altLabels.length > 0),
        qb.s(
          qb.i(iri),
          "skos:definition",
          qb.a(definitions),
          definitions.length > 0
        ),
        qb.s(qb.i(iri), "skos:inScheme", qb.i(scheme)),
        qb.s(
          qb.i(scheme),
          "skos:hasTopConcept",
          qb.i(iri),
          vocabElem.topConcept !== undefined
        )
      );
    data[getWorkspaceContextIRI()].push(
      qb.s(qb.i(iri), "rdf:type", "og:element"),
      qb.s(qb.i(iri), "og:id", qb.ll(id)),
      qb.s(qb.i(iri), "og:iri", qb.i(iri)),
      qb.s(qb.i(iri), "og:scheme", qb.i(scheme)),
      qb.s(qb.i(iri), "og:name", qb.a(names)),
      qb.s(qb.i(iri), "og:diagram", qb.a(diagrams), diagrams.length > 0),
      qb.s(qb.i(iri), "og:active", qb.ll(WorkspaceElements[id].active))
    );

    if (del)
      deletes.push(
        ...[
          qb.s(qb.i(iri), "rdf:type", "?type"),
          qb.s(qb.i(iri), "skos:prefLabel", "?labels"),
          qb.s(qb.i(iri), "skos:altLabel", "?alt"),
          qb.s(qb.i(iri), "skos:definition", "?definition"),
        ].map((stmt) =>
          DELETE`${qb.g(graph, [stmt])}`.WHERE`${qb.g(graph, [stmt])}`.build()
        ),
        ...[
          qb.s(qb.i(iri), "og:name", "?name"),
          qb.s(qb.i(iri), "og:diagram", "?diagram"),
          qb.s(qb.i(iri), "og:active", "?active"),
        ].map((stmt) =>
          DELETE`${qb.g(getWorkspaceContextIRI(), [stmt])}`.WHERE`${qb.g(
            getWorkspaceContextIRI(),
            [stmt]
          )}`.build()
        )
      );
  }

  for (const graph in data) {
    inserts.push(INSERT.DATA`${qb.g(graph, data[graph])}`.build());
  }
  return qb.combineQueries(...deletes, ...inserts);
}

export function updateProjectElementDiagram(
  diagram: number,
  ...ids: string[]
): string {
  let inserts: string[] = [];
  let deletes: string[] = [];

  if (ids.length === 0) return "";
  for (const id of ids) {
    checkElem(id);
    let iri = WorkspaceElements[id].iri;
    let diagIRI = iri + "/diagram-" + (diagram + 1);

    inserts.push(
      INSERT.DATA`${qb.g(getWorkspaceContextIRI(), [
        qb.s(qb.i(`${WorkspaceElements[id].iri}`), "og:diagram", qb.i(diagIRI)),
        qb.s(qb.i(diagIRI), "rdf:type", "og:elementDiagram"),
        qb.s(qb.i(diagIRI), "og:index", qb.ll(diagram)),
        qb.s(
          qb.i(diagIRI),
          "og:position-x",
          qb.ll(Math.round(WorkspaceElements[id].position[diagram].x))
        ),
        qb.s(
          qb.i(diagIRI),
          "og:position-y",
          qb.ll(Math.round(WorkspaceElements[id].position[diagram].y))
        ),
        qb.s(
          qb.i(diagIRI),
          "og:hidden",
          qb.ll(WorkspaceElements[id].hidden[diagram])
        ),
      ])}`.build()
    );

    deletes.push(
      DELETE`${qb.g(getWorkspaceContextIRI(), [
        qb.s(qb.i(diagIRI), "?p", "?o"),
      ])}`.WHERE`${qb.g(getWorkspaceContextIRI(), [
        qb.s(qb.i(diagIRI), "?p", "?o"),
      ])}`.build()
    );
  }

  return qb.combineQueries(...deletes, ...inserts);
}

function checkElem(id: string) {
  if (!(id in WorkspaceElements))
    console.error("Passed ID is not recognized as an element ID");
  if (!(WorkspaceElements[id].iri in WorkspaceTerms))
    console.error("Element ID is not tied to a Concept IRI");
}
