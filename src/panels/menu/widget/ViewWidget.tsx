import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Locale} from "../../../config/Locale";
import {ProjectSettings} from "../../../config/Variables";
import {paper} from "../../../main/DiagramCanvas";
import {centerDiagram} from "../../../function/FunctionDiagram";
import {ReactComponent as CenterSVG} from "../../../svg/centerView.svg";
import {ReactComponent as RestoreZoomSVG} from "../../../svg/restoreZoom.svg";

interface Props {

}

interface State {

}

export default class ViewWidget extends React.Component<Props, State> {

	render() {
		return (<span>
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip id="button-tooltip">
					{Locale[ProjectSettings.viewLanguage].menuPanelCenterView}
				</Tooltip>}
			>
			<button onClick={() => {
				centerDiagram();
			}}><CenterSVG/></button></OverlayTrigger>
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip id="button-tooltip">
					{Locale[ProjectSettings.viewLanguage].menuPanelZoom}
				</Tooltip>}
			>
			<button onClick={() => {
				paper.scale(1, 1);
			}}><RestoreZoomSVG/></button></OverlayTrigger>
		</span>);
	}
}