import isUrl from "is-url";
import * as joint from "jointjs";
import * as _ from "lodash";
import { LinkType, Representation } from "../config/Enum";
import {
  AppSettings,
  Diagrams,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import { graph } from "../graph/Graph";
import { graphElement } from "../graph/GraphElement";
import { paper } from "../main/DiagramCanvas";
import {
  fetchReadOnlyTerms,
  fetchRelationships,
} from "../queries/get/CacheQueries";
import { updateDiagram } from "../queries/update/UpdateDiagramQueries";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../queries/update/UpdateElementQueries";
import {
  updateDeleteProjectLinkVertex,
  updateProjectLink,
} from "../queries/update/UpdateLinkQueries";
import { insertNewCacheTerms, insertNewRestrictions } from "./FunctionCache";
import { addLink } from "./FunctionCreateVars";
import { clearSelection, updateDiagramPosition } from "./FunctionDiagram";
import { drawGraphElement, getDisplayLabel } from "./FunctionDraw";
import {
  initElements,
  initLanguageObject,
  parsePrefix,
} from "./FunctionEditVars";
import { filterEquivalent } from "./FunctionEquivalents";
import {
  getActiveToConnections,
  getElementShape,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
  getNewLink,
} from "./FunctionGetVars";
import {
  getOtherConnectionElementID,
  isLinkVertexArrayEmpty,
  setCompactLinkCardinalitiesFromFullComponents,
  setLinkVertices,
  setSelfLoopConnectionPoints,
} from "./FunctionLink";
import { initConnections } from "./FunctionRestriction";

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

export function centerElementInView(id: string) {
  const elem = graph.getElements().find((elem) => elem.id === id);
  if (elem) {
    const scale = paper.scale().sx;
    paper.translate(0, 0);
    paper.translate(
      -elem.position().x * scale +
        paper.getComputedSize().width / 2 -
        elem.getBBox().width,
      -elem.position().y * scale +
        paper.getComputedSize().height / 2 -
        elem.getBBox().height
    );
    updateDiagramPosition(AppSettings.selectedDiagram);
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
  const queries: string[] = [];
  if (iris.length > 0) {
    insertNewCacheTerms(
      await fetchReadOnlyTerms(AppSettings.contextEndpoint, iris)
    );
    insertNewRestrictions(
      await fetchRelationships(AppSettings.contextEndpoint, iris)
    );
    const newIDs = initElements();
    queries.push(updateProjectElement(false, ...newIDs));
    queries.push(updateProjectLink(false, ...initConnections().add));
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
        ...restoreHiddenElem(id, false, true, false),
        updateProjectElement(true, id),
        updateProjectElementDiagram(AppSettings.selectedDiagram, id)
      );
    });
    if (AppSettings.representation === Representation.COMPACT)
      setRepresentation(
        AppSettings.representation,
        AppSettings.selectedDiagram
      );
  }
  return queries;
}

