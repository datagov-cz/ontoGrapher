import {
  Diagrams,
  Languages,
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
import { initLanguageObject } from "../../function/FunctionEditVars";

export function updateProjectElement(del: boolean, ...iris: string[]): string {
  const data: { [key: string]: string[] } = { [getWorkspaceContextIRI()]: [] };
  const deletes: string[] = [];
  const inserts: string[] = [];
  if (iris.length === 0) return "";
  for (const iri of iris) {
    checkElem(iri);
    const vocabElem = WorkspaceTerms[iri];
    const scheme = vocabElem.inScheme;
    const vocab = getVocabularyFromScheme(vocabElem.inScheme);
    const graph = WorkspaceVocabularies[vocab].graph;
    const types = vocabElem.types.map((type) => qb.i(type));
    const labels = Object.keys(vocabElem.labels)
      .filter((lang) => vocabElem.labels[lang])
      .map((lang) => qb.ll(vocabElem.labels[lang], lang));
    const altLabels = vocabElem.altLabels.map((alt) =>
      qb.ll(alt.label, alt.language)
    );
    const selectedLabels = Object.entries(
      Object.keys(WorkspaceElements[iri].selectedLabel).length > 0
        ? WorkspaceElements[iri].selectedLabel
        : initLanguageObject("")
    ).map(([key, value]) => qb.ll(value, key));
    const names = Object.entries(WorkspaceElements[iri].selectedLabel)
      .filter(
        ([key, value]) =>
          key in Languages && value && WorkspaceTerms[iri].labels[key] !== value
      )
      .map(([key, value]) => qb.ll(value, key));
    const definitions = Object.keys(vocabElem.definitions)
      .filter((lang) => vocabElem.definitions[lang])
      .map((lang) => qb.ll(vocabElem.definitions[lang], lang));

    const ogStatements: string[] = [
      qb.s(qb.i(iri), "rdf:type", "og:element"),
      qb.s(qb.i(iri), "og:scheme", qb.i(scheme)),
      qb.s(qb.i(iri), "og:vocabulary", qb.i(getVocabularyFromScheme(scheme))),
      qb.s(qb.i(iri), "og:name", qb.a(selectedLabels)),
      qb.s(qb.i(iri), "og:active", qb.ll(WorkspaceElements[iri].active)),
    ];

    data[getWorkspaceContextIRI()].push(...ogStatements);
    const deleteStatements = [
      qb.s(qb.i(iri), "og:name", "?name"),
      qb.s(qb.i(iri), "og:active", "?active"),
    ];

    if (del)
      deletes.push(
        ...deleteStatements.map((stmt) =>
          DELETE`${qb.g(getWorkspaceContextIRI(), [stmt])}`.WHERE`${qb.g(
            getWorkspaceContextIRI(),
            [stmt]
          )}`.build()
        )
      );

    if (WorkspaceVocabularies[vocab].readOnly) continue;
    if (!(vocab in data)) data[vocab] = [];

    if (del)
      data[vocab].push(
        qb.s(qb.i(iri), "rdf:type", qb.a(types), types.length > 0),
        qb.s(qb.i(iri), "skos:prefLabel", qb.a(labels), labels.length > 0),
        qb.s(qb.i(iri), "skos:altLabel", qb.a(altLabels), altLabels.length > 0),
        qb.s(qb.i(iri), "dc:title", qb.a(names), names.length > 0),
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

    if (del) {
      deletes.push(
        ...deleteStatements.map((stmt) =>
          DELETE`${qb.g(getWorkspaceContextIRI(), [stmt])}`.WHERE`${qb.g(
            getWorkspaceContextIRI(),
            [stmt]
          )}`.build()
        ),
        ...[
          qb.s(qb.i(iri), "rdf:type", "?type"),
          qb.s(qb.i(iri), "skos:prefLabel", "?labels"),
          qb.s(qb.i(iri), "skos:altLabel", "?alt"),
          qb.s(qb.i(iri), "skos:definition", "?definition"),
          qb.s(qb.i(iri), "dc:title", "?title"),
        ].map((stmt) =>
          DELETE`${qb.g(graph, [stmt])}`.WHERE`${qb.g(graph, [stmt])}`.build()
        )
      );
    }
  }

  for (const vocab in data) {
    if (vocab in WorkspaceVocabularies) {
      const graph = WorkspaceVocabularies[vocab].graph;
      if (WorkspaceVocabularies[vocab].readOnly)
        throw new Error(`Attempted to write to read-only graph ${graph}`);
      inserts.push(INSERT.DATA`${qb.g(graph, data[vocab])}`.build());
    }
  }
  inserts.push(
    INSERT.DATA`${qb.g(
      getWorkspaceContextIRI(),
      data[getWorkspaceContextIRI()]
    )}`.build()
  );
  return qb.combineQueries(...deletes, ...inserts);
}

export function updateProjectElementDiagram(
  diagram: string,
  ...ids: string[]
): string {
  let inserts: string[] = [];
  let deletes: string[] = [];

  if (ids.length === 0) return "";
  for (const iri of ids) {
    checkElem(iri);
    const diagramGraph = Diagrams[diagram].graph;
    inserts.push(
      INSERT.DATA`${qb.g(diagramGraph, [
        qb.s(qb.i(iri), "rdf:type", "og:element"),
        qb.s(
          qb.i(iri),
          "og:position-x",
          qb.ll(Math.round(WorkspaceElements[iri].position[diagram].x))
        ),
        qb.s(
          qb.i(iri),
          "og:position-y",
          qb.ll(Math.round(WorkspaceElements[iri].position[diagram].y))
        ),
        qb.s(
          qb.i(iri),
          "og:hidden",
          qb.ll(WorkspaceElements[iri].hidden[diagram])
        ),
      ])}`.build()
    );

    deletes.push(
      ...[
        qb.s(qb.i(iri), "og:position-x", "?positionX"),
        qb.s(qb.i(iri), "og:position-y", "?positionY"),
        qb.s(qb.i(iri), "og:hidden", "?hidden"),
      ].map((stmt) =>
        DELETE`${qb.g(diagramGraph, [stmt])}`.WHERE`${qb.g(diagramGraph, [
          stmt,
        ])}`.build()
      )
    );
  }

  return qb.combineQueries(...deletes, ...inserts);
}

function checkElem(iri: string) {
  if (!(iri in WorkspaceElements || WorkspaceElements[iri]))
    console.error("Passed ID is not recognized as an element ID");
  if (!(iri in WorkspaceTerms)) {
    console.error("Element ID is not tied to a Concept IRI");
  }
}
