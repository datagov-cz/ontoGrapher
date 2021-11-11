import {
  getDiagramContextIRI,
  getWorkspaceContextIRI,
} from "../../function/FunctionGetVars";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { qb } from "../QueryBuilder";
import { AppSettings, Diagrams } from "../../config/Variables";
import { parsePrefix } from "../../function/FunctionEditVars";

export function updateCreateDiagram(diagram: number): string {
  const diagramIRI = getDiagramContextIRI(diagram);
  const insertDiagramContext = INSERT.DATA`${qb.g(diagramIRI, [
    qb.s(
      qb.i(diagramIRI),
      "rdf:type",
      qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "assetový-kontext"))
    ),
    qb.s(
      qb.i(diagramIRI),
      qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "má-typ-assetu")),
      "og:diagram"
    ),
    qb.s(qb.i(diagramIRI), "og:index", qb.ll(diagram)),
    qb.s(qb.i(diagramIRI), "og:name", qb.ll(Diagrams[diagram].name)),
    qb.s(qb.i(diagramIRI), "og:id", qb.ll(Diagrams[diagram].id)),
    qb.s(
      qb.i(diagramIRI),
      "og:representation",
      qb.ll(Diagrams[diagram].representation)
    ),
  ])}`.build();

  const insertMetadataContext = INSERT.DATA`${qb.g(AppSettings.contextIRI, [
    qb.s(
      qb.i(AppSettings.contextIRI),
      qb.i(
        parsePrefix(
          "d-sgov-pracovní-prostor-pojem",
          `odkazuje-na-assetový-kontext`
        )
      ),
      qb.i(diagramIRI)
    ),
  ])}`.build();

  return qb.combineQueries(insertMetadataContext, insertDiagramContext);
}

export function updateDiagram(diagram: number): string {
  const appContextIRI = getWorkspaceContextIRI();
  const diagramIRI = getDiagramContextIRI(diagram);
  const insertAppContext = INSERT.DATA`${qb.g(appContextIRI, [
    qb.s(qb.i(appContextIRI), "og:diagram", qb.i(diagramIRI)),
  ])}`.build();
  const insertDiagramContext = INSERT.DATA`${qb.g(diagramIRI, [
    qb.s(qb.i(diagramIRI), "rdf:type", "og:diagram"),
    qb.s(qb.i(diagramIRI), "og:index", qb.ll(diagram)),
    qb.s(qb.i(diagramIRI), "og:name", qb.ll(Diagrams[diagram].name)),
    qb.s(qb.i(diagramIRI), "og:id", qb.ll(Diagrams[diagram].id)),
    qb.s(
      qb.i(diagramIRI),
      "rdf:type",
      qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "assetový-kontext"))
    ),
    qb.s(
      qb.i(diagramIRI),
      qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "má-typ-assetu")),
      "og:diagram"
    ),
    qb.s(
      qb.i(diagramIRI),
      "og:representation",
      qb.ll(Diagrams[diagram].representation)
    ),
  ])}`.build();
  const del = DELETE`${qb.g(diagramIRI, [
    qb.s(qb.i(diagramIRI), "?p1", "?o1"),
  ])}`.WHERE`${qb.g(diagramIRI, [
    qb.s(qb.i(diagramIRI), "?p1", "?o1"),
  ])}`.build();
  return qb.combineQueries(del, insertAppContext, insertDiagramContext);
}

export function updateDeleteDiagram(diagram: number) {
  const diagramIRI = getDiagramContextIRI(diagram);
  const deleteGraph = `DROP GRAPH <${diagramIRI}>`;
  const deleteMetadataContext = DELETE.DATA`${qb.g(AppSettings.contextIRI, [
    qb.s(
      qb.i(AppSettings.contextIRI),
      qb.i(
        parsePrefix(
          "d-sgov-pracovní-prostor-pojem",
          `odkazuje-na-assetový-kontext`
        )
      ),
      qb.i(diagramIRI)
    ),
  ])}`.build();
  return qb.combineQueries(deleteGraph, deleteMetadataContext);
}
