import React from 'react';
import {zoomDiagram} from "../../../function/FunctionDiagram";
import {paper} from "../../../main/DiagramCanvas";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Locale} from "../../../config/Locale";
import {ProjectSettings} from "../../../config/Variables";

interface Props {

}

interface State {

}

export default class ZoomWidget extends React.Component<Props, State> {

	render() {
		return (<span>
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip id="button-tooltip">
					{Locale[ProjectSettings.viewLanguage].zoomIn}
				</Tooltip>}
			>
			<button onClick={() => {
				let origin = paper.clientToLocalPoint(window.innerWidth / 2, window.innerHeight / 2);
				zoomDiagram(origin.x, origin.y, 1);
			}}><span role="img"
					 aria-label={Locale[ProjectSettings.viewLanguage].zoomOut}>➕</span></button></OverlayTrigger>
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip id="button-tooltip">
					{Locale[ProjectSettings.viewLanguage].zoomOut}
				</Tooltip>}
			>
			<button onClick={() => {
				let origin = paper.clientToLocalPoint(window.innerWidth / 2, window.innerHeight / 2);
				zoomDiagram(origin.x, origin.y, -1);
			}}><span role="img"
					 aria-label={Locale[ProjectSettings.viewLanguage].zoomOut}>➖</span></button></OverlayTrigger>
		</span>);
	}
}