import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { qb } from "../QueryBuilder";
import { AppSettings, Diagrams } from "../../config/Variables";
import { parsePrefix } from "../../function/FunctionEditVars";

function getDiagramTriples(diagram: string): string {
  const diagramIRI = qb.i(Diagrams[diagram].iri);
  const diagramGraph = Diagrams[diagram].graph;
  const diagramAttachmentTypes = [
    qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "příloha")),
    qb.i(parsePrefix("a-popis-dat-pojem", "příloha")),
    qb.i(parsePrefix("og", "diagram")),
  ];
  return INSERT.DATA`${qb.g(diagramGraph, [
    qb.s(diagramIRI, "rdf:type", qb.a(diagramAttachmentTypes)),
    qb.s(diagramIRI, "og:index", qb.ll(Diagrams[diagram].index)),
    qb.s(diagramIRI, "og:name", qb.ll(Diagrams[diagram].name)),
    qb.s(diagramIRI, "og:id", qb.ll(diagram)),
    qb.s(
      diagramIRI,
      "og:representation",
      qb.ll(Diagrams[diagram].representation)
    ),
  ])}`.build();
}

export function updateCreateDiagram(diagram: string): string {
  const diagramIRI = qb.i(Diagrams[diagram].iri);
  const diagramGraph = qb.i(Diagrams[diagram].graph);
  const insertAppContext = INSERT.DATA`${qb.g(AppSettings.applicationContext, [
    qb.s(qb.i(AppSettings.applicationContext), "og:diagram", qb.ll(diagram)),
  ])}`.build();
  const insertDiagramContext = getDiagramTriples(diagram);
  const insertVocabularyContext = AppSettings.contextIRIs.map((contextIRI) =>
    INSERT.DATA`${qb.g(contextIRI, [
      qb.s(
        qb.i(contextIRI),
        qb.i(parsePrefix("a-popis-dat-pojem", `má-přílohu`)),
        diagramIRI
      ),
      qb.s(
        diagramGraph,
        "rdf:type",
        qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "přílohový-kontext"))
      ),
      qb.s(
        diagramGraph,
        qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "má-typ-přílohy")),
        "og:diagram"
      ),
      qb.s(
        diagramGraph,
        qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "vychází-z-verze")),
        diagramIRI
      ),
    ])}`.build()
  );

  return qb.combineQueries(
    insertAppContext,
    ...insertVocabularyContext,
    insertDiagramContext
  );
}

export function updateDiagram(diagram: string): string {
  const diagramIRI = Diagrams[diagram].iri;
  const diagramGraph = Diagrams[diagram].graph;
  const insertDiagramContext = getDiagramTriples(diagram);
  const del = DELETE`${qb.g(diagramGraph, [
    qb.s(qb.i(diagramIRI), "?p1", "?o1"),
  ])}`.WHERE`${qb.g(diagramGraph, [
    qb.s(qb.i(diagramIRI), "?p1", "?o1"),
  ])}`.build();
  return qb.combineQueries(del, insertDiagramContext);
}

export function updateDeleteDiagram(diagram: string) {
  const diagramIRI = Diagrams[diagram].iri;
  const diagramGraph = Diagrams[diagram].graph;
  const deleteGraph = `DROP GRAPH <${diagramGraph}>`;
  const deleteVocabularyContext1 = AppSettings.contextIRIs.map((contextIRI) =>
    DELETE`${qb.g(contextIRI, [qb.s(qb.i(diagramGraph), "?p1", "?o1")])}`
      .WHERE`${qb.g(contextIRI, [
      qb.s(qb.i(diagramGraph), "?p1", "?o1"),
    ])}`.build()
  );
  const deleteVocabularyContext2 = AppSettings.contextIRIs.map((contextIRI) =>
    DELETE`${qb.g(contextIRI, [qb.s("?s1", "?p1", qb.i(diagramGraph))])}`
      .WHERE`${qb.g(contextIRI, [
      qb.s("?s1", "?p1", qb.i(diagramIRI)),
    ])}`.build()
  );
  return qb.combineQueries(
    deleteGraph,
    ...deleteVocabularyContext1,
    ...deleteVocabularyContext2
  );
}
