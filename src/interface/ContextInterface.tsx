import {
  AppSettings,
  Diagrams,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { processQuery, processTransaction } from "./TransactionInterface";
import {
  fetchRestrictions,
  fetchTerms,
  fetchVocabulary,
} from "../queries/get/FetchQueries";
import {
  getElementsConfig,
  getLinksConfig,
  getSettings,
} from "../queries/get/InitQueries";
import {
  fetchVocabularies,
  fetchVocabularyTermCount,
} from "../queries/get/CacheQueries";
import { qb } from "../queries/QueryBuilder";
import {
  updateProjectElement,
  updateProjectElementNames,
} from "../queries/update/UpdateElementQueries";
import {
  deleteConcept,
  initElements,
  parsePrefix,
} from "../function/FunctionEditVars";
import {
  updateDeleteProjectLink,
  updateProjectLink,
} from "../queries/update/UpdateLinkQueries";
import { initConnections } from "../function/FunctionRestriction";
import { insertNewCacheTerms } from "../function/FunctionCache";
import { addDiagram, addToFlexSearch } from "../function/FunctionCreateVars";
import { ContextLoadingStrategy, Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import { reconstructApplicationContextWithDiagrams } from "../queries/update/UpdateReconstructAppContext";
import { updateApplicationContext } from "../queries/update/UpdateMiscQueries";
import { updateDeleteDiagram } from "../queries/update/UpdateDiagramQueries";
import { CacheSearchVocabularies } from "../datatypes/CacheSearchResults";
import * as _ from "lodash";
import { callCriticalAlert } from "../config/CriticalAlertData";
import TableList from "../components/TableList";
import { Alert } from "react-bootstrap";
import { changeDiagrams } from "../function/FunctionDiagram";
import { isTermReadOnly } from "../function/FunctionGetVars";
import {
  isElementHidden,
  removeReadOnlyElement,
} from "../function/FunctionElem";
import { v4 as uuidv4 } from "uuid";
import { INSERT } from "@tpluscode/sparql-builder";

export function retrieveInfoFromURLParameters(): boolean {
  const isURL = require("is-url");
  const urlParams = new URLSearchParams(window.location.search);
  const URIContexts = urlParams.getAll("vocabulary");
  if (URIContexts.filter((context) => isURL(context)).length > 0) {
    for (const vocab of URIContexts)
      AppSettings.contextIRIs.push(decodeURIComponent(vocab));
    return true;
  } else {
    console.error("Unable to parse vocabulary IRI(s) from the URL.");
    return false;
  }
}

export async function updateContexts(): Promise<boolean> {
  const { strategy, contextsMissingAppContexts, contextsMissingAttachments } =
    await getSettings(AppSettings.contextEndpoint);
  if (!AppSettings.applicationContext)
    AppSettings.applicationContext = `${parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "aplikační-kontext"
    )}/${uuidv4()}/ontographer`;
  switch (strategy) {
    case ContextLoadingStrategy.RECONSTRUCT_WORKSPACE:
      const ret2 = await processTransaction(
        AppSettings.contextEndpoint,
        false,
        qb.constructQuery(await reconstructApplicationContextWithDiagrams())
      );
      if (!ret2) return false;
      break;
    case ContextLoadingStrategy.DEFAULT:
      break;
    default:
      return false;
  }
  if (AppSettings.initWorkspace) {
    const queries = [updateApplicationContext()];
    if (Object.keys(Diagrams).length === 0) {
      addDiagram(
        Locale[AppSettings.interfaceLanguage].untitled,
        true,
        Representation.COMPACT,
        0
      );
    }
    const ret = await processTransaction(
      AppSettings.contextEndpoint,
      false,
      qb.constructQuery(...queries)
    );
    if (!ret) return false;
  }
  AppSettings.selectedDiagram = Object.keys(Diagrams).reduce((a, b) =>
    Diagrams[a].index < Diagrams[b].index ? a : b
  );
  if (contextsMissingAppContexts.length > 1) {
    const ret = await processTransaction(
      AppSettings.contextEndpoint,
      false,
      qb.constructQuery(
        ...contextsMissingAppContexts.map((context) =>
          INSERT.DATA`
      ${qb.g(context, [
        qb.i(context),
        qb.i(parsePrefix("a-popis-dat-pojem", "má-aplikační-kontext")),
        qb.i(AppSettings.applicationContext),
      ])}
      `.build()
        )
      )
    );
    if (!ret) return false;
  }
  if (contextsMissingAttachments.length > 1) {
    const ret = await processTransaction(
      AppSettings.contextEndpoint,
      false,
      qb.constructQuery(
        ...contextsMissingAttachments.map((context) =>
          INSERT.DATA`
      ${qb.g(context, [
        qb.i(context),
        qb.i(parsePrefix("a-popis-dat-pojem", "má-přílohu")),
        qb.a(Object.values(Diagrams).map((diag) => qb.i(diag.iri))),
      ])}
      `.build()
        )
      )
    );
    if (!ret) return false;
  }
  return true;
}

export async function retrieveVocabularyData(): Promise<boolean> {
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
    "select ?contextIRI ?scheme ?vocabLabel ?vocabIRI",
    "where {",
    "graph ?contextIRI {",
    "?vocabIRI a a-popis-dat-pojem:slovník .",
    "?vocabIRI a-popis-dat-pojem:má-glosář ?scheme.",
    "?vocabIRI dcterms:title ?vocabLabel .",
    "}",
    `values ?contextIRI {<${AppSettings.contextIRIs.join("> <")}>}`,
    "}",
  ].join(`
  `);
  const vocabularies: {
    [key: string]: {
      names: { [key: string]: string };
      terms: typeof WorkspaceTerms;
      graph: string;
      glossary: string;
    };
  } = {};
  const responseInit: boolean = await processQuery(
    AppSettings.contextEndpoint,
    vocabularyQ
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.results.bindings.length === 0) return false;
      for (const result of data.results.bindings) {
        if (!(result.vocabIRI.value in vocabularies)) {
          vocabularies[result.vocabIRI.value] = {
            names: {},
            terms: {},
            graph: result.contextIRI.value,
            glossary: result.scheme.value,
          };
        }
        vocabularies[result.vocabIRI.value].names[
          result.vocabLabel["xml:lang"]
        ] = result.vocabLabel.value;
      }
      return true;
    })
    .catch(() => false);
  if (!responseInit) return false;
  await fetchVocabulary(
    Object.keys(vocabularies).map((vocab) => vocabularies[vocab].glossary),
    false,
    AppSettings.contextEndpoint
  ).catch(() => false);
  for (const vocab in vocabularies) {
    Object.assign(
      WorkspaceTerms,
      await fetchTerms(
        AppSettings.contextEndpoint,
        vocabularies[vocab].glossary,
        vocabularies[vocab].graph
      )
    );
    Object.assign(
      WorkspaceTerms,
      _.merge(
        WorkspaceTerms,
        await fetchRestrictions(
          AppSettings.contextEndpoint,
          WorkspaceTerms,
          vocabularies[vocab].glossary,
          vocabularies[vocab].graph
        )
      )
    );
    WorkspaceVocabularies[vocab].readOnly = false;
    WorkspaceVocabularies[vocab].graph = vocabularies[vocab].graph;
    Object.assign(WorkspaceTerms, vocabularies[vocab].terms);
  }
  const numberOfVocabularies = Object.keys(vocabularies).length;
  if (numberOfVocabularies === 1)
    AppSettings.name = Object.values(vocabularies)[0].names;
  else {
    //TODO: refactor to i18n instead
    for (const lang in AppSettings.name)
      AppSettings.name[lang] = `${Object.keys(vocabularies).length} ${
        Locale[AppSettings.interfaceLanguage][
          numberOfVocabularies >= 5
            ? "vocabulariesMorePlural"
            : "vocabulariesPlural"
        ]
      }`;
  }
  return true;
}

