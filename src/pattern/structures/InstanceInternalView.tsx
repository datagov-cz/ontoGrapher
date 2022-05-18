import * as joint from "jointjs";
import React from "react";
import _ from "lodash";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import {
  getIntrinsicTropeTypeIDs,
  getLinkOrVocabElem,
  getNewLink,
} from "../../function/FunctionGetVars";
import { graphElement } from "../../graph/GraphElement";
import { getDisplayLabel } from "../../function/FunctionDraw";
import { LinkType, Representation } from "../../config/Enum";
import { nameGraphLink, setLabels } from "../../function/FunctionGraph";
import { zoomDiagram } from "../../function/FunctionDiagram";
import {
  getStereotypeList,
  setElementShape,
} from "../../function/FunctionEditVars";
import { Shapes } from "../../config/visual/Shapes";
import { graph } from "../../graph/Graph";

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

  generateGraph() {
    paper.dumpViews();
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
      const elem = new graphElement({ id: term });
      elem.position(x, y);
      elem.addTo(this.graph);
      if (typeof elem.id === "string") {
        const types = WorkspaceTerms[elem.id].types;
        getDisplayLabel(elem.id, AppSettings.canvasLanguage);
        const label =
          WorkspaceElements[elem.id].selectedLabel[AppSettings.canvasLanguage];
        const labels: string[] = [];
        if (AppSettings.viewStereotypes)
          getStereotypeList(types, AppSettings.canvasLanguage).forEach((str) =>
            labels.push("«" + str.toLowerCase() + "»")
          );
        labels.push(label === "" ? "<blank>" : label);
        elem.prop("attrs/label/text", labels.join("\n"));
        const text: string[] = [];
        if (AppSettings.representation === Representation.COMPACT) {
          text.push(
            ..._.uniq(getIntrinsicTropeTypeIDs(elem.id)).map((id) =>
              getDisplayLabel(id, AppSettings.canvasLanguage)
            )
          );
        }
        elem.prop("attrs/labelAttrs/text", text.join("\n"));
        const width =
          AppSettings.representation === Representation.COMPACT
            ? Math.max(
                labels.reduce((a, b) => (a.length > b.length ? a : b), "")
                  .length *
                  10 +
                  4,
                text.length > 0
                  ? 8 *
                      text.reduce((a, b) => (a.length > b.length ? a : b), "")
                        .length
                  : 0
              )
            : labels.reduce((a, b) => (a.length > b.length ? a : b), "")
                .length *
                10 +
              4;
        elem.prop("attrs/text/x", width / 2);
        const attrHeight = 24 + (labels.length - 1) * 18;
        const height =
          (text.length > 0 ? 4 + text.length * 14 : 0) + attrHeight;
        elem.prop("attrs/labelAttrs/y", attrHeight);
        setElementShape(elem, width, height);
        elem.resize(width, height);
      }
    });
    this.props.conns.forEach((conn) => {
      let id = conn;
      if (id in WorkspaceTerms) {
        id = Object.keys(WorkspaceLinks).find(
          (link) => WorkspaceLinks[link].iri === conn
        )!;
      }
      const link = getNewLink(WorkspaceLinks[id].type, id);
      link.source({
        id: WorkspaceLinks[id].source,
        connectionPoint: {
          name: "boundary",
          args: { selector: Shapes["default"].body },
        },
      });
      link.target({
        id: WorkspaceLinks[id].target,
        connectionPoint: {
          name: "boundary",
          args: { selector: Shapes["default"].body },
        },
      });
      link.addTo(this.graph);
      if (WorkspaceLinks[id].type === LinkType.DEFAULT) {
        setLabels(
          link,
          getLinkOrVocabElem(WorkspaceLinks[id].iri).labels[
            AppSettings.canvasLanguage
          ]
        );
      }
    });
    graph.getLinks().forEach((cell) => {
      if (WorkspaceLinks[cell.id]) {
        nameGraphLink(
          cell,
          getLinkOrVocabElem(WorkspaceLinks[cell.id].iri).labels,
          AppSettings.canvasLanguage
        );
      }
    });
    paper.dumpViews();
    paper.scaleContentToFit({
      padding: 10,
      maxScale: 2,
      minScale: 0.1,
    });
    paper.translate(300, 0);
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    this.generateGraph();
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
    this.generateGraph();
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
