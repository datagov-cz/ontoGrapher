import classNames from "classnames";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { setDiagramPosition } from "../../../function/FunctionDiagram";
import { paper } from "../../../main/DiagramCanvas";
import { ReactComponent as FitContentSVG } from "../../../svg/fitContent.svg";

interface Props {
  update: (diagram: string) => void;
}
export default class FitContentWidget extends React.Component<Props> {
  render() {
    return (
      <span
        className={classNames({
          nointeract: AppSettings.selectedDiagram === "",
        })}
      >
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
              const origin = paper.translate();
              const dimensions = paper.getComputedSize();
              paper.transformToFitContent({
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
              if (setDiagramPosition(AppSettings.selectedDiagram))
                this.props.update(AppSettings.selectedDiagram);
            }}
          >
            <FitContentSVG />
          </button>
        </OverlayTrigger>
      </span>
    );
  }
}
