import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings, Diagrams } from "../../../config/Variables";
import { centerDiagram, zoomDiagram } from "../../../function/FunctionDiagram";
import { ReactComponent as CenterSVG } from "../../../svg/centerView.svg";
import { ReactComponent as RestoreZoomSVG } from "../../../svg/restoreZoom.svg";

interface Props {}

interface State {}

export default class ViewWidget extends React.Component<Props, State> {
  render() {
    return (
      <span>
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
              centerDiagram();
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
              zoomDiagram(
                Diagrams[AppSettings.selectedDiagram].origin.x,
                Diagrams[AppSettings.selectedDiagram].origin.y,
                0
              );
            }}
          >
            <RestoreZoomSVG />
          </button>
        </OverlayTrigger>
      </span>
    );
  }
}
