import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
import * as joint from "jointjs";
import _ from "lodash";
import { Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import { LocalStorageVars } from "../config/LocalStorageVars";
import {
  AppSettings,
  Links,
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
import { WorkspaceElements } from "./../config/Variables";
import { cutoffString, parsePrefix } from "./FunctionEditVars";
import { filterEquivalent, getEquivalents } from "./FunctionEquivalents";
import { mvp1IRI, mvp2IRI } from "./FunctionGraph";

export function getVocabularyLabel(
  vocabulary: string,
  cutoff: number = 24
): string {
  const shortLabel = getVocabularyShortLabel(vocabulary);
  if (shortLabel) return shortLabel.toLowerCase();
  if (vocabulary in WorkspaceVocabularies)
    return cutoffString(
      getLabelOrBlank(
        WorkspaceVocabularies[vocabulary].labels,
        AppSettings.canvasLanguage
      ),
      cutoff
    );
  if (vocabulary in CacheSearchVocabularies)
    return cutoffString(
      getLabelOrBlank(
        CacheSearchVocabularies[vocabulary].labels,
        AppSettings.canvasLanguage
      ),
      cutoff
    );
  throw new Error("Unknown vocabulary IRI " + vocabulary + " .");
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

export function getActiveSourceConnections(iri: string): string[] {
  return WorkspaceElements[iri].sourceLinks.filter(
    (id) => WorkspaceLinks[id].active
  );
}

export function getActiveTargetConnections(iri: string): string[] {
  return WorkspaceElements[iri].targetLinks.filter(
    (id) => WorkspaceLinks[id].active
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
      const sourceLink = getActiveSourceConnections(pred).find(
        (id) =>
          WorkspaceLinks[id].iri === mvp1IRI &&
          WorkspaceLinks[id].target === sourceElem
      );
      const targetLink = getActiveSourceConnections(pred).find(
        (id) =>
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
  const connections = getActiveSourceConnections(tropeID)
    .concat(getActiveTargetConnections(tropeID))
    .filter((link) => {
      return (
        ([
          ...getEquivalents(parsePrefix("z-sgov-pojem", "je-vlastností")),
          ...getEquivalents(parsePrefix("z-sgov-pojem", "má-vlastnost")),
        ].includes(WorkspaceLinks[link].iri) &&
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
  return _.uniq(
    getActiveSourceConnections(id)
      .filter(
        (link) =>
          WorkspaceLinks[link].active &&
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
        getActiveTargetConnections(id)
          .filter(
            (link) =>
              WorkspaceLinks[link].active &&
              getEquivalents(
                parsePrefix("z-sgov-pojem", "je-vlastností")
              ).includes(WorkspaceLinks[link].iri) &&
              filterEquivalent(
                WorkspaceTerms[WorkspaceLinks[link].source].types,
                parsePrefix("z-sgov-pojem", "typ-vlastnosti")
              )
          )
          .map((link) => (returnLinkIDs ? link : WorkspaceLinks[link].source))
      )
      .sort()
  );
}
