import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { LinkConfig } from "../../config/logic/LinkConfig";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import {
  getDiagramContextIRI,
  getWorkspaceContextIRI,
} from "../../function/FunctionGetVars";

export function updateProjectLinkVertex(
  id: string,
  vertices: number[],
  diagram: number = AppSettings.selectedDiagram
): string {
  checkLink(id);
  const linkIRI = AppSettings.ontographerContext + "-" + id;
  const vertIRIs = vertices.map((i) => qb.i(`${linkIRI}/vertex-${i + 1}`));

  if (vertIRIs.length === 0) return "";

  const insert = INSERT.DATA`${qb.g(getDiagramContextIRI(diagram), [
    qb.s(qb.i(linkIRI), "og:vertex", qb.a(vertIRIs), vertIRIs.length > 0),
    qb.s(qb.i(linkIRI), "og:id", qb.ll(id)),
    qb.s(qb.i(linkIRI), "rdf:type", "og:link"),
    qb.s(qb.i(linkIRI), "og:iri", qb.i(WorkspaceLinks[id].iri)),
    qb.s(qb.i(linkIRI), "og:active", qb.ll(WorkspaceLinks[id].active)),
    qb.s(qb.i(linkIRI), "og:source-id", qb.ll(WorkspaceLinks[id].source)),
    qb.s(qb.i(linkIRI), "og:target-id", qb.ll(WorkspaceLinks[id].target)),
    qb.s(
      qb.i(linkIRI),
      "og:source",
      qb.i(WorkspaceElements[WorkspaceLinks[id].source].iri)
    ),
    qb.s(
      qb.i(linkIRI),
      "og:target",
      qb.i(WorkspaceElements[WorkspaceLinks[id].target].iri)
    ),
    qb.s(
      qb.i(linkIRI),
      "og:type",
      qb.ll(LinkConfig[WorkspaceLinks[id].type].id)
    ),
    qb.s(
      qb.i(linkIRI),
      "og:sourceCardinality1",
      qb.ll(WorkspaceLinks[id].sourceCardinality.getFirstCardinality())
    ),
    qb.s(
      qb.i(linkIRI),
      "og:sourceCardinality2",
      qb.ll(WorkspaceLinks[id].sourceCardinality.getSecondCardinality())
    ),
    qb.s(
      qb.i(linkIRI),
      "og:targetCardinality1",
      qb.ll(WorkspaceLinks[id].targetCardinality.getFirstCardinality())
    ),
    qb.s(
      qb.i(linkIRI),
      "og:targetCardinality2",
      qb.ll(WorkspaceLinks[id].targetCardinality.getSecondCardinality())
    ),
    ...vertIRIs.map((iri, i) =>
      [
        qb.s(iri, "rdf:type", "og:vertex"),
        qb.s(iri, "og:index", qb.ll(vertices[i])),
        qb.s(
          iri,
          "og:position-x",
          qb.ll(Math.round(WorkspaceLinks[id].vertices[diagram][vertices[i]].x))
        ),
        qb.s(
          iri,
          "og:position-y",
          qb.ll(Math.round(WorkspaceLinks[id].vertices[diagram][vertices[i]].y))
        ),
      ].join(`
`)
    ),
  ])}`.build();

  const delS = vertIRIs.map((iri) =>
    DELETE`${qb.g(getDiagramContextIRI(diagram), [qb.s(iri, "?p", "?o")])}`
      .WHERE`${qb.g(getDiagramContextIRI(diagram), [
      qb.s(iri, "?p", "?o"),
    ])}`.build()
  );

  return qb.combineQueries(...delS, insert);
}

export function updateDeleteProjectLinkVertex(
  id: string,
  from: number,
  to: number,
  diagram: number
): string {
  let linkIRI = AppSettings.ontographerContext + "-" + id;
  let IRIs = [];
  if (from === to) return "";
  for (let i = from; i < to; i++) {
    IRIs.push(qb.i(`${linkIRI}/vertex-${i + 1}`));
  }

  return DELETE.DATA`${qb.g(getDiagramContextIRI(diagram), [
    qb.s(qb.i(linkIRI), "og:vertex", qb.a(IRIs)),
  ])}`.build();
}

export function updateProjectLink(del: boolean, ...ids: string[]): string {
  const insertBody: string[] = [];
  const deletes: string[] = [];
  const insert: string[] = [];
  const diagrams = Diagrams.map((diagram, i) => getDiagramContextIRI(i));
  if (ids.length === 0) return "";
  for (let id of ids) {
    checkLink(id);
    const linkIRI = qb.i(AppSettings.ontographerContext + "-" + id);

    insertBody.push(
      qb.s(linkIRI, "rdf:type", "og:link"),
      qb.s(linkIRI, "og:id", qb.ll(id)),
      qb.s(linkIRI, "og:iri", qb.i(WorkspaceLinks[id].iri)),
      qb.s(linkIRI, "og:active", qb.ll(WorkspaceLinks[id].active)),
      qb.s(linkIRI, "og:source-id", qb.ll(WorkspaceLinks[id].source)),
      qb.s(linkIRI, "og:target-id", qb.ll(WorkspaceLinks[id].target)),
      qb.s(
        linkIRI,
        "og:source",
        qb.i(WorkspaceElements[WorkspaceLinks[id].source].iri)
      ),
      qb.s(
        linkIRI,
        "og:target",
        qb.i(WorkspaceElements[WorkspaceLinks[id].target].iri)
      ),
      qb.s(linkIRI, "og:type", qb.ll(LinkConfig[WorkspaceLinks[id].type].id)),
      qb.s(
        linkIRI,
        "og:sourceCardinality1",
        qb.ll(WorkspaceLinks[id].sourceCardinality.getFirstCardinality())
      ),
      qb.s(
        linkIRI,
        "og:sourceCardinality2",
        qb.ll(WorkspaceLinks[id].sourceCardinality.getSecondCardinality())
      ),
      qb.s(
        linkIRI,
        "og:targetCardinality1",
        qb.ll(WorkspaceLinks[id].targetCardinality.getFirstCardinality())
      ),
      qb.s(
        linkIRI,
        "og:targetCardinality2",
        qb.ll(WorkspaceLinks[id].targetCardinality.getSecondCardinality())
      )
    );

    if (del)
      deletes.push(
        DELETE`${qb.g(getWorkspaceContextIRI(), [qb.s(linkIRI, "?p", "?o")])}`
          .WHERE`${qb.g(getWorkspaceContextIRI(), [
          qb.s(linkIRI, "?p", "?o"),
          "filter(?p not in (og:vertex))",
        ])}`.build(),
        DELETE`graph ?graphs {${[qb.s(linkIRI, "?p", "?o")].join(`
        `)}}`.WHERE`${qb.gs(diagrams, [
          qb.s(linkIRI, "?p", "?o"),
          "filter(?p not in (og:vertex))",
        ])}`.build()
      );
  }
  insert.push(
    ...diagrams.map((diagram) =>
      INSERT.DATA`${qb.g(diagram, insertBody)}`.build()
    ),
    INSERT.DATA`${qb.g(getWorkspaceContextIRI(), insertBody)}`.build()
  );

  return qb.combineQueries(...deletes, ...insert);
}

function checkLink(id: string) {
  if (!(id in WorkspaceLinks))
    throw new Error("Passed ID is not recognized as a relationship ID");
}
