import {
  AppSettings,
  CardinalityPool,
  Diagrams,
  Languages,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { initLanguageObject } from "./FunctionEditVars";
import { VocabularyNode } from "../datatypes/VocabularyNode";
import { LinkType, Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import {
  getLinkIRI,
  getNewDiagramContextIRI,
  getVocabularyFromScheme,
} from "./FunctionGetVars";
import { v4 as uuidv4 } from "uuid";
import {
  FlexDocumentIDTable,
  FlexDocumentSearch,
} from "../config/FlexDocumentSearch";

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
      `${scheme}/${Locale[AppSettings.defaultLanguage].terms}/`) +
    name
      .toLowerCase()
      .trim()
      .normalize()
      .replace(/[\s\\]/g, "-")
      .replace(/[(?&)"^<>]/g, "")
  );
}

export function getDomainOf(iriElem: string): string[] {
  let result = [];
  for (const iri in WorkspaceTerms) {
    if (WorkspaceTerms[iri].domain) {
      if (WorkspaceTerms[iri].domain === iriElem) {
        result.push(iri);
      }
    }
  }
  return result;
}

export function addToFlexSearch(...ids: string[]) {
  let numberID = Object.keys(FlexDocumentIDTable).length;
  for (const id of ids) {
    if (!(id in WorkspaceElements))
      throw new Error(`ID ${id} not recognized as an element ID.`);
    const iri = WorkspaceElements[id].iri;
    if (!(iri in WorkspaceTerms))
      throw new Error(`IRI ${iri} not recognized as a term in the workspace.`);
    FlexDocumentIDTable[numberID] = id;
    for (const lang of Object.keys(Languages)) {
      FlexDocumentSearch.add({
        id: numberID++,
        language: lang,
        selectedLabel:
          WorkspaceElements[id].selectedLabel[lang] ||
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
  const entries = Object.entries(FlexDocumentIDTable).filter(([key, value]) =>
    ids.includes(value)
  );
  entries.forEach(([key, value]) => {
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
    domain: undefined,
    range: undefined,
    types: types ? types : [],
    subClassOf: [],
    restrictions: [],
    active: true,
    topConcept: scheme,
  };
}

export function createCount(): { [key in Representation]: number } {
  return { [Representation.COMPACT]: 0, [Representation.FULL]: 0 };
}

export function addClass(
  id: string,
  iri: string,
  pkg: VocabularyNode,
  active: boolean = true
) {
  WorkspaceElements[id] = {
    iri: iri,
    connections: [],
    diagrams: [AppSettings.selectedDiagram],
    hidden: { [AppSettings.selectedDiagram]: true },
    position: { [AppSettings.selectedDiagram]: { x: 0, y: 0 } },
    vocabularyNode: pkg,
    active: active,
    selectedLabel: initLanguageObject(""),
  };
  pkg.elements.push(id);
}

export function addDiagram(
  name: string,
  active: boolean = true,
  representation: Representation = Representation.COMPACT,
  index: number,
  iri?: string,
  id?: string
): typeof Diagrams[number] {
  const diagramID = id ? id : uuidv4();
  return {
    name: name,
    active: active,
    origin: { x: 0, y: 0 },
    scale: 1,
    representation: representation,
    id: diagramID,
    iri: iri ? iri : getNewDiagramContextIRI(diagramID),
  };
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
    vertices: [],
    active: true,
    hasInverse: type !== LinkType.GENERALIZATION && iri in Links,
    linkIRI: getLinkIRI(id),
  };
}
