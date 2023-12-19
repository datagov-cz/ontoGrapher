import { v4 as uuidv4 } from "uuid";
import { LinkType, Representation } from "../config/Enum";
import {
  FlexDocumentIDTable,
  FlexDocumentSearch,
} from "../config/FlexDocumentSearch";
import { Languages } from "../config/Languages";
import { Locale } from "../config/Locale";
import {
  AppSettings,
  CardinalityPool,
  Diagrams,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { initLanguageObject } from "./FunctionEditVars";
import {
  getOntographerLinkIRI,
  getNewDiagramContextIRI,
  getNewDiagramIRI,
  getVocabularyFromScheme,
} from "./FunctionGetVars";
import { Environment } from "../config/Environment";

export function createValues(
  values: { [key: string]: string[] },
  prefixes: { [key: string]: string }
) {
  let result: string[] = [];
  for (const key in values) {
    const prefix = prefixes[key];
    for (const val of values[key]) {
      result.push(prefix + val);
    }
  }
  return result;
}

export function createNewElemIRI(scheme: string, name: string): string {
  return (
    (WorkspaceVocabularies[getVocabularyFromScheme(scheme)].namespace ||
      `${scheme}/${Locale[Environment.language].term}/`) +
    name
      .toLowerCase()
      .trim()
      .normalize()
      .replace(/[\s\\]/g, "-")
      .replace(/[/]/g, encodeURIComponent("/"))
      .replace(/[(?&)"^<>]/g, "")
  );
}

export function addToFlexSearch(...ids: string[]) {
  let numberID = Object.keys(FlexDocumentIDTable).length;
  for (const iri of ids.filter((id) => WorkspaceElements[id].active)) {
    if (!(iri in WorkspaceElements))
      throw new Error(`ID ${iri} not recognized as an element ID.`);
    if (!(iri in WorkspaceTerms))
      throw new Error(`IRI ${iri} not recognized as a term in the workspace.`);
    FlexDocumentIDTable[numberID] = iri;
    for (const lang of Object.keys(Languages)) {
      FlexDocumentSearch.add({
        id: numberID++,
        language: lang,
        selectedLabel:
          WorkspaceElements[iri].selectedLabel[lang] ||
          WorkspaceTerms[iri].labels[lang],
        prefLabel: WorkspaceTerms[iri].labels[lang],
        altLabel: WorkspaceTerms[iri].altLabels
          .filter((alt) => alt.language === lang)
          .map((alt) => alt.label),
      });
    }
  }
}

export function removeFromFlexSearch(...ids: string[]) {
  const entries = Object.entries(FlexDocumentIDTable).filter(([_, value]) =>
    ids.includes(value)
  );
  entries.forEach(([key, _]) => {
    const num = parseInt(key, 10);
    FlexDocumentSearch.remove(num);
  });
}

export function addVocabularyElement(
  iri: string,
  scheme: string,
  types?: string[]
) {
  WorkspaceTerms[iri] = {
    labels: initLanguageObject(""),
    altLabels: [],
    definitions: initLanguageObject(""),
    inScheme: scheme,
    types: types ? types : [],
    subClassOf: [],
    restrictions: [],
    topConcept: scheme,
  };
}

export function addClass(id: string, active: boolean = true) {
  WorkspaceElements[id] = {
    hidden: { [AppSettings.selectedDiagram]: true },
    position: { [AppSettings.selectedDiagram]: { x: 0, y: 0 } },
    active: active,
    selectedLabel: initLanguageObject(""),
  };
}

export function addDiagram(
  name: string,
  active: boolean = true,
  representation: Representation = Representation.COMPACT,
  index?: number,
  iri?: string,
  id?: string,
  graph?: string,
  description?: string
): string {
  const diagramID = id ? id : uuidv4();
  const collaborators = [];
  if (AppSettings.currentUser) {
    collaborators.push(AppSettings.currentUser);
  }
  if (!index)
    index =
      Object.keys(Diagrams).length > 0
        ? Object.values(Diagrams).reduce((a, b) => (a.index > b.index ? a : b))
            .index + 1
        : 0;
  Diagrams[diagramID] = {
    name: name,
    active: active,
    origin: { x: 0, y: 0 },
    scale: 1,
    index: index,
    representation: representation,
    iri: iri ? iri : getNewDiagramIRI(diagramID),
    graph: graph ? graph : getNewDiagramContextIRI(diagramID),
    saved: false,
    description: description ? description : "",
    vocabularies: Object.keys(WorkspaceVocabularies).filter(
      (v) => !WorkspaceVocabularies[v].readOnly
    ),
    modifiedDate: new Date(),
    creationDate: new Date(),
    collaborators: collaborators,
    toBeDeleted: false,
  };
  return diagramID;
}

export function addLink(
  id: string,
  iri: string,
  source: string,
  target: string,
  type: number = LinkType.DEFAULT
) {
  WorkspaceLinks[id] = {
    iri: iri,
    source: source,
    target: target,
    sourceCardinality: CardinalityPool[0],
    targetCardinality: CardinalityPool[0],
    type: type,
    vertices: {},
    active: true,
    hasInverse: type !== LinkType.GENERALIZATION && iri in Links,
    linkIRI: getOntographerLinkIRI(id),
  };
}
