import {
  AppSettings,
  Diagrams,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import {
  initElements,
  initLanguageObject,
  parsePrefix,
} from "./FunctionEditVars";
import { graph } from "../graph/Graph";
import {
  getActiveToConnections,
  getElementShape,
  getLinkOrVocabElem,
  getNewLink,
} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as _ from "lodash";
import { graphElement } from "../graph/GraphElement";
import { LinkType, Representation } from "../config/Enum";
import { drawGraphElement, getDisplayLabel } from "./FunctionDraw";
import {
  updateDeleteProjectLinkVertex,
  updateProjectLink,
} from "../queries/update/UpdateLinkQueries";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../queries/update/UpdateElementQueries";
import {
  fetchReadOnlyTerms,
  fetchRelationships,
} from "../queries/get/CacheQueries";
import { initConnections } from "./FunctionRestriction";
import isUrl from "is-url";
import {
  constructFullConnections,
  getOtherConnectionElementID,
  setSelfLoopConnectionPoints,
} from "./FunctionLink";
import { insertNewCacheTerms, insertNewRestrictions } from "./FunctionCache";
import { updateDiagram } from "../queries/update/UpdateDiagramQueries";

export const mvp1IRI =
  "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
export const mvp2IRI =
  "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

export function nameGraphLink(
  link: joint.dia.Link,
  names: ReturnType<typeof initLanguageObject>,
  languageCode: string
) {
  if (
    typeof link.id === "string" &&
    WorkspaceLinks[link.id].type === LinkType.DEFAULT
  ) {
    if (names[languageCode]) {
      const labels = link.labels();
      labels.forEach((linkLabel, i) => {
        if (!linkLabel.attrs?.text?.text?.match(/^\d|\*/)) {
          link.label(i, {
            attrs: {
              text: {
                text: names[languageCode],
              },
            },
            position: {
              distance: 0.5,
            },
          });
        }
      });
    }
  }
}

export async function spreadConnections(
  id: string,
  elements: string[]
): Promise<string[]> {
  const ids = elements
    .filter((link) => !isUrl(link))
    .map((link) => getOtherConnectionElementID(link, id));
  const iris = elements.filter((iri) => isUrl(iri));
  let queries: string[] = [];
  if (iris.length > 0) {
    insertNewCacheTerms(
      await fetchReadOnlyTerms(AppSettings.contextEndpoint, iris)
    );
    insertNewRestrictions(
      await fetchRelationships(AppSettings.contextEndpoint, iris)
    );
    const newIDs = initElements();
    queries.push(updateProjectElement(false, ...newIDs));
    queries.push(updateProjectLink(false, ...initConnections()));
    ids.push(...newIDs);
  }
  const elem = graph.getElements().find((elem) => elem.id === id);
  if (elem) {
    const length = ids.length + iris.length;
    const centerX = elem.position().x + elem.size().width / 2;
    const centerY = elem.position().y + elem.size().height / 2;
    const radius = 200 + length * 50;
    ids.forEach((id, i) => {
      const x = centerX + radius * Math.cos((i * 2 * Math.PI) / length);
      const y = centerY + radius * Math.sin((i * 2 * Math.PI) / length);
      let newElem = new graphElement({ id: id });
      newElem.position(x, y);
      WorkspaceElements[id].position[AppSettings.selectedDiagram] = {
        x: x,
        y: y,
      };
      WorkspaceElements[id].hidden[AppSettings.selectedDiagram] = false;
      newElem.addTo(graph);
      drawGraphElement(
        newElem,
        AppSettings.canvasLanguage,
        AppSettings.representation
      );
      queries.push(
        ...restoreHiddenElem(id, newElem, false, true, false),
        updateProjectElement(true, id),
        updateProjectElementDiagram(AppSettings.selectedDiagram, id)
      );
    });
    if (AppSettings.representation === Representation.COMPACT)
      setRepresentation(AppSettings.representation);
  }
  return queries;
}

export function setLabels(link: joint.dia.Link, centerLabel: string) {
  link.labels([]);
  if (WorkspaceLinks[link.id].type === LinkType.DEFAULT) {
    link.appendLabel({
      attrs: { text: { text: centerLabel } },
      position: { distance: 0.5 },
    });
    if (
      WorkspaceLinks[link.id].sourceCardinality &&
      WorkspaceLinks[link.id].sourceCardinality.getString() !== ""
    ) {
      link.appendLabel({
        attrs: {
          text: { text: WorkspaceLinks[link.id].sourceCardinality.getString() },
        },
        position: { distance: 20 },
      });
    }
    if (
      WorkspaceLinks[link.id].targetCardinality &&
      WorkspaceLinks[link.id].targetCardinality.getString() !== ""
    ) {
      link.appendLabel({
        attrs: {
          text: { text: WorkspaceLinks[link.id].targetCardinality.getString() },
        },
        position: { distance: -20 },
      });
    }
  }
}

function storeElement(elem: joint.dia.Cell) {
  WorkspaceElements[elem.id].hidden[AppSettings.selectedDiagram] = true;
  elem.remove();
  if (typeof elem.id === "string") {
    AppSettings.switchElements.push(elem.id);
  }
}

export function setLinkBoundary(
  link: joint.dia.Link,
  source: string,
  target: string
) {
  link.source({
    id: source,
    connectionPoint: {
      name: "boundary",
      args: { selector: getElementShape(source) },
    },
  });
  link.target({
    id: target,
    connectionPoint: {
      name: "boundary",
      args: { selector: getElementShape(target) },
    },
  });
}

export function setRepresentation(
  representation: number,
  restoreFull: boolean = true,
  changeSettings: boolean = true
): {
  result: boolean;
  transaction: string[];
} {
  let queries: string[] = [];
  if (changeSettings) {
    AppSettings.representation = representation;
    Diagrams[AppSettings.selectedDiagram].representation = representation;
  }
  queries.push(updateDiagram(AppSettings.selectedDiagram));
  AppSettings.selectedLink = "";
  let del = false;
  if (representation === Representation.COMPACT) {
    for (const id of Object.keys(WorkspaceElements).filter(
      (elem) => WorkspaceElements[elem].active &&
        elem in WorkspaceTerms
    )) {
      if (
        WorkspaceTerms[id].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vztahu")
        )
      ) {
        const connections: string[] = getActiveToConnections(id);
        if (connections.length > 1) {
          const sourceLink: string | undefined = connections.find(
            (src) => WorkspaceLinks[src].iri === mvp1IRI
          );
          const targetLink: string | undefined = connections.find(
            (src) => WorkspaceLinks[src].iri === mvp2IRI
          );
          if (sourceLink && targetLink) {
            const source = WorkspaceLinks[sourceLink].target;
            const target = WorkspaceLinks[targetLink].target;
            const sourceBox = graph
              .getElements()
              .find((elem) => elem.id === source);
            const targetBox = graph
              .getElements()
              .find((elem) => elem.id === target);
            const find = Object.keys(WorkspaceLinks).find(
              (link) =>
                WorkspaceLinks[link].active &&
                WorkspaceLinks[link].iri === id &&
                WorkspaceLinks[link].source === source &&
                WorkspaceLinks[link].target === target
            );
            if (!find) {
              console.error(
                `Compact relationship ${id} not initialized before displaying.`
              );
              continue;
            }
            const newLink = getNewLink(LinkType.DEFAULT, find);
            if (sourceBox && targetBox) {
              const newLinkID = newLink.id as string;
              setLinkBoundary(newLink, source, target);
              newLink.addTo(graph);
              if (
                WorkspaceLinks[newLinkID].vertices[AppSettings.selectedDiagram]
              )
                newLink.vertices(
                  WorkspaceLinks[newLinkID].vertices[
                    AppSettings.selectedDiagram
                  ]
                );
              if (
                source === target &&
                WorkspaceLinks[newLinkID].vertices[AppSettings.selectedDiagram]
                  .length < 3
              )
                setSelfLoopConnectionPoints(newLink, sourceBox.getBBox());
              WorkspaceLinks[newLink.id].vertices[AppSettings.selectedDiagram] =
                newLink.vertices();
              constructFullConnections(newLinkID, sourceLink, targetLink);
              setLabels(
                newLink,
                getDisplayLabel(id, AppSettings.canvasLanguage)
              );
            }
          }
        }
        const cell = graph.getCell(id);
        if (cell) {
          storeElement(cell);
          del = true;
        }
      } else if (
        WorkspaceTerms[id].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      ) {
        const cell = graph.getCell(id);
        if (cell) {
          storeElement(cell);
          del = true;
        }
      }
    }
    for (const link of graph.getLinks()) {
      if (
        WorkspaceLinks[link.id].iri in Links &&
        Links[WorkspaceLinks[link.id].iri].type === LinkType.DEFAULT
      ) {
        link.remove();
        del = true;
      } else if (WorkspaceLinks[link.id].iri in WorkspaceTerms) {
        const elem = WorkspaceLinks[link.id].iri;
        if (!elem) continue;
        setLabels(link, getDisplayLabel(elem, AppSettings.canvasLanguage));
      }
    }
    for (const elem of graph.getElements()) {
      drawGraphElement(
        elem,
        AppSettings.canvasLanguage,
        Representation.COMPACT
      );
    }
    return { result: del, transaction: queries };
  } else {
    for (const elem of AppSettings.switchElements) {
      if (WorkspaceElements[elem].position[AppSettings.selectedDiagram]) {
        const find = graph
          .getElements()
          .find(
            (cell) =>
              cell.id === elem &&
              WorkspaceElements[elem].active &&
              WorkspaceElements[elem].hidden[AppSettings.selectedDiagram]
          );
        let cell = find || new graphElement({ id: elem });
        cell.addTo(graph);
        cell.position(
          WorkspaceElements[elem].position[AppSettings.selectedDiagram].x,
          WorkspaceElements[elem].position[AppSettings.selectedDiagram].y
        );
        WorkspaceElements[elem].hidden[AppSettings.selectedDiagram] = false;
        drawGraphElement(cell, AppSettings.canvasLanguage, representation);
        queries.push(
          ...restoreHiddenElem(elem, cell, false, false, false, representation)
        );
      }
    }
    for (let elem of graph.getElements()) {
      drawGraphElement(elem, AppSettings.canvasLanguage, representation);
      if (typeof elem.id === "string") {
        queries.push(
          ...restoreHiddenElem(
            elem.id,
            elem,
            true,
            restoreFull,
            false,
            representation
          )
        );
      }
    }
    for (let link of graph.getLinks()) {
      if (
        !(WorkspaceLinks[link.id].iri in Links) ||
        !WorkspaceLinks[link.id].active
      ) {
        link.remove();
      }
    }
    AppSettings.switchElements = [];
    return { result: false, transaction: queries };
  }
}

