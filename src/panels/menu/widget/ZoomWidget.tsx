import React from 'react';
import {zoomDiagram} from "../../../function/FunctionDiagram";
import {paper} from "../../../main/DiagramCanvas";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Locale} from "../../../config/Locale";
import {ProjectSettings} from "../../../config/Variables";
import {ReactComponent as ZoomInSVG} from "../../../svg/zoomIn.svg";
import {ReactComponent as ZoomOutSVG} from "../../../svg/zoomOut.svg";

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
			}}><ZoomInSVG/></button></OverlayTrigger>
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip id="button-tooltip">
					{Locale[ProjectSettings.viewLanguage].zoomOut}
				</Tooltip>}
			>
			<button onClick={() => {
				let origin = paper.clientToLocalPoint(window.innerWidth / 2, window.innerHeight / 2);
				zoomDiagram(origin.x, origin.y, -1);
			}}><ZoomOutSVG/></button></OverlayTrigger>
		</span>);
	}
}