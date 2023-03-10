import {
  AppSettings,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { LinkType, Representation } from "../config/Enum";
import {
  getLinkOrVocabElem,
  getNewLink,
  getUnderlyingFullConnections,
  getVocabularyFromScheme,
} from "./FunctionGetVars";
import { graph } from "../graph/Graph";
import * as joint from "jointjs";
import { addLink } from "./FunctionCreateVars";
import { updateProjectElement } from "../queries/update/UpdateElementQueries";
import { mvp1IRI, mvp2IRI, setLabels, setLinkBoundary } from "./FunctionGraph";
import { paper } from "../main/DiagramCanvas";
import {
  updateDeleteProjectLinkVertex,
  updateProjectLink,
  updateProjectLinkVertex,
} from "../queries/update/UpdateLinkQueries";
import { LinkConfig } from "../config/logic/LinkConfig";
import {
  isNumber,
  updateConnections,
} from "../queries/update/UpdateConnectionQueries";
import { Cardinality } from "../datatypes/Cardinality";
import _ from "lodash";

export function getOtherConnectionElementID(
  linkID: string,
  elemID: string
): string {
  return WorkspaceLinks[linkID].source === elemID
    ? WorkspaceLinks[linkID].target
    : WorkspaceLinks[linkID].source;
}

export function setSelfLoopConnectionPoints(
  link: joint.dia.Link,
  bbox?: joint.g.Rect
) {
  const sourcePoint = link.getSourcePoint();
  const offsetX = bbox ? bbox.width / 2 + 50 : sourcePoint.x + 300;
  link.vertices([
    new joint.g.Point(sourcePoint.x, sourcePoint.y + 100),
    new joint.g.Point(sourcePoint.x + offsetX, sourcePoint.y + 100),
    new joint.g.Point(sourcePoint.x + offsetX, sourcePoint.y),
  ]);
}

export function isLinkVertexArrayEmpty(
  linkID: string,
  diagramID: string = AppSettings.selectedDiagram
): boolean {
  return (
    !(diagramID in WorkspaceLinks[linkID].vertices) ||
    WorkspaceLinks[linkID].vertices[diagramID].length === 0
  );
}

export function getConnectionElementID(linkID: string, elemID: string): string {
  return WorkspaceLinks[linkID].target === elemID
    ? WorkspaceLinks[linkID].target
    : WorkspaceLinks[linkID].source;
}

// full mode:
// A [target] <-mvp1- [source] R [mvp2 source] -mvp2-> [target] B
// A [a1..a2] <- [rl1..rl2] R [rr1..rr2] -> [b1..b2] B
//
// compact mode:
// A [A1..A2] --R-> [B1..B2] B
//
// A1 = min(rr1,a1)
// A2 = max(rr2,a2)
//
// B1 = min(rl1,b1)
// B2 = max(rl2,b2)
export function setCompactLinkCardinalitiesFromFullComponents(
  compactLinkID: string,
  mvp1linkID: string,
  mvp2linkID: string
) {
  enum comparisonMode {
    MIN,
    MAX,
  }
  const compare: (a: string, b: string, mode: comparisonMode) => string = (
    a,
    b,
    mode
  ) => {
    if (isNumber(a) && isNumber(b)) {
      return mode === comparisonMode.MIN ? (a < b ? a : b) : a < b ? b : a;
    } else {
      return mode === comparisonMode.MIN
        ? isNumber(a)
          ? a
          : b
        : isNumber(a)
        ? b
        : a;
    }
  };
  const mvp1SourceCardinality = WorkspaceLinks[mvp1linkID].sourceCardinality;
  const mvp1TargetCardinality = WorkspaceLinks[mvp1linkID].targetCardinality;
  const mvp2SourceCardinality = WorkspaceLinks[mvp2linkID].sourceCardinality;
  const mvp2TargetCardinality = WorkspaceLinks[mvp2linkID].targetCardinality;
  WorkspaceLinks[compactLinkID].sourceCardinality = new Cardinality(
    compare(
      mvp2SourceCardinality.getFirstCardinality(),
      mvp1TargetCardinality.getFirstCardinality(),
      comparisonMode.MIN
    ),
    compare(
      mvp2SourceCardinality.getSecondCardinality(),
      mvp1TargetCardinality.getSecondCardinality(),
      comparisonMode.MAX
    )
  );
  WorkspaceLinks[compactLinkID].targetCardinality = new Cardinality(
    compare(
      mvp2TargetCardinality.getFirstCardinality(),
      mvp1SourceCardinality.getFirstCardinality(),
      comparisonMode.MIN
    ),
    compare(
      mvp2TargetCardinality.getSecondCardinality(),
      mvp1SourceCardinality.getSecondCardinality(),
      comparisonMode.MAX
    )
  );
}

export function setFullLinksCardinalitiesFromCompactLink(
  compactLinkID: string,
  mvp1linkID: string,
  mvp2linkID: string
) {
  const sourceCardinality = WorkspaceLinks[compactLinkID].sourceCardinality;
  const targetCardinality = WorkspaceLinks[compactLinkID].targetCardinality;
  const sourceLinkSourceCardinality = new Cardinality(
    targetCardinality.getFirstCardinality(),
    targetCardinality.getSecondCardinality(),
    true
  );
  const sourceLinkTargetCardinality = new Cardinality(
    sourceCardinality.getFirstCardinality(),
    sourceCardinality.getSecondCardinality(),
    true
  );
  const targetLinkSourceCardinality = new Cardinality(
    sourceCardinality.getFirstCardinality(),
    sourceCardinality.getSecondCardinality(),
    true
  );
  const targetLinkTargetCardinality = new Cardinality(
    targetCardinality.getFirstCardinality(),
    targetCardinality.getSecondCardinality(),
    true
  );
  WorkspaceLinks[mvp1linkID].sourceCardinality = sourceLinkSourceCardinality;
  WorkspaceLinks[mvp1linkID].targetCardinality = sourceLinkTargetCardinality;
  WorkspaceLinks[mvp2linkID].sourceCardinality = targetLinkSourceCardinality;
  WorkspaceLinks[mvp2linkID].targetCardinality = targetLinkTargetCardinality;
}

export function isLinkVisible(
  iri: string,
  type: LinkType,
  representation: Representation
): boolean {
  switch (representation) {
    case Representation.COMPACT:
      return iri in WorkspaceTerms || type === LinkType.GENERALIZATION;
    case Representation.FULL:
      return iri in Links;
    default:
      throw new Error("Unrecognized representation");
  }
}

export function saveNewLink(
  iri: string,
  sid: string,
  tid: string,
  representation: Representation = AppSettings.representation
): string[] {
  const type = iri in Links ? Links[iri].type : LinkType.DEFAULT;
  const link = getNewLink(type);
  setLinkBoundary(link, sid, tid);
  const id = link.id as string;
  if (sid === tid)
    setSelfLoopConnectionPoints(link, paper.findViewByModel(sid).getBBox());
  setLinkBoundary(link, sid, tid);
  const queries: string[] = [];
  if (
    representation === Representation.FULL ||
    type === LinkType.GENERALIZATION
  ) {
    queries.push(...updateConnection(sid, tid, id, type, iri, true));
  } else if (representation === Representation.COMPACT) {
    const propertyId = Object.keys(WorkspaceElements).find(
      (elem) => WorkspaceElements[elem].active && elem === iri
    );
    if (!propertyId) {
      throw new Error(`Error initializing compact relationship ${id}.`);
    }
    const source = getNewLink();
    const target = getNewLink();
    const sourceId = source.id as string;
    const targetId = target.id as string;
    addLink(sourceId, mvp1IRI, propertyId, sid, type);
    addLink(targetId, mvp2IRI, propertyId, tid, type);
    queries.push(...updateConnection(sid, tid, id, type, iri, true));
    setFullLinksCardinalitiesFromCompactLink(id, sourceId, targetId);
    queries.push(
      updateProjectElement(true, propertyId),
      updateConnections(sourceId),
      updateProjectLink(true, sourceId),
      updateConnections(targetId),
      updateProjectLink(true, targetId)
    );
  }
  if (type === LinkType.DEFAULT)
    setLabels(link, getLinkOrVocabElem(iri).labels[AppSettings.canvasLanguage]);
  if (isLinkVisible(iri, type, AppSettings.representation)) link.addTo(graph);
  return queries;
}

export function doesLinkHaveInverse(linkID: string) {
  return linkID in WorkspaceLinks && WorkspaceLinks[linkID].hasInverse;
}

export function checkDefaultCardinality(link: string) {
  if (!Links[link].defaultSourceCardinality.checkCardinalities()) {
    Links[link].defaultSourceCardinality = new Cardinality(
      AppSettings.defaultCardinalitySource.getFirstCardinality(),
      AppSettings.defaultCardinalitySource.getSecondCardinality()
    );
  }
  if (!Links[link].defaultTargetCardinality.checkCardinalities()) {
    Links[link].defaultTargetCardinality = new Cardinality(
      AppSettings.defaultCardinalityTarget.getFirstCardinality(),
      AppSettings.defaultCardinalityTarget.getSecondCardinality()
    );
  }
}

export function setLinkVertices(
  link: joint.dia.Link,
  vertices: joint.dia.Link.Vertex[]
) {
  link.vertices(_.compact(vertices));
}

export function updateConnection(
  sid: string,
  tid: string,
  linkID: string,
  type: number,
  iri: string,
  setCardinality: boolean = false
): string[] {
  addLink(linkID, iri, sid, tid, type);
  if (type === LinkType.DEFAULT && setCardinality) {
    WorkspaceLinks[linkID].sourceCardinality = new Cardinality(
      AppSettings.defaultCardinalitySource.getFirstCardinality(),
      AppSettings.defaultCardinalitySource.getSecondCardinality()
    );
    WorkspaceLinks[linkID].targetCardinality = new Cardinality(
      AppSettings.defaultCardinalityTarget.getFirstCardinality(),
      AppSettings.defaultCardinalityTarget.getSecondCardinality()
    );
  }
  return [updateConnections(linkID), updateProjectLink(true, linkID)];
}

export function updateVertices(
  id: string,
  linkVerts: joint.dia.Link.Vertex[]
): string[] {
  if (!WorkspaceLinks[id].vertices[AppSettings.selectedDiagram])
    WorkspaceLinks[id].vertices[AppSettings.selectedDiagram] = [];
  let update = [];
  let del = -1;
  for (
    let i = 0;
    i <
    Math.max(
      linkVerts.length,
      WorkspaceLinks[id].vertices[AppSettings.selectedDiagram].length
    );
    i++
  ) {
    let projVert = WorkspaceLinks[id].vertices[AppSettings.selectedDiagram][i];
    if (projVert && !linkVerts[i]) {
      del = i;
      break;
    } else if (
      !projVert ||
      projVert.x !== linkVerts[i].x ||
      projVert.y !== linkVerts[i].y
    ) {
      WorkspaceLinks[id].vertices[AppSettings.selectedDiagram][i] = {
        x: linkVerts[i].x,
        y: linkVerts[i].y,
      };
      update.push(i);
    }
  }
  let queries = [
    updateProjectLinkVertex(id, update, AppSettings.selectedDiagram),
  ];
  if (del !== -1)
    queries.push(
      updateDeleteProjectLinkVertex(
        id,
        del,
        WorkspaceLinks[id].vertices[AppSettings.selectedDiagram].length,
        AppSettings.selectedDiagram
      )
    );
  WorkspaceLinks[id].vertices[AppSettings.selectedDiagram] = linkVerts;
  return queries;
}

export function deleteConnections(id: string): string[] {
  WorkspaceLinks[id].active = false;
  if (graph.getCell(id)) graph.getCell(id).remove();
  return [
    updateProjectLink(true, id),
    LinkConfig[WorkspaceLinks[id].type].update(id),
  ];
}

export function deleteLink(id: string): string[] {
  const queries: string[] = [];
  if (AppSettings.representation === Representation.FULL) {
    queries.push(...deleteConnections(id));
    const compactConn = Object.keys(WorkspaceLinks).find(
      (link) =>
        WorkspaceLinks[link].active &&
        WorkspaceLinks[link].iri === WorkspaceLinks[id].source &&
        WorkspaceLinks[link].target === WorkspaceLinks[id].target
    );
    if (compactConn) {
      queries.push(...deleteConnections(compactConn));
    }
    return queries;
  } else {
    const deleteLinks = getUnderlyingFullConnections(id as string);
    if (
      deleteLinks &&
      WorkspaceLinks[deleteLinks.src] &&
      WorkspaceLinks[deleteLinks.tgt]
    ) {
      WorkspaceLinks[deleteLinks.src].active = false;
      WorkspaceLinks[deleteLinks.tgt].active = false;
      queries.push(
        ...deleteConnections(deleteLinks.src),
        ...deleteConnections(deleteLinks.tgt)
      );
    }
    queries.push(...deleteConnections(id));
    WorkspaceLinks[id].active = false;
    AppSettings.selectedLinks = [];
  }
  return queries;
}

export function addLinkTools(
  linkView: joint.dia.LinkView,
  transaction: Function,
  update: Function
) {
  const id = linkView.model.id as string;
  const verticesTool = new joint.linkTools.Vertices({ stopPropagation: false });
  const segmentsTool = new joint.linkTools.Segments({ stopPropagation: false });
  const removeButton = new joint.linkTools.Remove({
    distance: 5,
    action: (_, view) => {
      view.model.remove();
      transaction(...deleteLink(id));
      update();
    },
  });
  const readOnly =
    WorkspaceVocabularies[
      getVocabularyFromScheme(
        WorkspaceTerms[WorkspaceLinks[id].source].inScheme
      )
    ].readOnly;
  const tools = [verticesTool, segmentsTool];
  if (!readOnly) tools.push(removeButton);
  const toolsView = new joint.dia.ToolsView({
    tools: tools,
  });
  linkView.addTools(toolsView);
}
