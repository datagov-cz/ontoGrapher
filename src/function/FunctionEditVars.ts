import * as _ from "lodash";
import { LinkType } from "../config/Enum";
import { Languages } from "../config/Languages";
import { Locale } from "../config/Locale";
import {
  AppSettings,
  Diagrams,
  Links,
  Prefixes,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { Cardinality } from "../datatypes/Cardinality";
import { LinkConfig } from "../queries/update/UpdateConnectionQueries";
import { LanguageObject } from "./../config/Languages";
import { addClass } from "./FunctionCreateVars";
import { filterEquivalent } from "./FunctionEquivalents";
import {
  getActiveSourceConnections,
  getActiveTargetConnections,
  getLocalStorageKey,
  getVocabularyFromScheme,
  loadDefaultCardinality,
} from "./FunctionGetVars";
import { graph } from "../graph/Graph";
import { updateDeleteTriples } from "../queries/update/UpdateMiscQueries";

export function trimLanguageObjectInput(input: LanguageObject): LanguageObject {
  return _.mapValues(input, (i) => i.trim());
}

export function getStereotypeList(iris: string[], language: string): string[] {
  const result: string[] = [];
  iris.forEach((iri) => {
    if (iri in Stereotypes) {
      result.push(Stereotypes[iri].labels[language]);
    }
  });
  return result;
}

export function initVars() {
  loadLanguages();
  loadDefaultCardinality();
  initProjectSettings();
  loadUML();
}

export function loadUML() {
  const scheme = AppSettings.ontographerContext + "/uml";

  WorkspaceVocabularies[scheme] = {
    labels: initLanguageObject("UML"),
    readOnly: true,
    namespace: "",
    graph: AppSettings.ontographerContext,
    color: "#FFF",
    glossary: scheme,
  };

  for (const type in LinkConfig) {
    const intType = parseInt(type, 10);
    if (intType !== LinkType.DEFAULT) {
      Links[scheme + "/generalization"] = {
        subClassOfDomain: [],
        subClassOfRange: [],
        labels: LinkConfig[type].labels,
        definitions: initLanguageObject(""),
        inScheme: scheme,
        type: intType,
        domain: "",
        range: "",
        inverseOf: "",
        defaultSourceCardinality: new Cardinality("", ""),
        defaultTargetCardinality: new Cardinality("", ""),
      };
    }
  }
}

export function cutoffString(input: string, cutoff: number): string {
  return input.length >= cutoff ? input.substring(0, cutoff) + "..." : input;
}

export function loadLanguages() {
  const navigatorLanguage = navigator.language.slice(0, 2);
  const interfaceLanguage =
    localStorage.getItem(getLocalStorageKey("interfaceLanguage")) ||
    navigatorLanguage;
  const canvasLanguage =
    localStorage.getItem(getLocalStorageKey("canvasLanguage")) ||
    navigatorLanguage;
  AppSettings.interfaceLanguage =
    interfaceLanguage in Languages ? interfaceLanguage : "en";
  AppSettings.canvasLanguage =
    canvasLanguage in Languages ? canvasLanguage : "en";
}

export function initProjectSettings() {
  AppSettings.name = initLanguageObject(
    Locale[AppSettings.interfaceLanguage].untitledProject
  );
  AppSettings.description = initLanguageObject("");
}

export function initLanguageObject(def: string): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  for (const code in Languages) {
    result[code] = def;
  }
  return result;
}

export function parsePrefix(
  prefix: keyof typeof Prefixes,
  name: string
): string {
  return Prefixes[prefix] + name;
}

export function removeNewlines(str: string): string {
  return str.replaceAll(/\r?\n|\r/g, "");
}

export function deleteConcept(id: string): string[] {
  let queries: string[] = [];
  for (const connection of getActiveSourceConnections(id)) {
    WorkspaceLinks[connection].active = false;
    queries.push(
      updateDeleteTriples(
        WorkspaceLinks[connection].linkIRI,
        Object.values(Diagrams).map((diag) => diag.graph),
        true,
        false,
        false
      )
    );
  }
  for (const connection of getActiveTargetConnections(id)) {
    WorkspaceLinks[connection].active = false;
    queries.push(
      updateDeleteTriples(
        WorkspaceLinks[connection].linkIRI,
        Object.values(Diagrams).map((diag) => diag.graph),
        true,
        false,
        false
      )
    );
  }
  if (graph.getCell(id)) {
    graph.removeCells([graph.getCell(id)]);
  }
  WorkspaceElements[id].active = false;
  return queries;
}

export function setElementShape(
  elem: joint.dia.Element,
  width: number,
  height: number
) {
  const types = WorkspaceTerms[elem.id].types;
  elem.attr({
    bodyBox: { display: "none" },
    bodyEllipse: { display: "none" },
    bodyTrapezoid: { display: "none" },
    bodyDiamond: { display: "none" },
    label: { color: "black" },
  });
  if (
    filterEquivalent(types, parsePrefix("z-sgov-pojem", "typ-objektu")) ||
    filterEquivalent(types, parsePrefix("v-sgov-pojem", "typ-subjektu-práva"))
  ) {
    elem.attr({
      bodyBox: {
        display: "block",
        width: width,
        height: height,
        strokeDasharray: "none",
        stroke: "black",
        fill: WorkspaceVocabularies[
          getVocabularyFromScheme(WorkspaceTerms[elem.id].inScheme)
        ].color,
      },
    });
  } else if (
    filterEquivalent(types, parsePrefix("z-sgov-pojem", "typ-vlastnosti"))
  ) {
    elem.attr({
      bodyEllipse: {
        display: "block",
        rx: width * (3 / 5),
        ry: height * (2 / 3),
        cx: width / 2,
        cy: height / 2,
        stroke: "black",
        fill: WorkspaceVocabularies[
          getVocabularyFromScheme(WorkspaceTerms[elem.id].inScheme)
        ].color,
      },
    });
  } else if (
    filterEquivalent(types, parsePrefix("z-sgov-pojem", "typ-vztahu"))
  ) {
    elem.attr({
      bodyDiamond: {
        display: "block",
        points: `${width / 2},${-(height / 2)} ${width * (9 / 8)},${
          height / 2
        } ${width / 2},${height * (3 / 2)} ${-(width / 8)},${height / 2}`,
        stroke: "black",
        fill: WorkspaceVocabularies[
          getVocabularyFromScheme(WorkspaceTerms[elem.id].inScheme)
        ].color,
      },
    });
  } else if (
    filterEquivalent(types, parsePrefix("z-sgov-pojem", "typ-události"))
  ) {
    elem.attr({
      bodyTrapezoid: {
        display: "block",
        points: `20,0 ${width - 20},0 ${width},${height} 0,${height}`,
        stroke: "black",
        fill: WorkspaceVocabularies[
          getVocabularyFromScheme(WorkspaceTerms[elem.id].inScheme)
        ].color,
      },
    });
  } else {
    elem.attr({
      bodyBox: {
        display: "block",
        width: width,
        height: height,
        strokeDasharray: "10,10",
        stroke: "grey",
        fill: WorkspaceVocabularies[
          getVocabularyFromScheme(WorkspaceTerms[elem.id].inScheme)
        ].color,
      },
      label: { color: "grey" },
    });
  }
}

export function initElements(replaceInactive: boolean = false) {
  const ids: string[] = [];
  for (const iri in WorkspaceTerms) {
    if (
      !(iri in WorkspaceElements) ||
      (replaceInactive && !WorkspaceElements[iri].active)
    ) {
      addClass(iri);
      ids.push(iri);
    }
  }
  return ids;
}
