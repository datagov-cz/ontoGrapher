import React from "react";

import * as joint from "jointjs";
import { Representation } from "../../config/Enum";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
} from "../../config/Variables";
import { centerDiagram, zoomDiagram } from "../../function/FunctionDiagram";
import { drawGraphElement } from "../../function/FunctionDraw";
import { isElementHidden } from "../../function/FunctionElem";
import { getNewLink } from "../../function/FunctionGetVars";
import {
  restoreHiddenElem,
  setRepresentation,
} from "../../function/FunctionGraph";
import { graphElement } from "../../graph/GraphElement";
interface Props {
  diagram: string;
}

interface State {}

var paper: joint.dia.Paper;
var graph: joint.dia.Graph;

export default class DiagramPreview extends React.Component<Props, State> {
  private readonly paperElement: React.RefObject<HTMLDivElement>;
  private drag: { x: any; y: any } | undefined;

  constructor(props: Props) {
    super(props);
    this.paperElement = React.createRef();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.drag = undefined;
  }

  componentDidMount(): void {
    graph = new joint.dia.Graph();
    const node = this.paperElement.current! as HTMLElement;
    paper = new joint.dia.Paper({
      el: node,
      model: graph,
      gridSize: 1,
      linkPinning: false,
      clickThreshold: 0,
      async: false,
      background: { color: "#FFFFFF" },
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
      "blank:pointerup": (evt) => {
        this.drag = undefined;
      },
      "blank:mousewheel": (evt, x, y, delta) => {
        evt.preventDefault();
        zoomDiagram(x, y, delta, paper, false);
      },
      "blank:pointerdown": (evt, x, y) => {
        if (evt.button === 0) {
          const scale = paper.scale();
          this.drag = { x: x * scale.sx, y: y * scale.sy };
        }
      },
    });
    for (const id in WorkspaceElements) {
      if (
        !isElementHidden(id, this.props.diagram) &&
        WorkspaceElements[id].position[this.props.diagram] &&
        WorkspaceElements[id].active
      ) {
        const cls = new graphElement({ id: id });
        cls.position(
          WorkspaceElements[id].position[this.props.diagram].x,
          WorkspaceElements[id].position[this.props.diagram].y
        );
        cls.addTo(graph);
        drawGraphElement(cls, AppSettings.canvasLanguage, Representation.FULL);
        restoreHiddenElem(id, true, false, false);
      }
    }
    //TODO: change to diagrams' representation
    setRepresentation(
      Diagrams[this.props.diagram].representation,
      this.props.diagram,
      false,
      false,
      graph
    );
    const area = paper.getContentArea({ useModelGeometry: false });
    const origin = paper.translate();
    const dimensions = paper.getComputedSize();
    paper.scaleContentToFit({
      fittingBBox: {
        x: origin.tx,
        y: origin.ty,
        width: dimensions.width,
        height: dimensions.height,
      },
      scaleGrid: 0.1,
      maxScale: 2,
      minScale: 0.1,
      contentArea: area,
    });
    centerDiagram(paper, graph);
  }

  render(): React.ReactNode {
    return (
      <div
        ref={this.paperElement}
        onMouseMove={(event) => {
          if (this.drag) {
            paper.translate(
              event.nativeEvent.offsetX - this.drag.x,
              event.nativeEvent.offsetY - this.drag.y
            );
          }
        }}
      />
    );
  }
}
