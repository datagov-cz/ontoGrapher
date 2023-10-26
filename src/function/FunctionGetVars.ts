import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
import * as joint from "jointjs";
import { Representation } from "../config/Enum";
import { Languages } from "../config/Languages";
import { LocalStorageVars } from "../config/LocalStorageVars";
import { Locale } from "../config/Locale";
import {
  AppSettings,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { ColorPool } from "../config/visual/ColorPool";
import { Shapes } from "../config/visual/Shapes";
import { CacheSearchVocabularies } from "../datatypes/CacheSearchResults";
import { Cardinality } from "../datatypes/Cardinality";
import { en } from "../locale/en";
import { LinkConfig } from "../queries/update/UpdateConnectionQueries";
import { parsePrefix } from "./FunctionEditVars";
import { filterEquivalent, getEquivalents } from "./FunctionEquivalents";
import { mvp1IRI, mvp2IRI } from "./FunctionGraph";

export function getVocabularyLabel(vocabulary: string, cutoff: number = 24) {
  const shortLabel = getVocabularyShortLabel(vocabulary);
  if (shortLabel) return shortLabel.toLowerCase();
  const fullLabelWorkspace =
    vocabulary in WorkspaceVocabularies &&
    getLabelOrBlank(
      WorkspaceVocabularies[vocabulary].labels,
      AppSettings.canvasLanguage
    ).toLowerCase();
  const fullLabelCache =
    vocabulary in CacheSearchVocabularies &&
    getLabelOrBlank(
      CacheSearchVocabularies[vocabulary].labels,
      AppSettings.canvasLanguage
    ).toLowerCase();
  if (!(fullLabelWorkspace && fullLabelCache))
    throw new Error("Unknown vocabulary IRI" + vocabulary + ".");
  const fullLabel: string = (
    fullLabelWorkspace || fullLabelCache
  ).toLowerCase();
  return fullLabel.length >= cutoff
    ? fullLabel.substring(0, cutoff) + "..."
    : fullLabel;
}

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
    getEquivalents(parsePrefix("z-sgov-pojem", "má-vlastnost")).includes(
      WorkspaceLinks[link].iri
    ) &&
    WorkspaceLinks[link].source === id &&
    WorkspaceLinks[link].active &&
    !WorkspaceElements[WorkspaceLinks[link].target].hidden[
      AppSettings.selectedDiagram
    ]
  ) {
    return true;
  } else if (
    getEquivalents(parsePrefix("z-sgov-pojem", "je-vlastností")).includes(
      WorkspaceLinks[link].iri
    ) &&
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
    if (filterEquivalent(types, type)) return Shapes[type].body;
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

export function getOntographerLinkIRI(linkID: string) {
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
        ...getEquivalents(parsePrefix("z-sgov-pojem", "je-vlastností")),
        ...getEquivalents(parsePrefix("z-sgov-pojem", "má-vlastnost")),
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
        getEquivalents(parsePrefix("z-sgov-pojem", "má-vlastnost")).includes(
          WorkspaceLinks[link].iri
        ) &&
        filterEquivalent(
          WorkspaceTerms[WorkspaceLinks[link].target].types,
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
            getEquivalents(
              parsePrefix("z-sgov-pojem", "je-vlastností")
            ).includes(WorkspaceLinks[link].iri) &&
            filterEquivalent(
              WorkspaceTerms[WorkspaceLinks[link].source].types,
              parsePrefix("z-sgov-pojem", "typ-vlastnosti")
            )
        )
        .map((link) => (returnLinkIDs ? link : WorkspaceLinks[link].source))
    );
}
