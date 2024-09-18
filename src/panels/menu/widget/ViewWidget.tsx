import classNames from "classnames";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings, Diagrams } from "../../../config/Variables";
import { centerDiagram, zoomDiagram } from "../../../function/FunctionDiagram";
import { ReactComponent as CenterSVG } from "../../../svg/centerView.svg";
import { ReactComponent as RestoreZoomSVG } from "../../../svg/restoreZoom.svg";
interface Props {
  update: (diagram: string) => void;
}
export default class ViewWidget extends React.Component<Props> {
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
              {Locale[AppSettings.interfaceLanguage].menuPanelCenterView}
            </Tooltip>
          }
        >
          <button
            onClick={() => {
              if (centerDiagram())
                this.props.update(AppSettings.selectedDiagram);
            }}
          >
            <CenterSVG />
          </button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="button-tooltip">
              {Locale[AppSettings.interfaceLanguage].menuPanelZoom}
            </Tooltip>
          }
        >
          <button
            onClick={() => {
              if (
                zoomDiagram(
                  Diagrams[AppSettings.selectedDiagram].origin.x,
                  Diagrams[AppSettings.selectedDiagram].origin.y,
                  0
                )
              )
                this.props.update(AppSettings.selectedDiagram);
            }}
          >
            <RestoreZoomSVG />
          </button>
        </OverlayTrigger>
      </span>
    );
  }
}
