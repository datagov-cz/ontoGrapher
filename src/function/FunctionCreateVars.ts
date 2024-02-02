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
  // https://www.w3.org/TR/sparql11-query/#rPN_CHARS_U
  const PN_CHARS_U =
    /[_A-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\u1000-\uEFFF]/gu;
  // https://www.w3.org/TR/sparql11-query/#rPLX
  const PLX = /(%([0-9A-F])([0-9A-F]))|(\\[-_~.!$&'()*+,;=/?#@%])/gi;
  // https://www.w3.org/TR/sparql11-query/#rPN_CHARS
  const PN_CHARS = new RegExp(
    `${PN_CHARS_U.source}|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]`,
    "gu"
  );
  // https://www.w3.org/TR/sparql11-query/#rPN_LOCAL
  const PN_LOCAL = new RegExp(
    `(${PN_CHARS_U.source}|:|[0-9]|${PLX.source})((${PN_CHARS.source}|.|:|${PLX.source})*(${PN_CHARS.source}|.|${PLX.source})?)`,
    "gui"
  );
  console.log(PN_LOCAL);
  return (
    (WorkspaceVocabularies[getVocabularyFromScheme(scheme)].namespace ||
      `${scheme}/${Locale[Environment.language].term}/`) +
    name
      .toLowerCase()
      .trim()
      .normalize()
      // .replace(/[\s\\/<>"{}|^`§]/gu, "-")
      // Replace any spaces with dashes
      // .replace(/[\p{Z}\p{C}]/gu, "-")
      // Replace anything not conforming to PN_LOCAL to dashes
      .replace(/[\p{Z}\p{C}]/g, "-")
      // Remove trailing dashes
      .replace(/-*$/g, "")
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
    sourceLinks: [],
    targetLinks: [],
  };
}

export function addDiagram(
  name: string,
  open: boolean = true,
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
    open: open,
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
  if (source in WorkspaceElements && target in WorkspaceElements) {
    WorkspaceElements[source].sourceLinks.push(id);
    WorkspaceElements[target].targetLinks.push(id);
  }
}
