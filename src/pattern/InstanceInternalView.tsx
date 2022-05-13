import * as joint from "jointjs";
import React from "react";
import {
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getNewLink,
} from "../function/FunctionGetVars";
import { zoomDiagram } from "../function/FunctionDiagram";
import { graphElement } from "../graph/GraphElement";
import { getStereotypeList } from "../function/FunctionEditVars";
import _ from "lodash";
import {
  AppSettings,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import { getDisplayLabel } from "../function/FunctionDraw";
import { setLabels } from "../function/FunctionGraph";

type State = {};

type Props = {
  width: string;
  height: string;
  fitContent: boolean;
  terms: string[];
  conns: string[];
};

var paper: joint.dia.Paper;

export default class InstanceInternalView extends React.Component<
  Props,
  State
> {
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
    const numberOfElements = this.props.terms.length;
    const centerX = paper.getComputedSize().width / 2;
    const centerY = paper.getComputedSize().height / 2;
    const radius = 200 + numberOfElements * 50;
    this.props.terms.forEach((term, i) => {
      const x =
        centerX + radius * Math.cos((i * 2 * Math.PI) / numberOfElements);
      const y =
        centerY + radius * Math.sin((i * 2 * Math.PI) / numberOfElements);
      const element = new graphElement({ id: term });
      element.position(x, y);
      element.addTo(this.graph);
      const labels: string[] = [];
      getStereotypeList(WorkspaceTerms[term].types).forEach((str) =>
        labels.push("«" + str.toLowerCase() + "»")
      );
      labels.push(
        getLabelOrBlank(WorkspaceTerms[term].labels, AppSettings.canvasLanguage)
      );
      element.prop("attrs/label/text", labels.join("\n"));
      const text: string[] = [];
      text.push(
        ..._.uniq(getIntrinsicTropeTypeIDs(term)).map((id) =>
          getDisplayLabel(id, AppSettings.canvasLanguage)
        )
      );
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
      element.attr({
        bodyBox: {
          display: "block",
          width: width,
          height: height,
          strokeDasharray: "none",
          stroke: "black",
          fill: "#FFFFFF",
        },
      });
    });
    this.props.conns.forEach((conn) => {
      const link = new joint.shapes.standard.Link();
      link.source({ id: WorkspaceLinks[conn].source });
      link.target({ id: WorkspaceLinks[conn].target });
      setLabels(
        link,
        getLinkOrVocabElem(WorkspaceLinks[conn].iri).labels[
          AppSettings.canvasLanguage
        ]
      );
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
    const numberOfElements = this.props.terms.length;
    const centerX = paper.getComputedSize().width / 2;
    const centerY = paper.getComputedSize().height / 2;
    const radius = 200 + numberOfElements * 50;
    this.props.terms.forEach((term, i) => {
      const x =
        centerX + radius * Math.cos((i * 2 * Math.PI) / numberOfElements);
      const y =
        centerY + radius * Math.sin((i * 2 * Math.PI) / numberOfElements);
      const element = new graphElement({ id: term });
      element.position(x, y);
      element.addTo(this.graph);
      const labels: string[] = [];
      getStereotypeList(WorkspaceTerms[term].types).forEach((str) =>
        labels.push("«" + str.toLowerCase() + "»")
      );
      labels.push(
        getLabelOrBlank(WorkspaceTerms[term].labels, AppSettings.canvasLanguage)
      );
      element.prop("attrs/label/text", labels.join("\n"));
      const text: string[] = [];
      text.push(
        ..._.uniq(getIntrinsicTropeTypeIDs(term)).map((id) =>
          getDisplayLabel(id, AppSettings.canvasLanguage)
        )
      );
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
      element.attr({
        bodyBox: {
          display: "block",
          width: width,
          height: height,
          strokeDasharray: "none",
          stroke: "black",
          fill: "#FFFFFF",
        },
      });
    });
    this.props.conns.forEach((conn) => {
      const link = new joint.shapes.standard.Link();
      link.source({ id: WorkspaceLinks[conn].source });
      link.target({ id: WorkspaceLinks[conn].target });
      setLabels(
        link,
        getLinkOrVocabElem(WorkspaceLinks[conn].iri).labels[
          AppSettings.canvasLanguage
        ]
      );
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
