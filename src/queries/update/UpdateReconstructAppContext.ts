import { AppSettings } from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { initElements, parsePrefix } from "../../function/FunctionEditVars";
import { getWorkspaceContextIRI } from "../../function/FunctionGetVars";
import { processQuery } from "../../interface/TransactionInterface";
import { updateWorkspaceContext } from "./UpdateMiscQueries";
import { updateProjectElement } from "./UpdateElementQueries";

export async function reconstructApplicationContextWithDiagrams(): Promise<string> {
  const linkPredicates = [
    parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "odkazuje-na-assetový-kontext"
    ),
    parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "odkazuje-na-přílohový-kontext"
    ),
  ];
  const diagramRetrievalQuery = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram ?graph where {",
    "BIND(<" + AppSettings.contextIRI + "> as ?metaContext).",
    "graph ?metaContext {",
    `?metaContext ?linkPredicate ?graph .`,
    `values ?linkPredicate { <${linkPredicates.join("> <")}> }`,
    "}",
    "graph ?graph {",
    "?diagram a og:diagram.",
    "}",
    "}",
  ].join(`
  `);
  const diagramIRIs: string[] = await processQuery(
    AppSettings.contextEndpoint,
    diagramRetrievalQuery
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const result = [];
      for (const diag of data.results.bindings) {
        result.push(diag.diagram.value);
      }
      return result;
    })
    .catch((e) => {
      console.error(e);
      return [];
    });
  if (diagramIRIs) {
    const transferQuery = diagramIRIs.map(
      (iri) => `add <${iri}> to <${getWorkspaceContextIRI()}>`
    ).join(`;
    `);
    return qb.combineQueries(
      updateWorkspaceContext(),
      transferQuery,
      updateProjectElement(false, ...initElements())
    );
  } else return "";
}
