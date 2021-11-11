import { AppSettings, WorkspaceElements } from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { getWorkspaceContextIRI } from "../../function/FunctionGetVars";
import { parsePrefix } from "../../function/FunctionEditVars";
import { Environment } from "../../config/Environment";

export function updateWorkspaceContext(): string {
  const projIRI = getWorkspaceContextIRI();

  const insertAppContext = INSERT.DATA`${qb.g(projIRI, [
    qb.s(qb.i(projIRI), "og:viewColor", qb.ll(AppSettings.viewColorPool)),
    qb.s(
      qb.i(projIRI),
      "og:contextVersion",
      qb.ll(AppSettings.latestContextVersion)
    ),
    qb.s(
      qb.i(projIRI),
      qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "má-id-aplikace")),
      qb.ll(Environment.id)
    ),
  ])}`.build();

  const insertMetadataContext = INSERT.DATA`${qb.g(AppSettings.contextIRI, [
    qb.s(
      qb.i(AppSettings.contextIRI),
      qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "odkazuje-na-kontext")),
      qb.i(projIRI)
    ),
  ])}`.build();

  const del = DELETE`${qb.g(projIRI, [qb.s(qb.i(projIRI), "?p", "?o")])}`
    .WHERE`${qb.g(projIRI, [qb.s(qb.i(projIRI), "?p", "?o")])}`.build();

  return qb.combineQueries(del, insertAppContext, insertMetadataContext);
}

export function updateDeleteTriples(
  iri: string,
  contexts: string[],
  subject: boolean,
  object: boolean,
  blanks: boolean
): string {
  const deletes = [];
  if (blanks)
    deletes.push(
      DELETE`${[
        "GRAPH ?graph {",
        qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
        qb.s("?b", "?p", "?o"),
        "}",
      ].join(" ")}`.WHERE`${[
        "GRAPH ?graph {",
        qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
        qb.s("?b", "?p", "?o"),
        "filter(isBlank(?b)).}",
        "values ?graph {" + contexts.map((c) => `<${c}>`).join(" ") + "}",
      ].join(" ")}`.build()
    );
  if (subject)
    deletes.push(
      DELETE`${["GRAPH ?graph {", qb.s(qb.i(iri), "?p", "?o"), "}"].join(" ")}`
        .WHERE`${[
        "GRAPH ?graph {",
        qb.s(qb.i(iri), "?p", "?o"),
        "} values ?graph {" + contexts.map((c) => `<${c}>`).join(" ") + "}",
      ].join(" ")}`.build()
    );
  if (object)
    deletes.push(
      DELETE`${["GRAPH ?graph {", qb.s("?s", "?p", qb.i(iri)), "}"].join(" ")}`
        .WHERE`${[
        "GRAPH ?graph {",
        qb.s("?s", "?p", qb.i(iri)),
        "} values ?graph {" + contexts.map((c) => `<${c}>`).join(" ") + "}",
      ].join(" ")}`.build()
    );
  return qb.combineQueries(...deletes);
}

export function updateAddTermsToWorkspace(ids: string[]) {
  const projIRI = getWorkspaceContextIRI();
  const insert = INSERT.DATA`${qb.g(projIRI, [
    qb.s(
      qb.i(projIRI),
      "og:element",
      qb.a(ids.map((id) => qb.i(WorkspaceElements[id].iri)))
    ),
    ...ids.map((id) =>
      qb.s(qb.i(WorkspaceElements[id].iri), "og:id", qb.ll(id))
    ),
  ])}`.build();
  return qb.combineQueries(insert);
}

export function updateRemoveTermsFromWorkspace(ids: string[]) {
  const del = DELETE.DATA`${qb.g(getWorkspaceContextIRI(), [
    qb.s(
      qb.i(getWorkspaceContextIRI()),
      "og:element",
      qb.a(ids.map((id) => qb.i(WorkspaceElements[id].iri)))
    ),
    ...ids.map((id) =>
      qb.s(qb.i(WorkspaceElements[id].iri), "og:id", qb.ll(id))
    ),
  ])}`.build();
  return qb.combineQueries(del);
}
