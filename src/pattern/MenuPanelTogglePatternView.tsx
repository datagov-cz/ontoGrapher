import React from "react";
import { Nav } from "react-bootstrap";
import { AppSettings, WorkspaceLinks } from "../config/Variables";
import { graph } from "../graph/Graph";
import { Instances } from "./PatternTypes";
import { graphElement } from "../graph/GraphElement";
import * as joint from "jointjs";
import * as _ from "lodash";
import { getNewLink } from "../function/FunctionGetVars";

interface Props {
  update: Function;
  close: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {
  alert: boolean;
}

export default class MenuPanelTogglePatternView extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      alert: false,
    };
  }

  switch() {
    AppSettings.patternView = !AppSettings.patternView;
    if (!AppSettings.patternView) {
      graph.removeCells(
        graph.getElements().filter((elem) => elem.id in Instances)
      );
    } else {
      for (const instance of Object.keys(Instances)) {
        graph.removeCells(
          graph
            .getElements()
            .filter((elem) =>
              Instances[instance].terms.includes(elem.id as string)
            )
        );
        const instanceElem = new graphElement({ id: instance });
        instanceElem.addTo(graph);
        instanceElem.on({
          "cell:pointerup": () => this.adjustVertices(graph, instanceElem),
        });
        for (const conn of Instances[instance].conns) {
          if (
            Instances[instance].terms.includes(WorkspaceLinks[conn].source) &&
            Instances[instance].terms.includes(WorkspaceLinks[conn].target)
          )
            graph.getCell(conn)?.remove();
          if (
            Instances[instance].terms.includes(WorkspaceLinks[conn].source) ||
            Instances[instance].terms.includes(WorkspaceLinks[conn].target)
          ) {
            const link = getNewLink();
            link.attr({
              link: {
                sourceMarker: { display: "none" },
                targetMarker: { display: "none" },
              },
            });
            link.on({ change: () => this.adjustVertices(graph, link) });
            link.source({
              id: Instances[instance].terms.includes(
                WorkspaceLinks[conn].source
              )
                ? instance
                : WorkspaceLinks[conn].source,
            });
            link.target({
              id: Instances[instance].terms.includes(
                WorkspaceLinks[conn].target
              )
                ? instance
                : WorkspaceLinks[conn].target,
            });
            link.addTo(graph);
          }
        }
      }
    }
    this.props.close();
    this.props.update();
    this.forceUpdate();
  }

  adjustVertices(
    graph: joint.dia.Graph,
    cell: joint.dia.Element | joint.dia.Link
  ) {
    // if `cell` is a view, find its model
    // cell = cell.model || cell;

    if (cell instanceof joint.dia.Element) {
      // `cell` is an element

      _.chain(graph.getConnectedLinks(cell))
        .groupBy(function (link) {
          // the key of the group is the model id of the link's source or target
          // cell id is omitted
          return _.omit([link.source().id, link.target().id], [cell.id])[0];
        })
        .each((group, key) => {
          // if the member of the group has both source and target model
          // then adjust vertices
          if (key !== "undefined") this.adjustVertices(graph, _.first(group)!);
        })
        .value();

      return;
    }

    // `cell` is a link
    // get its source and target model IDs
    var sourceId = cell.get("source").id || cell.previous("source").id;
    var targetId = cell.get("target").id || cell.previous("target").id;

    // if one of the ends is not a model
    // (if the link is pinned to paper at a point)
    // the link is interpreted as having no siblings
    if (!sourceId || !targetId) return;

    // identify link siblings
    var siblings = _.filter(graph.getLinks(), function (sibling) {
      var siblingSourceId = sibling.source().id;
      var siblingTargetId = sibling.target().id;

      // if source and target are the same
      // or if source and target are reversed
      return (
        (siblingSourceId === sourceId && siblingTargetId === targetId) ||
        (siblingSourceId === targetId && siblingTargetId === sourceId)
      );
    });

    var numSiblings = siblings.length;
    switch (numSiblings) {
      case 0: {
        // the link has no siblings
        break;
      }
      case 1: {
        // there is only one link
        // no vertices needed
        cell.unset("vertices");
        break;
      }
      default: {
        // there are multiple siblings
        // we need to create vertices

        // find the middle point of the link
        var sourceCenter = graph.getCell(sourceId).getBBox().center();
        var targetCenter = graph.getCell(targetId).getBBox().center();
        var midPoint = new joint.g.Line(sourceCenter, targetCenter).midpoint();

        // find the angle of the link
        var theta = sourceCenter.theta(targetCenter);

        // constant
        // the maximum distance between two sibling links
        var GAP = 20;

        _.each(siblings, function (sibling, index) {
          // we want offset values to be calculated as 0, 20, 20, 40, 40, 60, 60 ...
          var offset = GAP * Math.ceil(index / 2);

          // place the vertices at points which are `offset` pixels perpendicularly away
          // from the first link
          //
          // as index goes up, alternate left and right
          //
          //  ^  odd indices
          //  |
          //  |---->  index 0 sibling - centerline (between source and target centers)
          //  |
          //  v  even indices
          var sign = index % 2 ? 1 : -1;

          // to assure symmetry, if there is an even number of siblings
          // shift all vertices leftward perpendicularly away from the centerline
          if (numSiblings % 2 === 0) {
            offset -= (GAP / 2) * sign;
          }

          // make reverse links count the same as non-reverse
          var reverse = theta < 180 ? 1 : -1;

          // we found the vertex
          var angle = joint.g.toRad(theta + sign * reverse * 90);
          var vertex = joint.g.Point.fromPolar(offset, angle, midPoint);

          // replace vertices array with `vertex`
          sibling.vertices([vertex]);
        });
      }
    }
  }

  render() {
    return (
      <div className={"inert"}>
        <Nav.Link onClick={() => this.switch()}>
          {AppSettings.patternView ? "Off" : "On"}
        </Nav.Link>
      </div>
    );
  }
}