export async function retrieveContextData(): Promise<boolean> {
  const booleans = await Promise.all([
    getElementsConfig(AppSettings.contextEndpoint),
    getLinksConfig(AppSettings.contextEndpoint),
  ]);
  if (booleans.some((b) => !b)) return false;
  const missingTerms: string[] = Object.keys(WorkspaceElements).filter(
    (id) => !(id in WorkspaceTerms)
  );
  let newVocabularies: string[] = [];
  if (missingTerms.length > 0) {
    const terms = await fetchTerms(
      AppSettings.contextEndpoint,
      undefined,
      undefined,
      missingTerms,
      true
    );
    const restrictions = {};
    const functions = _.chunk(Object.keys(terms), 50).map(
      (chunk) =>
        function () {
          fetchRestrictions(
            AppSettings.contextEndpoint,
            _.pick(terms, chunk),
            undefined,
            undefined,
            [],
            false
          );
        }
    );
    while (functions.length > 0) {
      // This is not a pool by any means, but the workload is similar enough that the individual promises within each
      // "batch" finish at around the same time.
      await Promise.all(functions.splice(0, 3).map((f) => f()));
    }
    newVocabularies = insertNewCacheTerms(_.merge(terms, restrictions));
  }
  checkForObsoleteDiagrams();
  Object.keys(WorkspaceLinks)
    .filter((id) => {
      const iri = WorkspaceLinks[id].iri;
      return !(iri in WorkspaceTerms) && !(iri in Links);
    })
    .forEach((id) => {
      const iri = WorkspaceLinks[id].iri;
      // In all probability, the workspace has been modified outside of OG
      // *OR* OG deletes its terms (i.e. relationship types) incorrectly.
      console.warn(
        `Link ID ${id}'s type (${iri}) not found in vocabulary contexts nor cache contexts.`
      );
      WorkspaceLinks[id].active = false;
      if (iri in WorkspaceTerms) deleteConcept(iri);
    });
  Object.keys(WorkspaceElements)
    .filter((id) => !(id in WorkspaceTerms))
    .forEach((id) => {
      // In all probability, the workspace has been modified outside of OG
      // *OR* OG deletes its terms incorrectly.
      console.warn(
        `Term ${id} not found in vocabulary contexts nor cache contexts.`
      );
      deleteConcept(id);
    });
  const elements = initElements();
  addToFlexSearch(...Object.keys(WorkspaceElements));
  const connections = initConnections();
  for (const id of connections.del) {
    // This is expected behaviour e.g. for imported diagrams,
    // if they have references to links that no longer exist in the data.
    console.warn(
      `Link ID ${id} ( ${WorkspaceLinks[id].source} -- ${WorkspaceLinks[id].iri} -> ${WorkspaceLinks[id].target} ) deactivated due its owl:Restriction counterpart(s) missing.`
    );
    WorkspaceLinks[id].active = false;
  }
  const updates = await Promise.all([
    processTransaction(
      AppSettings.contextEndpoint,
      false,
      qb.constructQuery(updateProjectElementNames())
    ),
    processTransaction(
      AppSettings.contextEndpoint,
      false,
      qb.constructQuery(updateProjectElement(false, ...elements))
    ),
    processTransaction(
      AppSettings.contextEndpoint,
      false,
      qb.constructQuery(updateDeleteProjectLink(true, ...connections.del))
    ),
    fetchVocabularyTermCount(
      AppSettings.contextEndpoint,
      AppSettings.cacheContext,
      ...newVocabularies
    ),
  ]);
  if (updates.some((u) => !u)) return false;
  // These updates, if run in parallel, have the ability to DoS the DB - it has to run sequentially, unfortunately.
  // Such a large load is usually generated only on opening vocabularies for the first time, or a saving/loading error.
  return await processTransaction(
    AppSettings.contextEndpoint,
    false,
    ..._.chunk(connections.add, 25).map((chunk) =>
      qb.constructQuery(updateProjectLink(false, ...chunk))
    )
  );
}

