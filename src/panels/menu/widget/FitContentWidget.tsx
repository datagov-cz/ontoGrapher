import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings, Diagrams } from "../../../config/Variables";
import { ReactComponent as FitContentSVG } from "../../../svg/fitContent.svg";
import { paper } from "../../../main/DiagramCanvas";

interface Props {}

interface State {}

export default class FitContentWidget extends React.Component<Props, State> {
  render() {
    return (
      <span>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="button-tooltip">
              {Locale[AppSettings.interfaceLanguage].menuPanelFitContent}
            </Tooltip>
          }
        >
          <button
            onClick={() => {
              let origin = paper.translate();
              let dimensions = paper.getComputedSize();
              paper.scaleContentToFit({
                padding: {
                  top: 10,
                  bottom: 100,
                  right: 10,
                  left: 10,
                },
                fittingBBox: {
                  x: origin.tx,
                  y: origin.ty,
                  width: dimensions.width,
                  height: dimensions.height,
                },
                scaleGrid: 0.1,
                maxScale: 2,
                minScale: 0.1,
              });
              Diagrams[AppSettings.selectedDiagram].origin = {
                x: paper.translate().tx,
                y: paper.translate().ty,
              };
              Diagrams[AppSettings.selectedDiagram].scale = paper.scale().sx;
            }}
          >
            <FitContentSVG />
          </button>
        </OverlayTrigger>
      </span>
    );
  }
}
