import { Instances, Patterns } from "./PatternTypes";
import { v4 } from "uuid";
import {
  AppSettings,
  Diagrams,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import {
  formElementData,
  formRelationshipData,
} from "../creation/PatternViewColumn";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { createNewConcept } from "../../function/FunctionElem";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../../queries/update/UpdateElementQueries";
import { LinkType, Representation } from "../../config/Enum";
import {
  saveNewLink,
  setSelfLoopConnectionPoints,
  updateConnection,
} from "../../function/FunctionLink";
import { graph } from "../../graph/Graph";
import { graphElement } from "../../graph/GraphElement";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getNewLink,
} from "../../function/FunctionGetVars";
import * as joint from "jointjs";
import * as _ from "lodash";
import {
  setLabels,
  setLinkBoundary,
  setRepresentation,
} from "../../function/FunctionGraph";
import { Shapes } from "../../config/visual/Shapes";
import { paper } from "../../main/DiagramCanvas";

export function produceOttrInstance(instance: string) {
  const instanceOBJ = Instances[instance];
  return [
    `<${instance}> ottr:of <${instanceOBJ.iri}>.`,
    `<${instance}> og:position-x "${instanceOBJ.x}".`,
    `<${instance}> og:position-y "${instanceOBJ.y}".`,
    `<${instance}> og:context <${AppSettings.contextIRI}>.`,
    `<${instance}> ottr:values (`,
    ...Object.values(instanceOBJ.terms).flatMap((term) => ` <${term}> `),
    ...Object.values(instanceOBJ.conns).map((term) => ` "${term}" `),
    `).`,
    `<${instance}> og:name (`,
    ...Object.keys(instanceOBJ.terms).map((name) => ` <${name}> `),
    ...Object.keys(instanceOBJ.conns).map((name) => ` <${name}> `),
    ")",
  ].join(`
  `);
}