export function setLabels(link: joint.dia.Link) {
  if (WorkspaceLinks[link.id].type !== LinkType.DEFAULT) return;
  const iri = WorkspaceLinks[link.id].iri;
  const sourceCardinality = WorkspaceLinks[link.id].sourceCardinality;
  const targetCardinality = WorkspaceLinks[link.id].targetCardinality;
  let label: string = "";
  let tropes: string[] = [];
  if (iri in Links)
    label = getLabelOrBlank(Links[iri].labels, AppSettings.canvasLanguage);
  if (iri in WorkspaceTerms) {
    label = getDisplayLabel(iri, AppSettings.canvasLanguage);
    tropes = getIntrinsicTropeTypeIDs(iri).flatMap((trope) =>
      getDisplayLabel(trope, AppSettings.canvasLanguage)
    );
  }
  link.labels([]);
  link.appendLabel({
    markup: [
      {
        tagName: "g",
        selector: "global",
        children: [
          { tagName: "rect", selector: "body" },
          {
            tagName: "g",
            selector: "labels",
            children: [
              { tagName: "text", selector: "label" },
              { tagName: "text", selector: "labelAttrs" },
            ],
          },
        ],
      },
    ],
    attrs: {
      global: {
        y: "-50%",
      },
      label: {
        text: label,
        fill: "#000000",
        fontSize: tropes.length === 0 ? 14 : 16,
        textVerticalAnchor: tropes.length === 0 ? "middle" : "top",
        textAnchor: "middle",
        pointerEvents: "none",
        y: tropes.length === 0 ? 0 : -(11 + Math.floor(tropes.length * 6.5)),
      },
      labelAttrs: {
        ref: "label",
        text: tropes.join("\n"),
        fill: "#000000",
        fontSize: 14,
        textVerticalAnchor: "top",
        textAnchor: "start",
        x: "calc(-0.55*w)",
        y: "calc(y + 22)",
        pointerEvents: "none",
      },
      body: {
        ref: "labels",
        width: "calc(1.1*w)",
        height: "calc(1.1*h)",
        x: "calc(-0.55*w)",
        y: "calc(-0.55*h)",
        rx: 3,
        ry: 3,
        stroke: "black",
        strokeWidth: "0.5",
        fill: "white",
      },
    },
    position: { distance: 0.5 },
  });
  if (sourceCardinality && sourceCardinality.getString() !== "")
    link.appendLabel({
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "text", selector: "label" },
      ],
      attrs: {
        label: {
          text: sourceCardinality.getString(),
          textVerticalAnchor: "middle",
          textAnchor: "middle",
        },
        body: {
          ref: "label",
          fill: "white",
          width: "calc(1.1*w)",
          height: "calc(1.1*h)",
          x: "calc(-0.55*w)",
          y: "calc(-0.55*h)",
          rx: 3,
          ry: 3,
          stroke: "black",
          strokeWidth: "0.5",
        },
      },
      position: { distance: 30 },
    });
  if (targetCardinality && targetCardinality.getString() !== "")
    link.appendLabel({
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "text", selector: "label" },
      ],
      attrs: {
        label: {
          text: targetCardinality.getString(),
          textVerticalAnchor: "middle",
          textAnchor: "middle",
        },
        body: {
          ref: "label",
          fill: "white",
          width: "calc(1.1*w)",
          height: "calc(1.1*h)",
          x: "calc(-0.55*w)",
          y: "calc(-0.55*h)",
          rx: 3,
          ry: 3,
          stroke: "black",
          strokeWidth: "0.5",
        },
      },
      position: { distance: -30 },
    });
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
  diag: string,
  restoreFull: boolean = true,
  changeSettings: boolean = true,
  g: joint.dia.Graph = graph
): {
  result: boolean;
  transaction: string[];
} {
  const queries: string[] = [];
  if (changeSettings) {
    AppSettings.representation = representation;
    Diagrams[diag].representation = representation;
  }
  queries.push(updateDiagram(diag));
  clearSelection();
  let del = false;
  if (representation === Representation.COMPACT) {
    for (const id of Object.keys(WorkspaceElements).filter(
      (elem) => WorkspaceElements[elem].active && elem in WorkspaceTerms
    )) {
      if (
        filterEquivalent(
          WorkspaceTerms[id].types,
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
            const sourceBox = g
              .getElements()
              .find((elem) => elem.id === source);
            const targetBox = g
              .getElements()
              .find((elem) => elem.id === target);
            let linkID = Object.keys(WorkspaceLinks).find(
              (link) =>
                WorkspaceLinks[link].active &&
                WorkspaceLinks[link].iri === id &&
                WorkspaceLinks[link].source === source &&
                WorkspaceLinks[link].target === target
            );
            if (!linkID) {
              const newLink = getNewLink();
              const newLinkID = newLink.id as string;
              addLink(newLinkID, id, source, target);
              setCompactLinkCardinalitiesFromFullComponents(
                newLinkID,
                sourceLink,
                targetLink
              );
              queries.push(updateProjectLink(false, newLinkID));
              linkID = newLinkID;
            }
            const newLink = getNewLink(LinkType.DEFAULT, linkID);
            if (sourceBox && targetBox) {
              setLinkBoundary(newLink, source, target);
              newLink.addTo(g);
              if (isLinkVertexArrayEmpty(linkID, diag)) {
                if (source === target) {
                  setSelfLoopConnectionPoints(newLink, sourceBox.getBBox());
                }
                WorkspaceLinks[newLink.id].vertices[diag] = newLink.vertices();
              } else {
                setLinkVertices(newLink, WorkspaceLinks[linkID].vertices[diag]);
              }
              setCompactLinkCardinalitiesFromFullComponents(
                linkID,
                sourceLink,
                targetLink
              );
              setLabels(newLink);
            }
          }
        }
        const cell = g.getCell(id);
        if (cell) {
          storeElement(cell);
          del = true;
        }
      } else if (
        filterEquivalent(
          WorkspaceTerms[id].types,
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      ) {
        const cell = g.getCell(id);
        if (cell) {
          WorkspaceElements[id].hidden[diag] = true;
          cell.remove();
          del = true;
        }
      }
    }
    for (const link of g.getLinks()) {
      if (
        WorkspaceLinks[link.id].iri in Links &&
        Links[WorkspaceLinks[link.id].iri].type === LinkType.DEFAULT
      ) {
        link.remove();
        del = true;
      } else if (WorkspaceLinks[link.id].iri in WorkspaceTerms) {
        const elem = WorkspaceLinks[link.id].iri;
        if (!elem) continue;
        setLabels(link);
      }
    }
    for (const elem of g.getElements()) {
      drawGraphElement(
        elem,
        AppSettings.canvasLanguage,
        Representation.COMPACT
      );
    }
    return { result: del, transaction: queries };
  } else {
    for (const elem of AppSettings.switchElements.concat(
      Object.keys(WorkspaceTerms).filter((id) =>
        filterEquivalent(
          WorkspaceTerms[id].types,
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      )
    )) {
      if (WorkspaceElements[elem].position[diag]) {
        const find = g
          .getElements()
          .find(
            (cell) =>
              cell.id === elem &&
              WorkspaceElements[elem].active &&
              WorkspaceElements[elem].hidden[diag]
          );
        const cell = find || new graphElement({ id: elem });
        cell.addTo(g);
        cell.position(
          WorkspaceElements[elem].position[diag].x,
          WorkspaceElements[elem].position[diag].y
        );
        WorkspaceElements[elem].hidden[diag] = false;
        drawGraphElement(cell, AppSettings.canvasLanguage, representation);
        queries.push(
          ...restoreHiddenElem(elem, false, false, false, representation)
        );
      }
    }
    for (const elem of g.getElements()) {
      drawGraphElement(elem, AppSettings.canvasLanguage, representation);
      if (typeof elem.id === "string") {
        queries.push(
          ...restoreHiddenElem(
            elem.id,
            true,
            restoreFull,
            false,
            representation
          )
        );
      }
    }
    for (let link of g.getLinks()) {
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
  restoreConnectionPosition: boolean = true,
  g: joint.dia.Graph = graph
) {
  const lnk = getNewLink(WorkspaceLinks[link].type, link);
  setLabels(lnk);
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
  lnk.addTo(g);
  if (!WorkspaceLinks[link].vertices[AppSettings.selectedDiagram])
    WorkspaceLinks[link].vertices[AppSettings.selectedDiagram] = [];
  if (restoreConnectionPosition) {
    WorkspaceLinks[link].vertices[AppSettings.selectedDiagram].length > 0
      ? setLinkVertices(
          lnk,
          WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
        )
      : findLinkSelfLoop(lnk);
    return undefined;
  } else {
    const ret = _.cloneDeep(
      WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
    );
    findLinkSelfLoop(lnk);
    WorkspaceLinks[link].vertices[AppSettings.selectedDiagram] = lnk.vertices();
    if (WorkspaceLinks[link].vertices[AppSettings.selectedDiagram].length > 0)
      setLinkVertices(
        lnk,
        WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
      );
    return ret ? ret.length : undefined;
  }
}

export function restoreHiddenElem(
  id: string,
  restoreSimpleConnectionPosition: boolean,
  restoreFull: boolean,
  restoreFullConnectionPosition: boolean,
  representation: Representation = AppSettings.representation,
  g: joint.dia.Graph = graph
): string[] {
  const queries: string[] = [];
  for (const link of Object.keys(WorkspaceLinks).filter(
    (link) => WorkspaceLinks[link].active
  )) {
    if (
      (WorkspaceLinks[link].source === id ||
        WorkspaceLinks[link].target === id) &&
      g.getCell(WorkspaceLinks[link].source) &&
      g.getCell(WorkspaceLinks[link].target) &&
      (representation === Representation.FULL
        ? WorkspaceLinks[link].iri in Links
        : !(WorkspaceLinks[link].iri in Links) ||
          (WorkspaceLinks[link].iri in Links &&
            Links[WorkspaceLinks[link].iri].inScheme.startsWith(
              AppSettings.ontographerContext
            )))
    ) {
      let oldPos = setupLink(link, restoreSimpleConnectionPosition, g);
      if (oldPos)
        queries.push(
          updateDeleteProjectLinkVertex(
            link,
            _.range(0, ++oldPos),
            AppSettings.selectedDiagram
          )
        );
    } else if (
      restoreFull &&
      representation === Representation.FULL &&
      WorkspaceLinks[link].target === id &&
      WorkspaceLinks[link].iri in Links &&
      g.getCell(WorkspaceLinks[link].target)
    ) {
      const relID = WorkspaceLinks[link].source;
      for (const targetLink in WorkspaceLinks) {
        if (
          WorkspaceLinks[targetLink].active &&
          WorkspaceLinks[targetLink].source === relID &&
          WorkspaceLinks[targetLink].target !== id &&
          g.getCell(WorkspaceLinks[targetLink].target)
        ) {
          const domainLink = getNewLink(WorkspaceLinks[link].type, link);
          const rangeLink = getNewLink(
            WorkspaceLinks[targetLink].type,
            targetLink
          );
          const existingRel = g.getElements().find((elem) => elem.id === relID);
          const relationship = existingRel
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
            const sourcepos = g
              .getCell(WorkspaceLinks[link].target)
              .get("position");
            const targetpos = g
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
          setLabels(domainLink);
          setLabels(rangeLink);
          relationship.addTo(g);
          queries.push(
            updateProjectElementDiagram(AppSettings.selectedDiagram, relID)
          );
          if (restoreFullConnectionPosition) {
            setLinkVertices(
              domainLink,
              WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
            );
            setLinkVertices(
              rangeLink,
              WorkspaceLinks[targetLink].vertices[AppSettings.selectedDiagram]
            );
          } else {
            queries.push(updateProjectElement(true, relID));
            if (WorkspaceLinks[link].vertices[AppSettings.selectedDiagram])
              queries.push(
                updateDeleteProjectLinkVertex(
                  link,
                  _.range(
                    0,
                    ++WorkspaceLinks[link].vertices[AppSettings.selectedDiagram]
                      .length
                  ),
                  AppSettings.selectedDiagram
                )
              );
            if (
              WorkspaceLinks[targetLink].vertices[AppSettings.selectedDiagram]
            )
              queries.push(
                updateDeleteProjectLinkVertex(
                  targetLink,
                  _.range(
                    0,
                    ++WorkspaceLinks[targetLink].vertices[
                      AppSettings.selectedDiagram
                    ].length
                  ),
                  AppSettings.selectedDiagram
                )
              );
            WorkspaceLinks[link].vertices[AppSettings.selectedDiagram] = [];
            WorkspaceLinks[targetLink].vertices[AppSettings.selectedDiagram] =
              [];
          }
          domainLink.addTo(g);
          rangeLink.addTo(g);
          break;
        }
      }
    }
  }
  return queries;
}
