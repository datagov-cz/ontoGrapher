import {
  AppSettings,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { parsePrefix } from "./FunctionEditVars";
import { ColorPool } from "../config/visual/ColorPool";
import { Shapes } from "../config/visual/Shapes";
import * as joint from "jointjs";
import { LinkConfig } from "../config/logic/LinkConfig";
import { mvp1IRI, mvp2IRI } from "./FunctionGraph";
import { Cardinality } from "../datatypes/Cardinality";
import { CacheSearchVocabularies } from "../datatypes/CacheSearchResults";
import { enChangelog } from "../locale/enchangelog";
import { Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import { en } from "../locale/en";
import { LocalStorageVars } from "../config/LocalStorageVars";
import { Languages } from "../config/Languages";

export function getVocabElementByElementID(id: string): { [key: string]: any } {
  return WorkspaceTerms[id];
}

export function getLinkOrVocabElem(iri: string): { [key: string]: any } {
  return iri in Links ? Links[iri] : WorkspaceTerms[iri];
}

export function getLocalStorageKey(name: LocalStorageVars) {
  return `ontoGrapher:${name}`;
}

export function getLabelOrBlank(
  labels: { [key: string]: string },
  language: string
): string {
  return labels[language] && labels[language].length > 0
    ? labels[language]
    : "<blank>";
}

export function getNameOrBlank(name: string) {
  return name ? name : "<blank>";
}

export function checkLabels() {
  for (const link in Links) {
    for (const lang in Languages) {
      if (!Links[link].labels[lang]) {
        const label = link.lastIndexOf("/");
        Links[link].labels[lang] = link.substring(label + 1);
      }
    }
    Links[link].subClassOfDomain = [];
    Links[link].subClassOfRange = [];
    Links[link].defaultSourceCardinality = new Cardinality(
      AppSettings.defaultCardinalitySource.getFirstCardinality(),
      AppSettings.defaultCardinalitySource.getSecondCardinality()
    );
    Links[link].defaultTargetCardinality = new Cardinality(
      AppSettings.defaultCardinalityTarget.getFirstCardinality(),
      AppSettings.defaultCardinalityTarget.getSecondCardinality()
    );
  }
}

export function setSchemeColors(pool: string) {
  Object.keys(WorkspaceVocabularies).forEach((scheme, i) => {
    WorkspaceVocabularies[scheme].color =
      ColorPool[pool].colors[i % ColorPool[pool].colors.length];
  });
}

export function getExpressionByRepresentation(
  expressions: { [key in Representation]: keyof typeof en },
  representation: Representation = AppSettings.representation,
  language: string = AppSettings.interfaceLanguage
) {
  return Locale[language][expressions[representation]];
}

export function isConnectionWithTrope(link: string, id: string): boolean {
  if (
    WorkspaceLinks[link].iri === parsePrefix("z-sgov-pojem", "má-vlastnost") &&
    WorkspaceLinks[link].source === id &&
    WorkspaceLinks[link].active &&
    !WorkspaceElements[WorkspaceLinks[link].target].hidden[
      AppSettings.selectedDiagram
    ]
  ) {
    return true;
  } else if (
    WorkspaceLinks[link].iri === parsePrefix("z-sgov-pojem", "je-vlastností") &&
    WorkspaceLinks[link].target === id &&
    WorkspaceLinks[link].active &&
    !WorkspaceElements[WorkspaceLinks[link].source].hidden[
      AppSettings.selectedDiagram
    ]
  ) {
    return true;
  }
  return false;
}

export function getNewLink(type?: number, id?: string): joint.dia.Link {
  let link = new joint.shapes.standard.Link({ id: id });
  if (type && type in LinkConfig) {
    link = LinkConfig[type].newLink(id);
  }
  return link;
}

export function loadDefaultCardinality() {
  const defaultCardinalitySource = localStorage.getItem(
    getLocalStorageKey("defaultCardinalitySource")
  );
  const defaultCardinalityTarget = localStorage.getItem(
    getLocalStorageKey("defaultCardinalityTarget")
  );
  if (defaultCardinalitySource) {
    const sourceJSON = JSON.parse(defaultCardinalitySource);
    AppSettings.defaultCardinalitySource = new Cardinality(
      sourceJSON.first,
      sourceJSON.second
    );
  }

  if (defaultCardinalityTarget) {
    const targetJSON = JSON.parse(defaultCardinalityTarget);
    AppSettings.defaultCardinalityTarget = new Cardinality(
      targetJSON.first,
      targetJSON.second
    );
  }
}

export function getElementShape(id: string | number): string {
  const types = WorkspaceTerms[id].types;
  for (const type in Shapes) {
    if (types.includes(type)) return Shapes[type].body;
  }
  return Shapes["default"].body;
}

export function getActiveToConnections(iri: string): string[] {
  return Object.keys(WorkspaceLinks).filter(
    (id) => WorkspaceLinks[id].source === iri && WorkspaceLinks[id].active
  );
}

export function getUnderlyingFullConnections(
  id: string
): { src: string; tgt: string } | undefined {
  const iri = WorkspaceLinks[id].iri;
  if (!(iri in WorkspaceTerms)) return;
  const sourceElem = WorkspaceLinks[id].source;
  const targetElem = WorkspaceLinks[id].target;
  if (sourceElem && targetElem) {
    const preds = Object.keys(WorkspaceElements).filter((id) => id === iri);
    for (const pred of preds) {
      const connections = getActiveToConnections(pred);
      const sourceLink = Object.keys(WorkspaceLinks).find(
        (id) =>
          connections.includes(id) &&
          WorkspaceLinks[id].iri === mvp1IRI &&
          WorkspaceLinks[id].target === sourceElem
      );
      const targetLink = Object.keys(WorkspaceLinks).find(
        (id) =>
          getActiveToConnections(pred).includes(id) &&
          WorkspaceLinks[id].iri === mvp2IRI &&
          WorkspaceLinks[id].target === targetElem
      );
      if (sourceLink && targetLink) return { src: sourceLink, tgt: targetLink };
    }
    return;
  }
}

export function getElementVocabulary(elemIRI: string): string {
  if (!!WorkspaceElements[elemIRI].vocabulary)
    return WorkspaceElements[elemIRI].vocabulary!;
  return getVocabularyFromScheme(WorkspaceTerms[elemIRI].inScheme);
}

export function getVocabularyFromScheme(scheme: string): string {
  const vocab =
    Object.keys(WorkspaceVocabularies).find(
      (vocab) => WorkspaceVocabularies[vocab].glossary === scheme
    ) ||
    Object.keys(CacheSearchVocabularies).find(
      (vocab) => CacheSearchVocabularies[vocab].glossary === scheme
    );
  if (vocab) return vocab;
  else throw new Error("Vocabulary IRI not found");
}

/**
 * Retrieves the day and month of the last entry in the changelog to display in the button.
 */
export function getLastChangeDay() {
  const year: string = Object.keys(enChangelog).reverse()[0];
  const month: string = Object.keys(enChangelog[year]).reverse()[0];
  const day: string = Object.keys(enChangelog[year][month]).reverse()[0];
  return `${day}. ${month}. ${year}`;
}

export function getLinkIRI(linkID: string) {
  return `${AppSettings.ontographerContext}/link/instance-${linkID}`;
}

export function getNewDiagramContextIRI(id: string) {
  return parsePrefix(
    "d-sgov-pracovní-prostor-pojem",
    `přílohový-kontext/instance-${id}`
  );
}

export function getNewDiagramIRI(id: string): string {
  return parsePrefix("slovník-gov", `příloha/instance-${id}`);
}

export function isLabelBlank(label: string) {
  return label === "<blank>";
}

export function isTermReadOnly(iri: string) {
  return (
    iri in WorkspaceTerms &&
    WorkspaceVocabularies[getElementVocabulary(iri)].readOnly
  );
}

export function getParentOfIntrinsicTropeType(tropeID: string) {
  const connections = Object.keys(WorkspaceLinks).filter((link) => {
    return (
      ([
        parsePrefix("z-sgov-pojem", "je-vlastností"),
        parsePrefix("z-sgov-pojem", "má-vlastnost"),
      ].includes(WorkspaceLinks[link].iri) &&
        WorkspaceLinks[link].active &&
        WorkspaceLinks[link].source === tropeID) ||
      WorkspaceLinks[link].target === tropeID
    );
  });
  return connections.map((link) =>
    WorkspaceLinks[link].source === tropeID
      ? WorkspaceLinks[link].target
      : WorkspaceLinks[link].source
  );
}

export function getIntrinsicTropeTypeIDs(
  id: string,
  returnLinkIDs: boolean = false
) {
  return Object.keys(WorkspaceLinks)
    .filter(
      (link) =>
        WorkspaceLinks[link].active &&
        WorkspaceLinks[link].source === id &&
        WorkspaceLinks[link].iri ===
          parsePrefix("z-sgov-pojem", "má-vlastnost") &&
        WorkspaceTerms[WorkspaceLinks[link].target].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
    )
    .map((link) => (returnLinkIDs ? link : WorkspaceLinks[link].target))
    .concat(
      Object.keys(WorkspaceLinks)
        .filter(
          (link) =>
            WorkspaceLinks[link].active &&
            WorkspaceLinks[link].target === id &&
            WorkspaceLinks[link].iri ===
              parsePrefix("z-sgov-pojem", "je-vlastností") &&
            WorkspaceTerms[WorkspaceLinks[link].source].types.includes(
              parsePrefix("z-sgov-pojem", "typ-vlastnosti")
            )
        )
        .map((link) => (returnLinkIDs ? link : WorkspaceLinks[link].source))
    );
}
