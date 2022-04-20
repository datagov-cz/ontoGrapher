import { AppSettings } from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { parsePrefix } from "../../function/FunctionEditVars";
import { Environment } from "../../config/Environment";

export function updateWorkspaceContext(): string {
  const projIRI = AppSettings.applicationContext;

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

  const insertVocabularyContext = AppSettings.contextIRIs.map((contextIRI) =>
    INSERT.DATA`${qb.g(contextIRI, [
      qb.s(
        qb.i(contextIRI),
        qb.i(parsePrefix("a-popis-dat-pojem", "má-aplikační-kontext")),
        qb.i(projIRI)
      ),
    ])}`.build()
  );

  const del = DELETE`${qb.g(projIRI, [qb.s(qb.i(projIRI), "?p", "?o")])}`
    .WHERE`${qb.g(projIRI, [qb.s(qb.i(projIRI), "?p", "?o")])}`.build();

  return qb.combineQueries(del, insertAppContext, ...insertVocabularyContext);
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