export function produceOttrPattern(pattern: string) {
  return [
    `<${pattern}> rdf:type ottr:Pattern.`,
    `<${pattern}> skos:prefLabel "${Patterns[pattern].title}".`,
    `<${pattern}> dc:creator "${Patterns[pattern].author}".`,
    `<${pattern}> pav:createdOn "${Patterns[pattern].date}".`,
    `<${pattern}> dc:description "${Patterns[pattern].description}".`,
    `<${pattern}> ottr:parameters (`,
    ...Object.keys(Patterns[pattern].terms)
      .filter((t) => Patterns[pattern].terms[t].parameter)
      .map((t) =>
        [
          "[",
          Patterns[pattern].terms[t].multiple
            ? `ottr:type (ottr:NEList ${
                Patterns[pattern].terms[t].types.length > 0
                  ? `<${Patterns[pattern].terms[t].types[0]}>`
                  : "ottr:IRI"
              })`
            : "",
          !Patterns[pattern].terms[t].multiple
            ? `ottr:type ${
                Patterns[pattern].terms[t].types.length > 0
                  ? `<${Patterns[pattern].terms[t].types[0]}>`
                  : "ottr:IRI"
              };`
            : "",
          Patterns[pattern].terms[t].optional
            ? "ottr:modifier ottr:optional;"
            : "",
          `ottr:variable <${pattern}/${t}>]`,
        ].join("")
      ),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return ["[", `ottr:type ottr:IRI;`, `ottr:variable  <${pattern}/${c}>]`]
        .join(`
  `);
    }),
    // end of parameters
    ");",
    ...Object.keys(Patterns[pattern].terms).map((t) =>
      [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (<${pattern}/${t}> rdf:type og:term)`,
        "];",
      ].join("")
    ),
    ...Object.keys(Patterns[pattern].terms).map((t) =>
      [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (<${pattern}/${t}> og:name "${Patterns[pattern].terms[t].name}")`,
        "];",
      ].join("")
    ),
    ...Object.keys(Patterns[pattern].terms)
      .filter((t) => Patterns[pattern].terms[t].types.length > 0)
      .map((t) =>
        [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${t}> rdf:type "${Patterns[pattern].terms[t].types[0]}")`,
          "];",
        ].join("")
      ),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (<${pattern}/${c}> rdf:type og:conn)`,
        "];",
      ].join(`
  `);
    }),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (<${pattern}/${c}> og:name "${Patterns[pattern].conns[c].name}")`,
        "];",
      ].join(`
  `);
    }),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (<${pattern}/${c}> og:type "${Patterns[pattern].conns[c].linkType}")`,
        "];",
      ].join(`
  `);
    }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:from <${pattern}/${Patterns[pattern].conns[c].from}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:to <${pattern}/${Patterns[pattern].conns[c].to}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (<${pattern}/${c}> og:from <${pattern}/${Patterns[pattern].conns[c].from}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:to <${pattern}/${Patterns[pattern].conns[c].to}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:from <${pattern}/${Patterns[pattern].conns[c].from}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (<${pattern}/${c}> og:to <${pattern}/${Patterns[pattern].conns[c].to}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (<${pattern}/${c}> og:from <${pattern}/${Patterns[pattern].conns[c].from}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (<${pattern}/${c}> og:to <${pattern}/${Patterns[pattern].conns[c].to}>)`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join(`
  `);
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (<${pattern}/${c}> og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join(`
  `);
      }),
  ].join(`
  `);
}

export function createInstance(
  pattern: string,
  elements: { [key: string]: formElementData },
  connections: { [key: string]: formRelationshipData },
  startingCoords: { x: number; y: number } = Diagrams[
    AppSettings.selectedDiagram
  ].origin
): { instance: string; queries: string[] } {
  const instanceTerms: { [key: string]: string[] } = {};
  const termIDs: { [key: string]: string[] } = {};
  const instanceConns: { [key: string]: string } = {};
  const connIDs: { [key: string]: string } = {};
  for (const e in elements) {
    if (!instanceTerms[elements[e].parameter]) {
      instanceTerms[elements[e].parameter] = [];
      termIDs[elements[e].parameter] = [];
    }
    if (!elements[e].iri) return { instance: "", queries: [] };
    instanceTerms[elements[e].parameter].push(elements[e].iri);
  }
  for (const c in connections) {
    if (!connections[c].iri) return { instance: "", queries: [] };
    instanceConns[c] = connections[c].iri;
    connIDs[c] = "";
  }
  const queries: string[] = [];
  const matrixLength = Math.max(
    Object.keys(elements).length + Object.keys(connections).length
  );
  const matrixDimension = Math.ceil(Math.sqrt(matrixLength));
  const origin = startingCoords;
  Object.values(elements)
    .filter((t) => t.create && t.use)
    .forEach((t, i) => {
      const x = i % matrixDimension;
      const y = Math.floor(i / matrixDimension);
      const id = createNewConcept(
        { x: 200 + origin.x + x * 200, y: 200 + origin.y + y * 200 },
        initLanguageObject(t.name),
        AppSettings.canvasLanguage,
        t.scheme,
        t.types
      );
      termIDs[t.parameter].push(id);
      queries.push(
        updateProjectElement(true, id),
        updateProjectElementDiagram(AppSettings.selectedDiagram, id)
      );
    });
  Object.entries(connections)
    .filter(([_, t]) => t.create)
    .forEach(([k, c], i) => {
      if (c.linkType === LinkType.DEFAULT) {
        const x = (i + Object.keys(elements).length) % matrixDimension;
        const y = Math.floor(
          (i + Object.keys(elements).length) / matrixDimension
        );
        const id = createNewConcept(
          { x: origin.x + x * 200, y: origin.y + y * 200 },
          initLanguageObject(c.name),
          AppSettings.canvasLanguage,
          c.scheme,
          [parsePrefix("z-sgov-pojem", "typ-vztahu")]
        );
        connIDs[k] = id;
        queries.push(
          updateProjectElement(true, id),
          updateProjectElementDiagram(AppSettings.selectedDiagram, id),
          ...saveNewLink(
            id,
            elements[c.from].iri,
            elements[c.to].iri,
            Representation.COMPACT,
            c.sourceCardinality,
            c.targetCardinality
          )
        );
      } else if (c.linkType === LinkType.GENERALIZATION) {
        const link = getNewLink(c.linkType);
        const sid = elements[c.from].iri;
        const tid = elements[c.to].iri;
        setLinkBoundary(link, sid, tid);
        const id = link.id as string;
        connIDs[k] = id;
        if (sid === tid)
          setSelfLoopConnectionPoints(
            link,
            paper.findViewByModel(sid).getBBox()
          );
        setLinkBoundary(link, sid, tid);
        queries.push(
          ...updateConnection(
            sid,
            tid,
            id,
            c.linkType,
            c.iri,
            !(!!c.sourceCardinality && !!c.targetCardinality)
          )
        );
      }
    });
  const id = `${AppSettings.ontographerContext}/instance/${v4()}`;
  Instances[id] = {
    iri: pattern,
    terms: instanceTerms,
    conns: connIDs,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
  setRepresentation(Representation.COMPACT);
  return { instance: id, queries: queries };
}

export function adjustVertices(
  graph: joint.dia.Graph,
  cell: joint.dia.Element | joint.dia.Link
) {
  // cell = cell.model || cell;
  if (cell instanceof joint.dia.Element) {
    _.chain(graph.getConnectedLinks(cell))
      .groupBy(
        (link) => _.omit([link.source().id, link.target().id], [cell.id])[0]
      )
      .each((group, key) => {
        if (key !== "undefined") adjustVertices(graph, _.first(group)!);
      })
      .value();
    return;
  }

  const sourceId = cell.get("source").id || cell.previous("source").id;
  const targetId = cell.get("target").id || cell.previous("target").id;

  if (!sourceId || !targetId) return;

  const siblings = _.filter(graph.getLinks(), function (sibling) {
    const siblingSourceId = sibling.source().id;
    const siblingTargetId = sibling.target().id;
    return (
      (siblingSourceId === sourceId && siblingTargetId === targetId) ||
      (siblingSourceId === targetId && siblingTargetId === sourceId)
    );
  });

  const numSiblings = siblings.length;
  switch (numSiblings) {
    case 0: {
      break;
    }
    case 1: {
      cell.unset("vertices");
      break;
    }
    default: {
      const sourceCenter = graph.getCell(sourceId).getBBox().center();
      const targetCenter = graph.getCell(targetId).getBBox().center();
      const midPoint = new joint.g.Line(sourceCenter, targetCenter).midpoint();
      const theta = sourceCenter.theta(targetCenter);
      const GAP = 20;
      _.each(siblings, function (sibling, index) {
        let offset = GAP * Math.ceil(index / 2);
        const sign = index % 2 ? 1 : -1;
        if (numSiblings % 2 === 0) {
          offset -= (GAP / 2) * sign;
        }
        const reverse = theta < 180 ? 1 : -1;
        const angle = joint.g.toRad(theta + sign * reverse * 90);
        const vertex = joint.g.Point.fromPolar(offset, angle, midPoint);
        sibling.vertices([vertex]);
      });
    }
  }
}

export function putInstanceOnCanvas(instance: string) {
  graph.removeCells(
    graph.getElements().filter((elem) =>
      Object.values(Instances[instance].terms)
        .flat()
        .includes(elem.id as string)
    )
  );
  const elem = new graphElement({ id: instance });
  const label = Patterns[Instances[instance].iri].title;
  const labels: string[] = [];
  labels.push(label === "" ? "<blank>" : label);
  elem.prop("attrs/label/text", labels.join("\n"));
  const text: string[] = [];
  for (const [name, iri] of Object.entries(Instances[instance].terms)) {
    for (const i of iri) {
      text.push(
        `${
          Patterns[Instances[instance].iri].terms[name].name
        }: ${getLabelOrBlank(
          WorkspaceTerms[i].labels,
          AppSettings.canvasLanguage
        )}`
      );
    }
  }
  elem.prop("attrs/labelAttrs/text", text.join("\n"));
  const width = Math.max(
    labels.reduce((a, b) => (a.length > b.length ? a : b), "").length * 10 + 4,
    text.length > 0
      ? 8 * text.reduce((a, b) => (a.length > b.length ? a : b), "").length
      : 0
  );
  elem.prop("attrs/text/x", width / 2);
  const attrHeight = 24 + (labels.length - 1) * 18;
  const height = (text.length > 0 ? 4 + text.length * 14 : 0) + attrHeight;
  elem.prop("attrs/labelAttrs/y", attrHeight);
  elem.resize(width, height);
  elem.addTo(graph);
  elem.on({
    "cell:pointerup": () => adjustVertices(graph, elem),
  });
  elem.attr({
    bodyBox: {
      display: "block",
      width: width,
      height: height,
      strokeDasharray: "none",
      stroke: "black",
      fill: "#FFFFFF",
    },
  });
  const elems: string[] = _.uniq([
    ...Object.values(Instances[instance].terms).flat(),
  ]);
  const links: string[] = _.uniq([...Object.values(Instances[instance].conns)]);
  const linkIDs: string[] = Object.keys(WorkspaceLinks).filter((link) =>
    links.includes(WorkspaceLinks[link].iri)
  );
  for (const elem of elems) {
    const elemInstance = Object.keys(Instances).find((instance) =>
      Object.values(Instances[instance].terms).flat().includes(elem)
    );
    const elemLinks = linkIDs.filter(
      (link) => WorkspaceLinks[link].source === elem
    );
    for (const link of elemLinks) {
      const otherElem = WorkspaceLinks[link].target;
      const otherElemInstance = Object.keys(Instances).find((instance) =>
        Object.values(Instances[instance].terms).flat().includes(otherElem)
      );
      if (
        elemInstance &&
        otherElemInstance &&
        otherElemInstance !== elemInstance
      ) {
        const label = Object.keys(Instances[elemInstance].terms).find((name) =>
          Instances[elemInstance].terms[name].includes(elem)
        );
        const lnk = getNewLink(WorkspaceLinks[link].type, link);
        setLabels(
          lnk,
          Patterns[Instances[elemInstance].iri].terms[label!].name
        );
        lnk.source({
          id: elemInstance,
          connectionPoint: {
            name: "boundary",
            args: { selector: Shapes["default"].body },
          },
        });
        lnk.target({
          id: otherElemInstance,
          connectionPoint: {
            name: "boundary",
            args: {
              selector: Shapes["default"].body,
            },
          },
        });
        lnk.attr({
          line: {
            targetMarker: {
              stroke: "none",
              fill: "none",
            },
          },
        });
        lnk.on({ change: () => adjustVertices(graph, lnk) });
        lnk.addTo(graph);
      }
    }
  }
}
for (const instance of Object.keys(Instances)) {
  for (const conn of Object.values(Instances[instance].conns)) {
    const fromElement = WorkspaceLinks[conn].source;
    const toElement = WorkspaceLinks[conn].target;
    const fromInstance = Object.keys(Instances).find((instance) =>
      Object.values(Instances[instance].terms).flat().includes(fromElement)
    );
    const toInstance = Object.keys(Instances).find((instance) =>
      Object.values(Instances[instance].terms).flat().includes(toElement)
    );
    if (fromInstance && toInstance && fromInstance !== toInstance) {
      const lnk = getNewLink(WorkspaceLinks[conn].type, conn);
      setLabels(
        lnk,
        getLinkOrVocabElem(WorkspaceLinks[conn].iri).labels[
          AppSettings.canvasLanguage
        ]
      );
      lnk.source({
        id: fromInstance,
        connectionPoint: {
          name: "boundary",
          args: { selector: Shapes["default"].body },
        },
      });
      lnk.target({
        id: toInstance,
        connectionPoint: {
          name: "boundary",
          args: {
            selector: Shapes["default"].body,
          },
        },
      });
      lnk.on({ change: () => adjustVertices(graph, lnk) });
      lnk.addTo(graph);
    }
  }
}
