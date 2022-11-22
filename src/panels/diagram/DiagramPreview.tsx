import React, { useEffect, useRef } from "react";

import * as joint from "jointjs";
import { getNewLink } from "../../function/FunctionGetVars";
import { Representation } from "../../config/Enum";
import {
  WorkspaceElements,
  AppSettings,
  Diagrams,
} from "../../config/Variables";
import { centerDiagram, zoomDiagram } from "../../function/FunctionDiagram";
import { drawGraphElement } from "../../function/FunctionDraw";
import { isElementHidden } from "../../function/FunctionElem";
import {
  restoreHiddenElem,
  setRepresentation,
} from "../../function/FunctionGraph";
import { graphElement } from "../../graph/GraphElement";
type Props = {
  diagram: string;
};

export const DiagramPreview: React.FC<Props> = (props: Props) => {
  const paperElement = useRef(null);
  let drag: { x: any; y: any } | undefined = undefined;

  const graph = new joint.dia.Graph();
  const paper = new joint.dia.Paper({
    el: paperElement.current! as HTMLElement,
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
      drag = undefined;
    },
    "blank:mousewheel": (evt, x, y, delta) => {
      evt.preventDefault();
      zoomDiagram(x, y, delta, paper);
    },
    "blank:pointerdown": (evt, x, y) => {
      if (evt.button === 0) {
        const scale = paper.scale();
        drag = { x: x * scale.sx, y: y * scale.sy };
      }
    },
  });
  for (const id in WorkspaceElements) {
    if (
      !isElementHidden(id, props.diagram) &&
      WorkspaceElements[id].position[props.diagram] &&
      WorkspaceElements[id].active
    ) {
      const cls = new graphElement({ id: id });
      cls.position(
        WorkspaceElements[id].position[props.diagram].x,
        WorkspaceElements[id].position[props.diagram].y
      );
      cls.addTo(graph);
      drawGraphElement(cls, AppSettings.canvasLanguage, Representation.FULL);
      restoreHiddenElem(id, true, false, false);
    }
  }
  setRepresentation(Diagrams[props.diagram].representation, false);
  if (
    Diagrams[props.diagram].origin.x === 0 &&
    Diagrams[props.diagram].origin.y === 0
  ) {
    centerDiagram(paper, graph);
  } else {
    paper.scale(Diagrams[props.diagram].scale, Diagrams[props.diagram].scale);
    paper.translate(
      Diagrams[props.diagram].origin.x,
      Diagrams[props.diagram].origin.y
    );
  }
  const area = paper.getContentArea({ useModelGeometry: false });
  paper.fitToContent({
    padding: 0,
    allowNewOrigin: "any",
    allowNegativeBottomRight: true,
    contentArea: area,
  });

  return (
    <div
      ref={paperElement}
      onMouseMove={(event) => {
        if (drag) {
          paper.translate(
            event.nativeEvent.offsetX - drag.x,
            event.nativeEvent.offsetY - drag.y
          );
        }
      }}
    />
  );
};
