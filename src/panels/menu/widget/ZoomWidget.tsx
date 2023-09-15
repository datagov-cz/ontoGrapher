import React from "react";
import { zoomDiagram } from "../../../function/FunctionDiagram";
import { paper } from "../../../main/DiagramCanvas";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { ReactComponent as ZoomInSVG } from "../../../svg/zoomIn.svg";
import { ReactComponent as ZoomOutSVG } from "../../../svg/zoomOut.svg";
import classNames from "classnames";
export default class ZoomWidget extends React.Component {
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
              {Locale[AppSettings.interfaceLanguage].zoomIn}
            </Tooltip>
          }
        >
          <button
            onClick={() => {
              const origin = paper.clientToLocalPoint(
                window.innerWidth / 2,
                window.innerHeight / 2
              );
              zoomDiagram(origin.x, origin.y, 1);
            }}
          >
            <ZoomInSVG />
          </button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="button-tooltip">
              {Locale[AppSettings.interfaceLanguage].zoomOut}
            </Tooltip>
          }
        >
          <button
            onClick={() => {
              const origin = paper.clientToLocalPoint(
                window.innerWidth / 2,
                window.innerHeight / 2
              );
              zoomDiagram(origin.x, origin.y, -1);
            }}
          >
            <ZoomOutSVG />
          </button>
        </OverlayTrigger>
      </span>
    );
  }
}
