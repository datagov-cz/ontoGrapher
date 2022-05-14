import { Instances, Patterns } from "./PatternTypes";
import { v4 } from "uuid";
import {
  AppSettings,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import {
  formElementData,
  formRelationshipData,
} from "../creation/PatternViewColumn";
import { paper } from "../../main/DiagramCanvas";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { createNewConcept } from "../../function/FunctionElem";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../../queries/update/UpdateElementQueries";
import { Representation } from "../../config/Enum";
import { saveNewLink } from "../../function/FunctionLink";
import { graph } from "../../graph/Graph";
import { graphElement } from "../../graph/GraphElement";
import {
  getActiveToConnections,
  getElementShape,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getNewLink,
} from "../../function/FunctionGetVars";
import * as joint from "jointjs";
import * as _ from "lodash";
import { setLabels } from "../../function/FunctionGraph";
import { Shapes } from "../../config/visual/Shapes";

export function produceOttrPattern(pattern: string) {
  return [
    `<${pattern}> a ottr:Pattern.`,
    `<${pattern}> skos:prefLabel "${Patterns[pattern].title}".`,
    `<${pattern}> dc:creator "${Patterns[pattern].author}".`,
    `<${pattern}> pav:createdOn "${Patterns[pattern].date}"^xsd:dateTime.`,
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
          `ottr:variable _:b${t}]`,
        ].join("")
      ),
    ...Object.keys(Patterns[pattern].terms)
      .filter((t) => !Patterns[pattern].terms[t].parameter)
      .map((t) =>
        ["[", `ottr:type xsd:string;`, `ottr:variable _:b${t}]`].join("")
      ),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return ["[", `ottr:type xsd:string;`, `ottr:variable _:b${c}]`].join("");
    }),
    ");",
    ...Object.keys(Patterns[pattern].terms).map((t) =>
      [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${t} a og:term)`,
        "];",
      ].join("")
    ),
    ...Object.keys(Patterns[pattern].terms).map((t) =>
      [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${t} og:name "${Patterns[pattern].terms[t].name}")`,
        "];",
      ].join("")
    ),
    ...Object.keys(Patterns[pattern].terms)
      .filter((t) => Patterns[pattern].terms[t].types.length > 0)
      .map((t) =>
        [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${t} a "${Patterns[pattern].terms[t].types[0]}")`,
          "];",
        ].join("")
      ),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${c} a og:conn)`,
        "];",
      ].join("");
    }),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${c} og:name "${Patterns[pattern].conns[c].name}")`,
        "];",
      ].join("");
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
          `ottr:values (_:b${c} og:from _:${Patterns[pattern].conns[c].from})`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:to _:${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:from _:b${Patterns[pattern].conns[c].from}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:to _:b${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:from _:b${Patterns[pattern].conns[c].from}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:to _:b${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:from _:b${Patterns[pattern].conns[c].from}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:to _:b${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
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
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
      }),
  ].join("");
}

export function createInstance(
  pattern: string,
  elements: { [key: string]: formElementData },
  connections: { [key: string]: formRelationshipData }
): { instance: string; queries: string[] } {
  const instanceTerms: { [key: string]: string } = {};
  const instanceConns: { [key: string]: string } = {};
  for (const e in elements) {
    if (!elements[e].iri || elements[e].iri in WorkspaceTerms)
      return { instance: "", queries: [] };
    instanceTerms[e] = elements[e].iri;
  }
  for (const c in connections) {
    if (!connections[c].iri || connections[c].iri in WorkspaceTerms)
      return { instance: "", queries: [] };
    instanceConns[c] = connections[c].iri;
  }
  const queries: string[] = [];
  const matrixLength = Math.max(
    Object.keys(elements).length + Object.keys(connections).length
  );
  const matrixDimension = Math.ceil(Math.sqrt(matrixLength));
  const startingCoords = paper.clientToLocalPoint({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  Object.values(elements)
    .filter((t) => t.create)
    .forEach((t, i) => {
      const x = i % matrixDimension;
      const y = Math.floor(i / matrixDimension);
      const id = createNewConcept(
        { x: startingCoords.x + x * 200, y: startingCoords.y + y * 200 },
        initLanguageObject(t.name),
        AppSettings.canvasLanguage,
        t.scheme,
        t.types
      );
      queries.push(id);
    });
  Object.values(connections)
    .filter((t) => t.create)
    .forEach((c, i) => {
      const x = (i + Object.keys(elements).length) % matrixDimension;
      const y = Math.floor(
        (i + Object.keys(elements).length) / matrixDimension
      );
      const id = createNewConcept(
        { x: startingCoords.x + x * 200, y: startingCoords.y + y * 200 },
        initLanguageObject(c.name),
        AppSettings.canvasLanguage,
        c.scheme,
        [parsePrefix("z-sgov-pojem", "typ-vztahu")]
      );
      queries.push(
        updateProjectElement(true, id),
        updateProjectElementDiagram(AppSettings.selectedDiagram, id),
        ...saveNewLink(
          id,
          elements[c.from].iri,
          elements[c.to].iri,
          Representation.COMPACT
        )
      );
    });
  const id = v4();
  Instances[id] = {
    iri: pattern,
    terms: instanceTerms,
    conns: instanceConns,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
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
    graph
      .getElements()
      .filter((elem) =>
        Object.values(Instances[instance].terms).includes(elem.id as string)
      )
  );
  const elem = new graphElement({ id: instance });
  const label = Patterns[Instances[instance].iri].title;
  const labels: string[] = [];
  labels.push(label === "" ? "<blank>" : label);
  elem.prop("attrs/label/text", labels.join("\n"));
  const text: string[] = [];
  text.push(
    ...Object.entries(Instances[instance].terms).map(
      ([name, iri]) =>
        `${
          Patterns[Instances[instance].iri].terms[name].name
        }: ${getLabelOrBlank(
          WorkspaceTerms[iri].labels,
          AppSettings.canvasLanguage
        )}`
    )
  );
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
  for (const term of Object.values(Instances[instance].terms)) {
    getActiveToConnections(term)
      .filter((link) =>
        graph
          .getElements()
          .find((elem) => elem.id === WorkspaceLinks[link].target)
      )
      .forEach((link) => {
        const lnk = getNewLink(WorkspaceLinks[link].type, link);
        setLabels(
          lnk,
          getLinkOrVocabElem(WorkspaceLinks[link].iri).labels[
            AppSettings.canvasLanguage
          ]
        );
        lnk.source({
          id: instance,
          connectionPoint: {
            name: "boundary",
            args: { selector: Shapes["default"].body },
          },
        });
        lnk.target({
          id: WorkspaceLinks[link].target,
          connectionPoint: {
            name: "boundary",
            args: {
              selector: getElementShape(WorkspaceLinks[link].target),
            },
          },
        });
        lnk.on({ change: () => adjustVertices(graph, lnk) });
        lnk.addTo(graph);
      });
    for (const link of Object.keys(WorkspaceLinks).filter(
      (link) =>
        WorkspaceLinks[link].active &&
        WorkspaceLinks[link].target === term &&
        graph
          .getElements()
          .find((elem) => elem.id === WorkspaceLinks[link].source)
    )) {
      const lnk = getNewLink(WorkspaceLinks[link].type, link);
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
          args: {
            selector: getElementShape(WorkspaceLinks[link].source),
          },
        },
      });
      lnk.target({
        id: instance,
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
for (const instance of Object.keys(Instances)) {
  for (const conn of Object.values(Instances[instance].conns)) {
    const fromElement = WorkspaceLinks[conn].source;
    const toElement = WorkspaceLinks[conn].target;
    const fromInstance = Object.keys(Instances).find((instance) =>
      Object.values(Instances[instance].terms).includes(fromElement)
    );
    const toInstance = Object.keys(Instances).find((instance) =>
      Object.values(Instances[instance].terms).includes(toElement)
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
