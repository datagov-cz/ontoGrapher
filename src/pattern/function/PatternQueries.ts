import * as N3 from "n3";
import { Quad } from "n3";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { processQuery } from "../../interface/TransactionInterface";
import { isElementHidden } from "../../function/FunctionElem";
import { Environment } from "../../config/Environment";

//TODO: implement pattern & instance loading
//TODO: implement algo1 contact
//TODO: implement algo2 contact
//TODO: implement algo3 contact
//TODO: implement algo4 contact
//TODO: implement algo5 contact
//TODO: implement algo6 contact
//TODO: implement algo7 contact
//TODO: implement algo8 contact
function returnPatterns(quads: Quad[]) {}

export async function getAllPatterns(): Promise<string[]> {
  return [];
}

// export function getPattern(iri: string) {
//   fetch(`${Environment.pattern}/template?iri=${iri}`, {
//     method: "GET",
//   })
//     .then((r) => r.text())
//     .then((text) => {
//       const parser = new N3.Parser();
//       const quads: Quad[] = parser.parse(text);
//       const pattern: Pattern = {
//         title: "",
//         author: "",
//         date: "",
//         description: "",
//       };
//       for (const quad of quads) {
//         if (quad.predicate.value === parsePrefix("dc", "title")) {
//           pattern.title = quad.object.value;
//         }
//         if (quad.predicate.value === parsePrefix("dc", "creator")) {
//           pattern.author = quad.object.value;
//         }
//         if (quad.predicate.value === parsePrefix("ottr", "parameters")) {
//         }
//         if (quad.predicate.value === parsePrefix("ottr", "pattern")) {
//         }
//       }
//     });
// }
const defaultQuery = "";

export async function searchPatterns(query: string = defaultQuery) {
  fetch(`${Environment.pattern}/filter`, {
    method: "POST",
    body: query,
  })
    .then((r) => r.text())
    .then((text) => {
      const parser = new N3.Parser();
      const quads: Quad[] = parser.parse(text);
      returnPatterns(quads);
    });
}

export async function submitPattern(query: string): Promise<boolean> {
  return await fetch(`${Environment.pattern}/pattern`, {
    method: "POST",
    body: query,
  }).then((r) => r.ok);
}

async function getModel(terms: string[], diagram?: string): Promise<string> {
  const store = new N3.Writer();
  let query = "";
  if (diagram) {
    query =
      "select ?s ?p ?o where {" +
      "graph ?graph {" +
      "?s ?p ?o. }" +
      `values ?graph {<${Object.values(WorkspaceVocabularies)
        .filter((vocab) => !vocab.readOnly)
        .map((vocab) => vocab.graph)
        .join("> <")}>} }` +
      `values ?s {<${Object.keys(WorkspaceElements)
        .filter((elem) => isElementHidden(elem, diagram))
        .join("> <")}>}`;
  } else {
    query =
      "select ?s ?p ?o where {" +
      "graph ?graph {" +
      "?s ?p ?o. }" +
      `values ?graph {<${Object.values(WorkspaceVocabularies)
        .filter((vocab) => !vocab.readOnly)
        .map((vocab) => vocab.graph)
        .join("> <")}>} }`;
  }
  await processQuery(AppSettings.contextEndpoint, query, true)
    .then((r) => r.json())
    .then((json) => {
      // for (const result of json.result.bindings) {
      //   let object = undefined;
      //   switch (result.o.type) {
      //     case "uri":
      //       object = namedNode(result.o.value);
      //       break;
      //     case "literal":
      //       object = literal(result.o.value, namedNode(result.o.datatype));
      //       break;
      //     case "bnode":
      //       object = blankNode(result.o.value);
      //   }
      //   if (object)
      //     store.addQuad(
      //       new N3.Quad(
      //         namedNode(result.s.value),
      //         namedNode(result.p.value),
      //         object,
      //         namedNode(result.graph.value)
      //       )
      //     );
    });
  let r = "";
  store.end((error, result) => (r = result));
  return r;
}

export async function callRefactorAlgorithm(diagram?: string) {
  const r = await getModel([], diagram);
  return await fetch(`${Environment.pattern}/refactor`, {
    method: "POST",
    body: r,
  }).then((r) => r.text());
}

export async function callCreationAlgorithm(diagram?: string) {
  const r = await getModel([], diagram);
  return await fetch(`${Environment.pattern}/create`, {
    method: "POST",
    body: r,
  }).then((r) => r.text());
}

export async function callSuggestionAlgorithm(
  terms: string[],
  diagram?: string
) {
  const r = await getModel(terms, diagram);
  return await fetch(`${Environment.pattern}/suggest`, {
    method: "POST",
    body: r,
  }).then((r) => r.json());
}

export async function callStatisticsAlgorithmOnPattern(iri: string) {}

export async function callStatisticsAlgorithmOnModel(iri: string) {}
