import classNames from "classnames";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { zoomDiagram } from "../../../function/FunctionDiagram";
import { paper } from "../../../main/DiagramCanvas";
import { ReactComponent as ZoomInSVG } from "../../../svg/zoomIn.svg";
import { ReactComponent as ZoomOutSVG } from "../../../svg/zoomOut.svg";
interface Props {
  update: (diagram: string) => void;
}
export default class ZoomWidget extends React.Component<Props> {
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
              if (zoomDiagram(origin.x, origin.y, 1))
                this.props.update(AppSettings.selectedDiagram);
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
              if (zoomDiagram(origin.x, origin.y, -1))
                this.props.update(AppSettings.selectedDiagram);
            }}
          >
            <ZoomOutSVG />
          </button>
        </OverlayTrigger>
      </span>
    );
  }
}
