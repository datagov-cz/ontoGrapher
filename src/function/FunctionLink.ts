import {
  AppSettings,
  Links,
  PackageRoot,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { LinkType, Representation } from "../config/Enum";
import {
  getDefaultCardinality,
  getLinkOrVocabElem,
  getNewLink,
  getUnderlyingFullConnections,
  getVocabularyFromScheme,
} from "./FunctionGetVars";
import { graph } from "../graph/Graph";
import * as joint from "jointjs";
import { graphElement } from "../graph/GraphElement";
import { addClass, addLink } from "./FunctionCreateVars";
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
//
// A [1..1] <- [1..1] R [0..*] -> [1..1] B
// A1 = min(0,1) = 0
// A2 = max(*,1) = *
// B1 = min(1,1) = 1
// B2 = max(1,1) = 1
export function constructFullConnections(
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

export function saveNewLink(
  iri: string,
  sid: string,
  tid: string,
  representation: Representation = AppSettings.representation
): string[] {
  const type = iri in Links ? Links[iri].type : LinkType.DEFAULT;
  const link = getNewLink(type);
  setLinkBoundary(link, sid, tid);
  link.addTo(graph);
  const s = link.getSourceElement();
  const t = link.getTargetElement();
  if (s && t) {
    const id = link.id as string;
    const sid = s.id as string;
    const tid = t.id as string;
    if (sid === tid)
      setSelfLoopConnectionPoints(link, paper.findViewByModel(sid).getBBox());
    setLinkBoundary(link, sid, tid);
    let queries: string[] = [];
    if (
      representation === Representation.FULL ||
      type === LinkType.GENERALIZATION
    ) {
      queries.push(...updateConnection(sid, tid, id, type, iri, true));
    } else {
      const find = Object.keys(WorkspaceElements).find(
        (elem) =>
          WorkspaceElements[elem].active && WorkspaceElements[elem].iri === iri
      );
      let property = find ? new graphElement({ id: find }) : new graphElement();
      let source = getNewLink();
      let target = getNewLink();
      const sourceId = source.id as string;
      const propertyId = property.id as string;
      const targetId = target.id as string;
      const pkg =
        PackageRoot.children.find(
          (pkg) =>
            pkg.scheme === WorkspaceTerms[WorkspaceElements[sid].iri].inScheme
        ) || PackageRoot;
      if (!find) addClass(propertyId, iri, pkg);
      WorkspaceElements[property.id].connections.push(sourceId);
      WorkspaceElements[property.id].connections.push(targetId);
      queries.push(
        updateProjectElement(true, propertyId),
        ...updateConnection(propertyId, sid, sourceId, type, mvp1IRI),
        ...updateConnection(propertyId, tid, targetId, type, mvp2IRI),
        ...updateConnection(sid, tid, id, type, iri)
      );
    }
    if (type === LinkType.DEFAULT)
      setLabels(
        link,
        getLinkOrVocabElem(iri).labels[AppSettings.selectedLanguage]
      );
    return queries;
  } else {
    link.remove();
    return [""];
  }
}

export function doesLinkHaveInverse(linkID: string) {
  return linkID in WorkspaceLinks && WorkspaceLinks[linkID].hasInverse;
}

export function checkDefaultCardinality(link: string) {
  if (!Links[link].defaultSourceCardinality.checkCardinalities()) {
    Links[link].defaultSourceCardinality = getDefaultCardinality();
  }
  if (!Links[link].defaultTargetCardinality.checkCardinalities()) {
    Links[link].defaultTargetCardinality = getDefaultCardinality();
  }
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
  if (iri in Links && type === LinkType.DEFAULT && setCardinality) {
    WorkspaceLinks[linkID].sourceCardinality = Links[
      iri
    ].defaultSourceCardinality.isCardinalityNone()
      ? getDefaultCardinality()
      : Links[iri].defaultSourceCardinality;
    WorkspaceLinks[linkID].targetCardinality = Links[
      iri
    ].defaultTargetCardinality.isCardinalityNone()
      ? getDefaultCardinality()
      : Links[iri].defaultTargetCardinality;
  }
  WorkspaceElements[sid].connections.push(linkID);
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
    action: (evt, view) => {
      if (AppSettings.representation === Representation.FULL) {
        let queries: string[] = [...deleteConnections(id)];
        const compactConn = Object.keys(WorkspaceLinks).find(
          (link) =>
            WorkspaceLinks[link].active &&
            WorkspaceLinks[link].iri ===
              WorkspaceElements[WorkspaceLinks[id].source].iri &&
            WorkspaceLinks[link].target === WorkspaceLinks[id].target
        );
        if (compactConn) {
          queries.push(...deleteConnections(compactConn));
        }
        transaction(...queries);
      } else {
        let deleteLinks = getUnderlyingFullConnections(view.model);
        let queries: string[] = [];
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
        view.model.remove();
        WorkspaceLinks[view.model.id].active = false;
        update();
        AppSettings.selectedLink = "";
        transaction(...queries);
      }
    },
  });
  const readOnly =
    WorkspaceVocabularies[
      getVocabularyFromScheme(
        WorkspaceTerms[WorkspaceElements[WorkspaceLinks[id].source].iri]
          .inScheme
      )
    ].readOnly;
  const tools = [verticesTool, segmentsTool];
  if (!readOnly) tools.push(removeButton);
  const toolsView = new joint.dia.ToolsView({
    tools: tools,
  });
  linkView.addTools(toolsView);
}
