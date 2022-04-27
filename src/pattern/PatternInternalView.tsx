import joint from "jointjs";
import React from "react";
import { graph } from "../graph/Graph";
import { getNewLink } from "../function/FunctionGetVars";
import { zoomDiagram } from "../function/FunctionDiagram";
import { paper } from "../main/DiagramCanvas";
import { graphElement } from "../graph/GraphElement";
import { getStereotypeList } from "../function/FunctionEditVars";
import _ from "lodash";

type State = {};

type Props = {
  width: string;
  height: string;
  fitContent: boolean;
  terms: {
    name: string;
    types: string[];
    parameter: boolean;
    qualities: string[];
  }[];
  conns: {
    name: string;
    to: string;
    from: string;
    sourceCardinality: string;
    targetCardinality: string;
  }[];
};

export default class PatternInternalView extends React.Component<Props, State> {
  private graph: joint.dia.Graph = new joint.dia.Graph();
  private readonly canvasRef: React.RefObject<HTMLDivElement> =
    React.createRef();
  private drag: { x: any; y: any } | undefined = undefined;
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    const node = this.canvasRef.current! as HTMLElement;
    const paper = new joint.dia.Paper({
      el: node,
      model: graph,
      width: "100%",
      height: "100%",
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
    const numberOfElements = this.props.terms.length;
    const centerX = paper.getComputedSize().width / 2;
    const centerY = paper.getComputedSize().height / 2;
    const radius = 200 + numberOfElements * 50;
    this.props.terms.forEach((term, i) => {
      const x = centerX + radius * Math.cos((i * 2 * Math.PI) / length);
      const y = centerY + radius * Math.sin((i * 2 * Math.PI) / length);
      const element = new graphElement({ id: term.name });
      element.position(x, y);
      element.addTo(this.graph);
      const labels: string[] = [];
      getStereotypeList(term.types).forEach((str) =>
        labels.push("«" + str.toLowerCase() + "»")
      );
      labels.push(term.name);
      element.prop("attrs/label/text", labels.join("\n"));
      const text: string[] = [];
      text.push(..._.uniq(term.qualities));
      element.prop("attrs/labelAttrs/text", text.join("\n"));
      const width = Math.max(
        labels.reduce((a, b) => (a.length > b.length ? a : b), "").length * 10 +
          4,
        text.length > 0
          ? 8 * text.reduce((a, b) => (a.length > b.length ? a : b), "").length
          : 0
      );
      element.prop("attrs/text/x", width / 2);
      const attrHeight = 24 + (labels.length - 1) * 18;
      const height = (text.length > 0 ? 4 + text.length * 14 : 0) + attrHeight;
      element.prop("attrs/labelAttrs/y", attrHeight);
      element.resize(width, height);
    });
    this.props.conns.forEach((conn) => {
      const link = new joint.shapes.standard.Link();
      link.source({ id: conn.from });
      link.target({ id: conn.to });
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
