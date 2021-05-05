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
  getElementShape,
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
import { mvp1IRI, mvp2IRI, setLabels } from "./FunctionGraph";
import { paper } from "../main/DiagramCanvas";
import {
  updateDeleteProjectLinkVertex,
  updateProjectLink,
  updateProjectLinkVertex,
} from "../queries/update/UpdateLinkQueries";
import { LinkConfig } from "../config/logic/LinkConfig";
import { updateConnections } from "../queries/update/UpdateConnectionQueries";

export function getOtherConnectionElementID(
  linkID: string,
  elemID: string
): string {
  return WorkspaceLinks[linkID].source === elemID
    ? WorkspaceLinks[linkID].target
    : WorkspaceLinks[linkID].source;
}

export function getConnectionElementID(linkID: string, elemID: string): string {
  return WorkspaceLinks[linkID].target === elemID
    ? WorkspaceLinks[linkID].target
    : WorkspaceLinks[linkID].source;
}

export function saveNewLink(iri: string, sid: string, tid: string): string[] {
  const type = iri in Links ? Links[iri].type : LinkType.DEFAULT;
  let link = getNewLink(type);
  link.source({
    id: sid,
    connectionPoint: {
      name: "boundary",
      args: { selector: getElementShape(sid) },
    },
  });
  link.target({
    id: tid,
    connectionPoint: {
      name: "boundary",
      args: { selector: getElementShape(tid) },
    },
  });
  link.addTo(graph);
  const s = link.getSourceElement();
  const t = link.getTargetElement();
  if (s && t) {
    const id = link.id as string;
    const sid = s.id as string;
    const tid = t.id as string;
    if (sid === tid) {
      const coords = link.getSourcePoint();
      const bbox = paper.findViewByModel(sid).getBBox();
      if (bbox) {
        link.vertices([
          new joint.g.Point(coords.x, coords.y + 100),
          new joint.g.Point(coords.x + bbox.width / 2 + 50, coords.y + 100),
          new joint.g.Point(coords.x + bbox.width / 2 + 50, coords.y),
        ]);
      }
    }
    link.source({
      id: sid,
      connectionPoint: {
        name: "boundary",
        args: { selector: getElementShape(sid) },
      },
    });
    link.target({
      id: tid,
      connectionPoint: {
        name: "boundary",
        args: { selector: getElementShape(tid) },
      },
    });
    let queries: string[] = [];
    if (
      AppSettings.representation === Representation.FULL ||
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

export function deleteConnections(sid: string, id: string): string[] {
  WorkspaceLinks[id].active = false;
  if (graph.getCell(id)) graph.getCell(id).remove();
  return [
    updateProjectLink(true, id),
    LinkConfig[WorkspaceLinks[id].type].update(id)
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
        const sid = view.model.getSourceCell()?.id as string;
        let queries: string[] = [...deleteConnections(sid, id)];
        const compactConn = Object.keys(WorkspaceLinks).find(
          (link) =>
            WorkspaceLinks[link].active &&
            WorkspaceLinks[link].iri ===
            WorkspaceElements[WorkspaceLinks[id].source].iri &&
            WorkspaceLinks[link].target === WorkspaceLinks[id].target
        );
        if (compactConn) {
          queries.push(
            ...deleteConnections(
              WorkspaceLinks[compactConn].source,
              compactConn
            )
          );
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
            ...deleteConnections(
              WorkspaceLinks[deleteLinks.src].source,
              deleteLinks.src
            ),
            ...deleteConnections(
              WorkspaceLinks[deleteLinks.src].source,
              deleteLinks.tgt
            )
          );
        }
        const sid = view.model.getSourceCell()?.id as string;
        queries.push(...deleteConnections(sid, id));
        view.model.remove();
        WorkspaceLinks[view.model.id].active = false;
        update();
        AppSettings.selectedLink = "";
        transaction(...queries);
      }
    },
  });
  let readOnly =
    WorkspaceVocabularies[
      getVocabularyFromScheme(
        WorkspaceTerms[WorkspaceElements[WorkspaceLinks[id].source].iri]
          .inScheme
      )
      ].readOnly;
  let tools = [verticesTool, segmentsTool];
  if (!readOnly) tools.push(removeButton);
  let toolsView = new joint.dia.ToolsView({
    tools: tools
  });
  linkView.addTools(toolsView);
}
