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
import { PackageNode } from "../datatypes/PackageNode";
import { LinkType, Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import { getVocabularyFromScheme } from "./FunctionGetVars";

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

export function addClass(
  id: string,
  iri: string,
  pkg: PackageNode,
  active: boolean = true
) {
  WorkspaceElements[id] = {
    iri: iri,
    connections: [],
    diagrams: [AppSettings.selectedDiagram],
    hidden: { [AppSettings.selectedDiagram]: true },
    position: { [AppSettings.selectedDiagram]: { x: 0, y: 0 } },
    package: pkg,
    active: active,
    selectedLabel: initLanguageObject(""),
  };
  pkg.elements.push(id);
}

export function addDiagram(
  name: string,
  active: boolean = true,
  representation: Representation = Representation.FULL
): typeof Diagrams[number] {
  return {
    name: name,
    active: active,
    origin: { x: 0, y: 0 },
    scale: 1,
    representation: representation,
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
  };
}
