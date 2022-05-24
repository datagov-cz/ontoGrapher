import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { qb } from "../QueryBuilder";
import { AppSettings, Diagrams } from "../../config/Variables";
import { parsePrefix } from "../../function/FunctionEditVars";

function getDiagramTriples(diagram: string): string {
  const diagramIRI = qb.i(Diagrams[diagram].iri);
  const diagramGraph = Diagrams[diagram].graph;
  const diagramAttachmentTypes = [
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
  const insertMetadataContext = INSERT.DATA`${qb.g(AppSettings.contextIRI, [
    qb.s(
      qb.i(AppSettings.contextIRI),
      qb.i(parsePrefix("a-popis-dat-pojem", `odkazuje-na-přílohový-kontext`)),
      diagramIRI
    ),
    qb.s(
      diagramGraph,
      "rdf:type",
      qb.i(parsePrefix("a-popis-dat-pojem", "přílohový-kontext"))
    ),
    qb.s(
      diagramGraph,
      qb.i(parsePrefix("a-popis-dat-pojem", "má-typ-přílohy")),
      "og:diagram"
    ),
    qb.s(
      diagramGraph,
      qb.i(parsePrefix("a-popis-dat-pojem", "vychází-z-verze")),
      diagramIRI
    ),
  ])}`.build();

  return qb.combineQueries(
    insertAppContext,
    insertMetadataContext,
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
  const deleteMetadataContext1 = DELETE`${qb.g(AppSettings.contextIRI, [
    qb.s(qb.i(diagramGraph), "?p1", "?o1"),
  ])}`.WHERE`${qb.g(diagramIRI, [
    qb.s(qb.i(diagramGraph), "?p1", "?o1"),
  ])}`.build();
  const deleteMetadataContext2 = DELETE`${qb.g(AppSettings.contextIRI, [
    qb.s("?s1", "?p1", qb.i(diagramGraph)),
  ])}`.WHERE`${qb.g(diagramIRI, [
    qb.s("?s1", "?p1", qb.i(diagramGraph)),
  ])}`.build();
  return qb.combineQueries(
    deleteGraph,
    deleteMetadataContext1,
    deleteMetadataContext2
  );
}
