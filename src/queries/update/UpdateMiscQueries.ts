import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { AppSettings, Users } from "../../config/Variables";
import { processQuery } from "../../interface/TransactionInterface";
import { qb } from "../QueryBuilder";
import { Environment } from "./../../config/Environment";
import { Cardinality } from "../../datatypes/Cardinality";

function getUserSettings(): { [key: string]: string } {
  return {
    "og:viewColor": qb.ll(AppSettings.viewColorPool),
    "og:sourceCardinality1": qb.ll(
      AppSettings.defaultCardinalitySource.getFirstCardinality()
    ),
    "og:sourceCardinality2": qb.ll(
      AppSettings.defaultCardinalitySource.getSecondCardinality()
    ),
    "og:targetCardinality1": qb.ll(
      AppSettings.defaultCardinalityTarget.getFirstCardinality()
    ),
    "og:targetCardinality2": qb.ll(
      AppSettings.defaultCardinalityTarget.getSecondCardinality()
    ),
    "og:interfaceLanguage": qb.ll(AppSettings.interfaceLanguage),
    "og:canvasLanguage": qb.ll(AppSettings.canvasLanguage),
  };
}

export function updateUserSettings(): string {
  if (!Environment.auth) return "";
  const userGraph = Users[AppSettings.currentUser!].graph;
  const userIRI = AppSettings.currentUser!;
  const userSettings = getUserSettings();

  const insert = INSERT.DATA`${qb.g(
    userGraph,
    Object.keys(userSettings).map((po) =>
      qb.s(qb.i(userIRI), po, userSettings[po])
    )
  )}`.build();

  const delPredObjs = qb.g(
    userGraph,
    Object.keys(userSettings).map((po, i) => qb.s(qb.i(userIRI), po, `?v${i}`))
  );

  const del = DELETE`${delPredObjs}`.WHERE`${delPredObjs}`.build();
  return qb.combineQueries(del, insert);
}

export async function fetchUserSettings(): Promise<boolean> {
  if (!Environment.auth) return true;
  const userGraph = Users[AppSettings.currentUser!].graph;
  const userIRI = AppSettings.currentUser!;
  const query: string = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select * where {",
    `graph ${qb.i(userGraph)} {`,
    Object.keys(getUserSettings()).map((k) =>
      qb.s(qb.i(userIRI), k, `?${k.replace("og:", "")}`)
    ).join(`
  `),
    "}}",
  ].join(`
  `);
  return await processQuery(AppSettings.contextEndpoint, query)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.bindings.length === 0) return false;
      for (const result of data.results.bindings) {
        AppSettings.viewColorPool = result.viewColor.value;
        AppSettings.interfaceLanguage = result.interfaceLanguage.value;
        AppSettings.canvasLanguage = result.canvasLanguage.value;
        AppSettings.defaultCardinalitySource = new Cardinality(
          result.sourceCardinality1.value,
          result.sourceCardinality2.value,
          true
        );
        AppSettings.defaultCardinalityTarget = new Cardinality(
          result.targetCardinality1.value,
          result.targetCardinality2.value,
          true
        );
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
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
