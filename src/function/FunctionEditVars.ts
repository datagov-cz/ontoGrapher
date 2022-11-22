import {
  AppSettings,
  Diagrams,
  Languages,
  Links,
  Prefixes,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { graph } from "../graph/Graph";
import { addClass, createCount } from "./FunctionCreateVars";
import { LinkConfig } from "../config/logic/LinkConfig";
import { LinkType, Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import { updateDeleteTriples } from "../queries/update/UpdateMiscQueries";
import { Cardinality } from "../datatypes/Cardinality";
import {
  getActiveToConnections,
  getLocalStorageKey,
  getVocabularyFromScheme,
  loadDefaultCardinality,
} from "./FunctionGetVars";
import { isElementVisible } from "./FunctionElem";

export function getName(element: string, language: string): string {
  if (element in Stereotypes) {
    return Stereotypes[element].labels[language];
  } else {
    return WorkspaceTerms[element].labels[language];
  }
}

export function getStereotypeList(iris: string[], language: string): string[] {
  let result: string[] = [];
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
    count: createCount(),
    glossary: scheme,
  };

  for (const type in LinkConfig) {
    const intType = parseInt(type, 10);
    if (intType !== LinkType.DEFAULT) {
      Links[scheme + "/" + LinkConfig[type].labels["en"]] = {
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

export function loadLanguages() {
  const json = require("../config/Languages.json");
  for (const code in json) {
    if (json.hasOwnProperty(code)) Languages[code] = json[code];
  }
  // TODO: redo in i18n
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
  for (const connection of getActiveToConnections(id)) {
    WorkspaceLinks[connection].active = false;
    queries.push(
      updateDeleteTriples(
        WorkspaceLinks[connection].linkIRI,
        [
          AppSettings.applicationContext,
          ...Object.values(Diagrams).map((diag) => diag.graph),
        ],
        true,
        false,
        false
      )
    );
  }
  const targets = Object.keys(WorkspaceLinks).filter(
    (link) => WorkspaceLinks[link].target === id
  );
  for (const connection of targets) {
    WorkspaceLinks[connection].active = false;
    queries.push(
      updateDeleteTriples(
        WorkspaceLinks[connection].linkIRI,
        [
          AppSettings.applicationContext,
          ...Object.values(Diagrams).map((diag) => diag.graph),
        ],
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
  if (types.includes(parsePrefix("z-sgov-pojem", "typ-objektu"))) {
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
  } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))) {
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
  } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))) {
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
  } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-události"))) {
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

export function changeVocabularyCount(
  vocabulary: string,
  changeFunction: (count: number) => number,
  ...terms: string[]
) {
  for (const term of terms) {
    WorkspaceVocabularies[vocabulary].count[Representation.FULL] =
      changeFunction(
        WorkspaceVocabularies[vocabulary].count[Representation.FULL]
      );
    if (isElementVisible(term, Representation.COMPACT))
      WorkspaceVocabularies[vocabulary].count[Representation.COMPACT] =
        changeFunction(
          WorkspaceVocabularies[vocabulary].count[Representation.COMPACT]
        );
  }
}
