import { AppSettings, Diagrams, WorkspaceLinks } from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { LinkConfig } from "../../config/logic/LinkConfig";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";

export function updateProjectLinkVertex(
  id: string,
  vertices: number[],
  diagram: string = AppSettings.selectedDiagram
): string {
  checkLink(id);
  const linkIRI = WorkspaceLinks[id].linkIRI;
  const vertIRIs = vertices.map((i) => qb.i(`${linkIRI}/vertex-${i + 1}`));

  if (vertIRIs.length === 0) return "";

  const insert = INSERT.DATA`${qb.g(Diagrams[diagram].graph, [
    qb.s(qb.i(linkIRI), "og:vertex", qb.a(vertIRIs), vertIRIs.length > 0),
    qb.s(qb.i(linkIRI), "og:id", qb.ll(id)),
    qb.s(qb.i(linkIRI), "rdf:type", "og:link"),
    qb.s(qb.i(linkIRI), "og:iri", qb.i(WorkspaceLinks[id].iri)),
    qb.s(qb.i(linkIRI), "og:active", qb.ll(WorkspaceLinks[id].active)),
    qb.s(qb.i(linkIRI), "og:source", qb.i(WorkspaceLinks[id].source)),
    qb.s(qb.i(linkIRI), "og:target", qb.i(WorkspaceLinks[id].target)),
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
    DELETE`${qb.g(Diagrams[diagram].graph, [qb.s(iri, "?p", "?o")])}`
      .WHERE`${qb.g(Diagrams[diagram].graph, [qb.s(iri, "?p", "?o")])}`.build()
  );

  return qb.combineQueries(...delS, insert);
}

export function updateDeleteProjectLinkVertex(
  id: string,
  from: number,
  to: number,
  diagram: string
): string {
  const linkIRI = WorkspaceLinks[id].linkIRI;
  const IRIs = [];
  if (from === to) return "";
  for (let i = from; i < to; i++) {
    IRIs.push(qb.i(`${linkIRI}/vertex-${i + 1}`));
  }

  return DELETE.DATA`${qb.g(Diagrams[diagram].graph, [
    qb.s(qb.i(linkIRI), "og:vertex", qb.a(IRIs)),
  ])}`.build();
}

export function updateDeleteProjectLink(
  deleteVertexTriples: boolean,
  ...ids: string[]
): string {
  if (ids.length === 0) return "";
  const queries = [];
  const diagrams = Object.values(Diagrams)
    .filter((diag) => diag.toBeDeleted)
    .map((diagram) => diagram.graph);
  diagrams.push(AppSettings.applicationContext);
  const delStatement = qb.s("?link", `?p`, `?o`);
  const filter = deleteVertexTriples ? "" : `filter(?p not in (og:vertex))`;
  queries.push(
    DELETE`graph ?graphs {${delStatement}}`.WHERE`${qb.gs(diagrams, [
      delStatement,
      filter,
      `values ?link {<${ids
        .map((id) => WorkspaceLinks[id].linkIRI)
        .join("> <")}>}`,
    ])}`.build()
  );
  return qb.combineQueries(...queries);
}

export function updateProjectLink(del: boolean, ...ids: string[]): string {
  const insertBody: string[] = [];
  const deletes: string = updateDeleteProjectLink(false, ...ids);
  const insert: string[] = [];
  const diagrams = Object.values(Diagrams)
    .filter((diag) => diag.active)
    .map((diagram) => diagram.graph);
  if (ids.length === 0) return "";
  for (const id of ids) {
    checkLink(id);
    const linkIRI = qb.i(WorkspaceLinks[id].linkIRI);

    insertBody.push(
      qb.s(linkIRI, "rdf:type", "og:link"),
      qb.s(linkIRI, "og:id", qb.ll(id)),
      qb.s(linkIRI, "og:iri", qb.i(WorkspaceLinks[id].iri)),
      qb.s(linkIRI, "og:active", qb.ll(WorkspaceLinks[id].active)),
      qb.s(linkIRI, "og:source", qb.i(WorkspaceLinks[id].source)),
      qb.s(linkIRI, "og:target", qb.i(WorkspaceLinks[id].target)),
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
  }
  insert.push(
    ...diagrams.map((diagram) =>
      INSERT.DATA`${qb.g(diagram, insertBody)}`.build()
    ),
    INSERT.DATA`${qb.g(AppSettings.applicationContext, insertBody)}`.build()
  );

  return qb.combineQueries(...(del ? [deletes, ...insert] : [...insert]));
}

export function updateProjectLinkParallel(...ids: string[]): string[] {
  const insertBody: string[] = [];
  const insert: string[] = [];
  const diagrams = Object.values(Diagrams)
    .filter((diag) => diag.toBeDeleted)
    .map((diagram) => diagram.graph);
  if (ids.length === 0) return [];
  for (const id of ids) {
    checkLink(id);
    const linkIRI = qb.i(WorkspaceLinks[id].linkIRI);

    insertBody.push(
      qb.s(linkIRI, "rdf:type", "og:link"),
      qb.s(linkIRI, "og:id", qb.ll(id)),
      qb.s(linkIRI, "og:iri", qb.i(WorkspaceLinks[id].iri)),
      qb.s(linkIRI, "og:active", qb.ll(WorkspaceLinks[id].active)),
      qb.s(linkIRI, "og:source", qb.i(WorkspaceLinks[id].source)),
      qb.s(linkIRI, "og:target", qb.i(WorkspaceLinks[id].target)),
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
  }
  insert.push(
    ...diagrams.map((diagram) =>
      INSERT.DATA`${qb.g(diagram, insertBody)}`.build()
    ),
    INSERT.DATA`${qb.g(AppSettings.applicationContext, insertBody)}`.build()
  );
  return insert;
}

function checkLink(id: string) {
  if (!(id in WorkspaceLinks))
    throw new Error("Passed ID is not recognized as a relationship ID");
}
