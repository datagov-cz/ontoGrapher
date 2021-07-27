import {
  AppSettings,
  Languages,
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

export function getVocabElementByElementID(id: string): { [key: string]: any } {
  return WorkspaceTerms[WorkspaceElements[id].iri];
}

export function getLinkOrVocabElem(iri: string): { [key: string]: any } {
  return iri in Links ? Links[iri] : WorkspaceTerms[iri];
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
    Links[link].defaultSourceCardinality = getDefaultCardinality();
    Links[link].defaultTargetCardinality = getDefaultCardinality();
  }
}

export function getDefaultCardinality() {
  return new Cardinality(
    AppSettings.defaultCardinality1,
    AppSettings.defaultCardinality2
  );
}

export function setSchemeColors(pool: string) {
  Object.keys(WorkspaceVocabularies).forEach((scheme, i) => {
    WorkspaceVocabularies[scheme].color =
      ColorPool[pool].colors[i % ColorPool[pool].colors.length];
  });
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

export function getElementShape(id: string | number): string {
  const types = WorkspaceTerms[WorkspaceElements[id].iri].types;
  for (const type in Shapes) {
    if (types.includes(type)) return Shapes[type].body;
  }
  return Shapes["default"].body;
}

export function getActiveToConnections(id: string): string[] {
  return WorkspaceElements[id].connections.filter(
    (conn) => WorkspaceLinks[conn].active
  );
}

export function getUnderlyingFullConnections(
  link: joint.dia.Link
): { src: string; tgt: string } | undefined {
  const id = link.id;
  const iri = WorkspaceLinks[id].iri;
  if (!(iri in WorkspaceTerms)) return;
  const sourceElem = link.getSourceCell()?.id;
  const targetElem = link.getTargetCell()?.id;
  if (sourceElem && targetElem) {
    const preds = Object.keys(WorkspaceElements).filter(
      (id) => WorkspaceElements[id].iri === iri
    );
    for (const pred of preds) {
      const sourceLink = Object.keys(WorkspaceLinks).find(
        (id) =>
          WorkspaceElements[pred].connections.includes(id) &&
          WorkspaceLinks[id].iri === mvp1IRI &&
          WorkspaceLinks[id].target === sourceElem &&
          WorkspaceLinks[id].active
      );
      const targetLink = Object.keys(WorkspaceLinks).find(
        (id) =>
          WorkspaceElements[pred].connections.includes(id) &&
          WorkspaceLinks[id].iri === mvp2IRI &&
          WorkspaceLinks[id].target === targetElem &&
          WorkspaceLinks[id].active
      );
      if (sourceLink && targetLink) return { src: sourceLink, tgt: targetLink };
    }
    return;
  }
}

export function getFullConnections(id: string): string[] {
  return Object.keys(WorkspaceElements).filter(
    (elem) =>
      WorkspaceElements[elem].active &&
      parsePrefix("z-sgov-pojem", "typ-vztahu") ===
        WorkspaceElements[elem].iri &&
      WorkspaceElements[elem].connections.find(
        (link) =>
          WorkspaceLinks[link].active &&
          (WorkspaceLinks[link].iri === mvp1IRI ||
            WorkspaceLinks[link].iri === mvp2IRI) &&
          WorkspaceLinks[link].target === id
      )
  );
}

export function getElemFromIRI(iri: string) {
  return Object.keys(WorkspaceElements).find(
    (elem) => WorkspaceElements[elem].iri === iri
  );
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
  const year: string = Object.keys(enChangelog)[0];
  const month: string = Object.keys(enChangelog[year]).reverse()[0];
  const day: string = Object.keys(enChangelog[year][month]).reverse()[0];
  return `${day}. ${month}.`;
}

export function getWorkspaceContextIRI() {
  return (
    AppSettings.ontographerContext +
    AppSettings.contextIRI.substring(AppSettings.contextIRI.lastIndexOf("/"))
  );
}

export function isLabelBlank(label: string) {
  return label === "<blank>";
}

export function isTermReadOnly(iri: string) {
  return (
    iri in WorkspaceTerms &&
    WorkspaceVocabularies[getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)]
      .readOnly
  );
}

export function getIntrinsicTropeTypes(id: string) {
  return Object.keys(WorkspaceLinks)
    .filter(
      (link) =>
        WorkspaceLinks[link].active &&
        WorkspaceLinks[link].source === id &&
        WorkspaceLinks[link].iri ===
          parsePrefix("z-sgov-pojem", "má-vlastnost") &&
        WorkspaceTerms[
          WorkspaceElements[WorkspaceLinks[link].target].iri
        ].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))
    )
    .map((link) => WorkspaceElements[WorkspaceLinks[link].target].iri)
    .concat(
      Object.keys(WorkspaceLinks)
        .filter(
          (link) =>
            WorkspaceLinks[link].active &&
            WorkspaceLinks[link].target === id &&
            WorkspaceLinks[link].iri ===
              parsePrefix("z-sgov-pojem", "je-vlastností") &&
            WorkspaceTerms[
              WorkspaceElements[WorkspaceLinks[link].source].iri
            ].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))
        )
        .map((link) => WorkspaceElements[WorkspaceLinks[link].source].iri)
    );
}
