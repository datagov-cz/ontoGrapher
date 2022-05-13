import * as joint from "jointjs";
import React from "react";
import { getNewLink } from "../function/FunctionGetVars";
import { zoomDiagram } from "../function/FunctionDiagram";
import { graphElement } from "../graph/GraphElement";
import { CardinalityPool } from "../config/Variables";
import { LinkType } from "../config/Enum";
import { getStereotypeList } from "../function/FunctionEditVars";

type State = {};

type Props = {
  width: string;
  height: string;
  fitContent: boolean;
  terms: {
    [key: string]: {
      name: string;
      types: string[];
      parameter?: boolean;
      optional?: boolean;
      multiple?: boolean;
    };
  };
  conns: {
    [key: string]: {
      name: string;
      to: string;
      from: string;
      sourceCardinality: string;
      targetCardinality: string;
      linkType: LinkType;
    };
  };
};

var paper: joint.dia.Paper;

export default class PatternInternalView extends React.Component<Props, State> {
  private graph: joint.dia.Graph = new joint.dia.Graph();
  private readonly canvasRef: React.RefObject<HTMLDivElement> =
    React.createRef();
  private drag: { x: any; y: any } | undefined = undefined;

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    this.graph.clear();
    const numberOfElements = Object.keys(this.props.terms).length;
    const centerX = paper.getComputedSize().width / 2;
    const centerY = paper.getComputedSize().height / 2;
    const radius = 200 + numberOfElements * 50;
    Object.keys(this.props.terms).forEach((p, i) => {
      const x =
        centerX + radius * Math.cos((i * 2 * Math.PI) / numberOfElements);
      const y =
        centerY + radius * Math.sin((i * 2 * Math.PI) / numberOfElements);
      const element = new graphElement({ id: p });
      element.position(x, y);
      element.addTo(this.graph);
      const labels: string[] = [];
      getStereotypeList(this.props.terms[p].types).forEach((str) =>
        labels.push("«" + str.toLowerCase() + "»")
      );
      labels.push(this.props.terms[p].name);
      element.prop("attrs/label/text", labels.join("\n"));
      const width = Math.max(
        labels.reduce((a, b) => (a.length > b.length ? a : b), "").length * 10 +
          4,
        0
      );
      element.prop("attrs/text/x", width / 2);
      const attrHeight = 24 + (labels.length - 1) * 18;
      const height = attrHeight;
      element.prop("attrs/labelAttrs/y", attrHeight);
      element.resize(width, height);
      element.attr({
        bodyBox: {
          display: "block",
          width: width,
          height: height,
          fill: "#FFFFFF",
        },
      });
      if (this.props.terms[p].optional) {
        element.attr({
          bodyBox: { fillOpacity: "0.5" },
        });
      }
      if (this.props.terms[p].multiple) {
        element.attr({
          bodyBox: {
            strokeDasharray: "5,5",
            stroke: "green",
          },
        });
      }
    });
    Object.keys(this.props.conns).forEach((conn) => {
      const link = getNewLink(this.props.conns[conn].linkType);
      link.source({ id: this.props.conns[conn].from });
      link.target({ id: this.props.conns[conn].to });
      link.labels([]);
      link.appendLabel({
        attrs: { text: { text: this.props.conns[conn].name } },
        position: { distance: 0.5 },
      });
      const sourceCardinality =
        CardinalityPool[parseInt(this.props.conns[conn].sourceCardinality, 10)];
      const targetCardinality =
        CardinalityPool[parseInt(this.props.conns[conn].targetCardinality, 10)];
      if (sourceCardinality && sourceCardinality.getString() !== "") {
        link.appendLabel({
          attrs: {
            text: { text: sourceCardinality.getString() },
          },
          position: { distance: 50 },
        });
      }
      if (targetCardinality && targetCardinality.getString() !== "") {
        link.appendLabel({
          attrs: {
            text: { text: targetCardinality.getString() },
          },
          position: { distance: -50 },
        });
      }
      link.addTo(this.graph);
    });
    paper.scaleContentToFit({
      padding: 10,
      maxScale: 2,
      minScale: 0.1,
    });
  }

  componentDidMount() {
    const node = this.canvasRef.current! as HTMLElement;
    paper = new joint.dia.Paper({
      el: node,
      model: this.graph,
      width: "100%",
      height: this.props.height,
      gridSize: 1,
      linkPinning: false,
      background: {
        color: "#e3e3e3",
      },
      clickThreshold: 0,
      async: false,
      sorting: joint.dia.Paper.sorting.APPROX,
      connectionStrategy: joint.connectionStrategies.pinAbsolute,
      defaultConnectionPoint: {
        name: "boundary",
        args: { sticky: true, selector: "bodyBox" },
      },
      defaultLink: function () {
        return getNewLink();
      },
    });
    paper.on({
      "blank:pointerdown": (evt: JQuery.Event, x: number, y: number) => {
        if (evt.button === 0) {
          const scale = paper.scale();
          this.drag = { x: x * scale.sx, y: y * scale.sy };
        }
      },
      "blank:mousewheel": (evt, x, y, delta) => {
        evt.preventDefault();
        zoomDiagram(x, y, delta, paper, false);
      },
      "blank:pointerup": () => {
        this.drag = undefined;
      },
    });
    const numberOfElements = Object.keys(this.props.terms).length;
    const centerX = paper.getComputedSize().width / 2;
    const centerY = paper.getComputedSize().height / 2;
    const radius = 200 + numberOfElements * 50;
    Object.keys(this.props.terms).forEach((p, i) => {
      const x =
        centerX + radius * Math.cos((i * 2 * Math.PI) / numberOfElements);
      const y =
        centerY + radius * Math.sin((i * 2 * Math.PI) / numberOfElements);
      const element = new graphElement({ id: p });
      element.position(x, y);
      element.addTo(this.graph);
      const labels: string[] = [];
      getStereotypeList(this.props.terms[p].types).forEach((str) =>
        labels.push("«" + str.toLowerCase() + "»")
      );
      labels.push(this.props.terms[p].name);
      element.prop("attrs/label/text", labels.join("\n"));
      const width = Math.max(
        labels.reduce((a, b) => (a.length > b.length ? a : b), "").length * 10 +
          4,
        0
      );
      element.prop("attrs/text/x", width / 2);
      const attrHeight = 24 + (labels.length - 1) * 18;
      const height = attrHeight;
      element.prop("attrs/labelAttrs/y", attrHeight);
      element.resize(width, height);
      element.attr({
        bodyBox: {
          display: "block",
          width: width,
          height: height,
          fill: "#FFFFFF",
        },
      });
      if (this.props.terms[p].optional) {
        element.attr({
          bodyBox: { fillOpacity: "0.5" },
        });
      }
      if (this.props.terms[p].multiple) {
        element.attr({
          bodyBox: {
            strokeDasharray: "5,5",
            stroke: "green",
          },
        });
      }
    });
    Object.keys(this.props.conns).forEach((conn) => {
      const link = getNewLink(this.props.conns[conn].linkType);
      link.source({ id: this.props.conns[conn].from });
      link.target({ id: this.props.conns[conn].to });
      link.labels([]);
      link.appendLabel({
        attrs: { text: { text: this.props.conns[conn].name } },
        position: { distance: 0.5 },
      });
      const sourceCardinality =
        CardinalityPool[parseInt(this.props.conns[conn].sourceCardinality, 10)];
      const targetCardinality =
        CardinalityPool[parseInt(this.props.conns[conn].targetCardinality, 10)];
      if (sourceCardinality && sourceCardinality.getString() !== "") {
        link.appendLabel({
          attrs: {
            text: { text: sourceCardinality.getString() },
          },
          position: { distance: 50 },
        });
      }
      if (targetCardinality && targetCardinality.getString() !== "") {
        link.appendLabel({
          attrs: {
            text: { text: targetCardinality.getString() },
          },
          position: { distance: -50 },
        });
      }
      link.addTo(this.graph);
    });
    paper.scaleContentToFit({
      padding: 10,
      maxScale: 2,
      minScale: 0.1,
    });
  }

  render() {
    return (
      <div
        onMouseMove={(event) => {
          if (this.drag) {
            paper.translate(
              event.nativeEvent.offsetX - this.drag.x,
              event.nativeEvent.offsetY - this.drag.y
            );
          }
        }}
        style={{ width: this.props.width, height: this.props.height }}
        ref={this.canvasRef}
      ></div>
    );
  }
}