export function findLinkSelfLoop(link: joint.dia.Link) {
  const id = link.id as string;
  if (
    WorkspaceLinks[id].source === WorkspaceLinks[id].target &&
    (!WorkspaceLinks[id].vertices[AppSettings.selectedDiagram] ||
      WorkspaceLinks[id].vertices[AppSettings.selectedDiagram].length === 0)
  )
    setSelfLoopConnectionPoints(link, link.getSourceCell()?.getBBox());
}

export function setupLink(
  link: string,
  restoreConnectionPosition: boolean = true
) {
  let lnk = getNewLink(WorkspaceLinks[link].type, link);
  setLabels(
    lnk,
    getLinkOrVocabElem(WorkspaceLinks[link].iri).labels[
      AppSettings.canvasLanguage
    ]
  );
  lnk.source({
    id: WorkspaceLinks[link].source,
    connectionPoint: {
      name: "boundary",
      args: { selector: getElementShape(WorkspaceLinks[link].source) },
    },
  });
  lnk.target({
    id: WorkspaceLinks[link].target,
    connectionPoint: {
      name: "boundary",
      args: { selector: getElementShape(WorkspaceLinks[link].target) },
    },
  });
  lnk.addTo(graph);
  if (!WorkspaceLinks[link].vertices[AppSettings.selectedDiagram])
    WorkspaceLinks[link].vertices[AppSettings.selectedDiagram] = [];
  if (restoreConnectionPosition) {
    WorkspaceLinks[link].vertices[AppSettings.selectedDiagram].length > 0
      ? lnk.vertices(WorkspaceLinks[link].vertices[AppSettings.selectedDiagram])
      : findLinkSelfLoop(lnk);
    return undefined;
  } else {
    let ret = _.cloneDeep(
      WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
    );
    findLinkSelfLoop(lnk);
    WorkspaceLinks[link].vertices[AppSettings.selectedDiagram] = lnk.vertices();
    if (WorkspaceLinks[link].vertices[AppSettings.selectedDiagram].length > 0)
      lnk.vertices(WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]);
    return ret ? ret.length : undefined;
  }
}

