import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { processQuery, processTransaction } from "./TransactionInterface";
import { fetchConcepts, fetchVocabulary } from "../queries/get/FetchQueries";
import { getElementsConfig, getLinksConfig } from "../queries/get/InitQueries";
import {
  fetchReadOnlyTerms,
  fetchVocabularies,
} from "../queries/get/CacheQueries";
import { qb } from "../queries/QueryBuilder";
import { updateProjectElement } from "../queries/update/UpdateElementQueries";
import { deleteConcept, initElements } from "../function/FunctionEditVars";
import {
  updateDeleteProjectLink,
  updateProjectLink,
} from "../queries/update/UpdateLinkQueries";
import { initConnections } from "../function/FunctionRestriction";
import { insertNewCacheTerms } from "../function/FunctionCache";
import { addToFlexSearch } from "../function/FunctionCreateVars";

export async function getContext(
  contextIRI: string,
  contextEndpoint: string
): Promise<boolean> {
  await fetchVocabularies(
    AppSettings.contextEndpoint,
    AppSettings.cacheContext
  );
  const vocabularyQ = [
    "PREFIX owl: <http://www.w3.org/2002/07/owl#> ",
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ",
    "PREFIX termit: <http://onto.fel.cvut.cz/ontologies/application/termit/>",
    "PREFIX a-popis-dat-pojem: <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/>",
    "PREFIX dcterms: <http://purl.org/dc/terms/>",
    "select ?vocab ?scheme ?label ?title ?vocabLabel ?vocabIRI",
    "where {",
    "BIND(<" + contextIRI + "> as ?contextIRI) . ",
    "OPTIONAL {?contextIRI rdfs:label ?label. }",
    "OPTIONAL {?contextIRI dcterms:title ?title. }",
    "graph ?contextIRI {",
    "?vocab a <https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext> ",
    "filter not exists {?vocab a <https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext-pouze-pro-čtení>.}",
    "}",
    "graph ?vocab {",
    "?vocabIRI a a-popis-dat-pojem:slovník .",
    "?vocabIRI a-popis-dat-pojem:má-glosář ?scheme.",
    "?vocabIRI dcterms:title ?vocabLabel .",
    "}",
    "}",
  ].join(" ");
  const responseInit: { [key: string]: any }[] = await processQuery(
    contextEndpoint,
    vocabularyQ
  )
    .then((response) => response.json())
    .then((data) => {
      return data.results.bindings;
    })
    .catch(() => false);
  if (responseInit.length === 0) return false;
  let vocabularies: {
    [key: string]: {
      names: { [key: string]: string };
      terms: any;
      graph: string;
      glossary: string;
    };
  } = {};
  if (responseInit)
    for (const result of responseInit) {
      if (!(result.vocabIRI.value in vocabularies)) {
        vocabularies[result.vocabIRI.value] = {
          names: {},
          terms: {},
          graph: result.vocab.value,
          glossary: result.scheme.value,
        };
      }
      vocabularies[result.vocabIRI.value].names[result.vocabLabel["xml:lang"]] =
        result.vocabLabel.value;
      if (result.label)
        AppSettings.name[result.label["xml:lang"]] = result.label.value;
      if (result.title)
        AppSettings.name[result.title["xml:lang"]] = result.title.value;
    }
  await fetchVocabulary(
    Object.keys(vocabularies).map((vocab) => vocabularies[vocab].glossary),
    false,
    contextEndpoint
  ).catch(() => false);
  for (const vocab in vocabularies) {
    await fetchConcepts(
      contextEndpoint,
      vocabularies[vocab].glossary,
      vocabularies[vocab].terms,
      vocab,
      vocabularies[vocab].graph
    ).catch(() => false);
    WorkspaceVocabularies[vocab].readOnly = false;
    WorkspaceVocabularies[vocab].graph = vocabularies[vocab].graph;
    Object.assign(WorkspaceTerms, vocabularies[vocab].terms);
  }
  if (!(await getElementsConfig(AppSettings.contextEndpoint))) return false;
  if (!(await getLinksConfig(AppSettings.contextEndpoint))) return false;
  const missingTerms: string[] = Object.keys(WorkspaceElements).filter(
    (id) => !(id in WorkspaceTerms)
  );
  insertNewCacheTerms(
    await fetchReadOnlyTerms(AppSettings.contextEndpoint, missingTerms)
  );
  Object.keys(WorkspaceElements)
    .filter((id) => !(id in WorkspaceTerms))
    .forEach((id) => {
      // In all probability, the workspace has been modified outside of OG
      // *OR* OG deletes its terms incorrectly.
      console.error(
        `Term ${id} not found in vocabulary contexts nor cache contexts.`
      );
      deleteConcept(id);
    });
  if (
    !(await processTransaction(
      AppSettings.contextEndpoint,
      qb.constructQuery(updateProjectElement(false, ...initElements()))
    ))
  )
    return false;
  addToFlexSearch(...Object.keys(WorkspaceElements));
  const connections = initConnections(true);
  const connectionsToDelete = connections.filter(
    (link) => link in WorkspaceLinks
  );
  const connectionsToInitialize = connections.filter(
    (link) => !(link in WorkspaceLinks)
  );
  for (const id of connectionsToDelete) {
    // This is expected behaviour e.g. for imported diagrams,
    // if they have references to links that no longer exist in the data.
    console.warn(
      `Link ID ${id} ( ${WorkspaceLinks[id].source} -- ${WorkspaceLinks[id].iri} -> ${WorkspaceLinks[id].target} ) deactivated due its owl:Restriction counterpart(s) missing.`
    );
    WorkspaceLinks[id].active = false;
  }
  return await processTransaction(
    AppSettings.contextEndpoint,
    qb.constructQuery(
      updateProjectLink(false, ...connectionsToInitialize),
      updateDeleteProjectLink(...connectionsToDelete)
    )
  );
}