function checkForObsoleteDiagrams() {
  const diagramsInCache = Object.keys(CacheSearchVocabularies).flatMap(
    (vocab) => CacheSearchVocabularies[vocab].diagrams
  );
  const diagramsWithVocabularies = Object.keys(CacheSearchVocabularies)
    .filter(
      (vocab) =>
        vocab in WorkspaceVocabularies && !WorkspaceVocabularies[vocab].readOnly
    )
    .flatMap((vocab) => CacheSearchVocabularies[vocab].diagrams);
  // Diagrams that
  // ( are in cache
  // *but* are not associated with write-enabled vocabularies present in the workspace )
  const diff = _.difference(diagramsInCache, diagramsWithVocabularies);
  const workspaceDiagrams = Object.values(Diagrams).map((diag) => diag.iri);
  // *and* are in the workspace
  // are to be deleted
  const diagrams = _.intersection(diff, workspaceDiagrams);
  if (diagrams.length > 0) {
    const diagramsToDelete = Object.keys(Diagrams).filter((diag) =>
      diagrams.includes(Diagrams[diag].iri)
    );
    callCriticalAlert({
      acceptFunction: async () => {
        const queries: string[] = [];
        queries.push(
          ...Object.keys(WorkspaceElements)
            .filter(
              (term) =>
                isTermReadOnly(term) &&
                Object.keys(WorkspaceElements[term].hidden).every(
                  (diag) =>
                    isElementHidden(term, diag) ||
                    diagramsToDelete.includes(diag)
                )
            )
            .flatMap((elem) => removeReadOnlyElement(elem))
        );
        for (const diag of diagramsToDelete) {
          Diagrams[diag].active = false;
          queries.push(updateDeleteDiagram(diag));
        }
        if (diagramsToDelete.length === workspaceDiagrams.length) {
          addDiagram(Locale[AppSettings.interfaceLanguage].untitled);
        }
        changeDiagrams();
        await processTransaction(
          AppSettings.contextEndpoint,
          false,
          qb.constructQuery(...queries)
        );
      },
      acceptLabel:
        Locale[AppSettings.interfaceLanguage]
          .obsoleteDiagramsAlertDeleteDiagrams,
      waitForFunctionBeforeModalClose: true,
      innerContent: (
        <div>
          <p>
            {Locale[AppSettings.interfaceLanguage].obsoleteDiagramsAlertIntro}
          </p>
          <TableList>
            {diagramsToDelete.map((diag) => (
              <tr key={diag}>
                <td key={diag}>{Diagrams[diag].name}</td>
              </tr>
            ))}
          </TableList>
          <Alert variant={"primary"}>
            {Locale[AppSettings.interfaceLanguage].obsoleteDiagramsAlertInfo}
          </Alert>
        </div>
      ),
    });
  }
}