export function restoreHiddenElem(
  id: string,
  cls: joint.dia.Element,
  restoreSimpleConnectionPosition: boolean,
  restoreFull: boolean,
  restoreFullConnectionPosition: boolean,
  representation: Representation = AppSettings.representation
): string[] {
  let queries: string[] = [];
  for (let link of Object.keys(WorkspaceLinks).filter(
    (link) => WorkspaceLinks[link].active
  )) {
    if (
      (WorkspaceLinks[link].source === id ||
        WorkspaceLinks[link].target === id) &&
      graph.getCell(WorkspaceLinks[link].source) &&
      graph.getCell(WorkspaceLinks[link].target) &&
      (representation === Representation.FULL
        ? WorkspaceLinks[link].iri in Links
        : !(WorkspaceLinks[link].iri in Links) ||
          (WorkspaceLinks[link].iri in Links &&
            Links[WorkspaceLinks[link].iri].inScheme.startsWith(
              AppSettings.ontographerContext
            )))
    ) {
      let oldPos = setupLink(link, restoreSimpleConnectionPosition);
      if (oldPos)
        queries.push(
          updateDeleteProjectLinkVertex(
            link,
            0,
            oldPos,
            AppSettings.selectedDiagram
          )
        );
    } else if (
      restoreFull &&
      representation === Representation.FULL &&
      WorkspaceLinks[link].target === id &&
      WorkspaceLinks[link].iri in Links &&
      graph.getCell(WorkspaceLinks[link].target)
    ) {
      let relID = WorkspaceLinks[link].source;
      for (let targetLink in WorkspaceLinks) {
        if (
          WorkspaceLinks[targetLink].active &&
          WorkspaceLinks[targetLink].source === relID &&
          WorkspaceLinks[targetLink].target !== id &&
          graph.getCell(WorkspaceLinks[targetLink].target)
        ) {
          let domainLink = getNewLink(WorkspaceLinks[link].type, link);
          let rangeLink = getNewLink(
            WorkspaceLinks[targetLink].type,
            targetLink
          );
          let existingRel = graph
            .getElements()
            .find((elem) => elem.id === relID);
          let relationship = existingRel
            ? existingRel
            : new graphElement({ id: relID });
          if (
            WorkspaceElements[relID].position[AppSettings.selectedDiagram] &&
            WorkspaceElements[relID].position[AppSettings.selectedDiagram].x !==
              0 &&
            WorkspaceElements[relID].position[AppSettings.selectedDiagram].y !==
              0 &&
            restoreFullConnectionPosition
          ) {
            relationship.position(
              WorkspaceElements[relID].position[AppSettings.selectedDiagram].x,
              WorkspaceElements[relID].position[AppSettings.selectedDiagram].y
            );
          } else {
            const sourcepos = graph
              .getCell(WorkspaceLinks[link].target)
              .get("position");
            const targetpos = graph
              .getCell(WorkspaceLinks[targetLink].target)
              .get("position");
            const posx = (sourcepos.x + targetpos.x) / 2;
            const posy = (sourcepos.y + targetpos.y) / 2;
            relationship.position(posx, posy);
          }
          WorkspaceElements[relID].position[AppSettings.selectedDiagram] =
            relationship.position();
          WorkspaceElements[relID].hidden[AppSettings.selectedDiagram] = false;
          drawGraphElement(
            relationship,
            AppSettings.canvasLanguage,
            Representation.FULL
          );
          setLinkBoundary(domainLink, relID, WorkspaceLinks[link].target);
          setLinkBoundary(rangeLink, relID, WorkspaceLinks[targetLink].target);
          setLabels(
            domainLink,
            getLinkOrVocabElem(WorkspaceLinks[link].iri).labels[
              AppSettings.canvasLanguage
            ]
          );
          setLabels(
            rangeLink,
            getLinkOrVocabElem(WorkspaceLinks[targetLink].iri).labels[
              AppSettings.canvasLanguage
            ]
          );
          relationship.addTo(graph);
          queries.push(
            updateProjectElementDiagram(AppSettings.selectedDiagram, relID)
          );
          if (restoreFullConnectionPosition) {
            domainLink.vertices(
              WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
            );
            rangeLink.vertices(
              WorkspaceLinks[targetLink].vertices[AppSettings.selectedDiagram]
            );
          } else {
            queries.push(updateProjectElement(true, relID));
            if (WorkspaceLinks[link].vertices[AppSettings.selectedDiagram])
              queries.push(
                updateDeleteProjectLinkVertex(
                  link,
                  0,
                  WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
                    .length,
                  AppSettings.selectedDiagram
                )
              );
            if (
              WorkspaceLinks[targetLink].vertices[AppSettings.selectedDiagram]
            )
              queries.push(
                updateDeleteProjectLinkVertex(
                  targetLink,
                  0,
                  WorkspaceLinks[targetLink].vertices[
                    AppSettings.selectedDiagram
                  ].length,
                  AppSettings.selectedDiagram
                )
              );
            WorkspaceLinks[link].vertices[AppSettings.selectedDiagram] = [];
            WorkspaceLinks[targetLink].vertices[AppSettings.selectedDiagram] =
              [];
          }
          domainLink.addTo(graph);
          rangeLink.addTo(graph);
          break;
        }
      }
    }
  }
  return queries;
}
