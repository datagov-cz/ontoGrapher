import * as _ from "lodash";
import { Alert } from "react-bootstrap";
import TableList from "../components/TableList";
import { callCriticalAlert } from "../config/CriticalAlertData";
import { MainViewMode } from "../config/Enum";
import { Locale } from "../config/Locale";
import { StoreSettings } from "../config/Store";
import {
  AppSettings,
  Diagrams,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { CacheSearchVocabularies } from "../datatypes/CacheSearchResults";
import { insertNewCacheTerms } from "../function/FunctionCache";
import { addToFlexSearch } from "../function/FunctionCreateVars";
import {
  deleteConcept,
  initElements,
  parsePrefix,
} from "../function/FunctionEditVars";
import {
  isElementHidden,
  removeReadOnlyElement,
} from "../function/FunctionElem";
import { isTermReadOnly } from "../function/FunctionGetVars";
import { initConnections } from "../function/FunctionRestriction";
import { qb } from "../queries/QueryBuilder";
import {
  fetchReadOnlyTerms,
  fetchVocabularies,
} from "../queries/get/CacheQueries";
import {
  fetchRestrictions,
  fetchTerms,
  fetchUsers,
  fetchVocabulary,
} from "../queries/get/FetchQueries";
import {
  getElementsConfig,
  getLinksConfig,
  getSettings,
} from "../queries/get/InitQueries";
import { updateDeleteDiagram } from "../queries/update/UpdateDiagramQueries";
import { updateProjectElement } from "../queries/update/UpdateElementQueries";
import {
  updateDeleteProjectLink,
  updateProjectLinkParallel,
} from "../queries/update/UpdateLinkQueries";
import { processQuery, processTransaction } from "./TransactionInterface";

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
  const ret1 = await getSettings(AppSettings.contextEndpoint);
  await fetchUsers(
    ...Object.values(Diagrams)
      .flatMap((d) => d.collaborators)
      .map(
        (d) =>
          "https://slovník.gov.cz/uživatel/" +
          d.replaceAll("https://slovník.gov.cz/uživatel/", "")
      )
  );
  AppSettings.selectedDiagram = "";
  StoreSettings.update((s) => {
    s.selectedDiagram = AppSettings.selectedDiagram;
  });
  return ret1;
}

//TODO: hot
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
    "select ?contextIRI ?scheme ?vocabLabel ?vocabIRI ?changeContext",
    "where {",
    "graph ?contextIRI {",
    `OPTIONAL { ?vocabulary <${parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "má-kontext-sledování-změn"
    )}> ?changeContext. }`,
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
      changeContext?: string;
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
        if (result.changeContext)
          vocabularies[result.vocabIRI.value].changeContext =
            result.changeContext.value;
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
        vocab,
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
          vocab,
          vocabularies[vocab].graph
        )
      )
    );
    WorkspaceVocabularies[vocab].readOnly = false;
    WorkspaceVocabularies[vocab].graph = vocabularies[vocab].graph;
    if (vocabularies[vocab].changeContext)
      WorkspaceVocabularies[vocab].changeContext =
        vocabularies[vocab].changeContext;
    Object.assign(WorkspaceTerms, vocabularies[vocab].terms);
  }
  const numberOfVocabularies = Object.keys(vocabularies).length;
  if (numberOfVocabularies === 1)
    AppSettings.name = Object.values(vocabularies)[0].names;
  else {
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
  if (!(await getElementsConfig(AppSettings.contextEndpoint))) return false;
  if (!(await getLinksConfig(AppSettings.contextEndpoint))) return false;
  const missingTerms: string[] = Object.keys(WorkspaceElements).filter(
    (id) => !(id in WorkspaceTerms)
  );
  insertNewCacheTerms(
    await fetchReadOnlyTerms(AppSettings.contextEndpoint, missingTerms)
  );
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
  if (
    !(await processTransaction(
      AppSettings.contextEndpoint,
      qb.constructQuery(updateProjectElement(false, ...elements))
    ))
  )
    return false;
  addToFlexSearch(...Object.keys(WorkspaceElements));
  const connections = initConnections();
  for (const id of connections.del) {
    // This is expected behavior e.g. for imported diagrams,
    // if they have references to links that no longer exist in the data.
    console.warn(
      `Link ID ${id} ( ${WorkspaceLinks[id].source} -- ${WorkspaceLinks[id].iri} -> ${WorkspaceLinks[id].target} ) deactivated due to its statement counterpart(s) missing.`
    );
    WorkspaceLinks[id].active = false;
  }
  return await processTransaction(
    AppSettings.contextEndpoint,
    qb.constructQuery(updateDeleteProjectLink(true, ...connections.del)),
    ...updateProjectLinkParallel(...connections.add).map((t) =>
      qb.constructQuery(t)
    )
  );
}

export function checkForObsoleteDiagrams() {
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
          Diagrams[diag].toBeDeleted = true;
          queries.push(updateDeleteDiagram(diag));
        }
        AppSettings.selectedDiagram = "";
        StoreSettings.update((s) => {
          s.mainViewMode = MainViewMode.CANVAS;
          s.selectedDiagram = "";
        });
        await processTransaction(
          AppSettings.contextEndpoint,
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
          <Alert variant={"warning"}>
            {Locale[AppSettings.interfaceLanguage].obsoleteDiagramsAlertInfo}
          </Alert>
        </div>
      ),
    });
  }
}
