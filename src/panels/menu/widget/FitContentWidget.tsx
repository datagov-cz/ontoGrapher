import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Locale} from "../../../config/Locale";
import {Diagrams, ProjectSettings} from "../../../config/Variables";
import {ReactComponent as FitContentSVG} from "../../../svg/fitContent.svg";
import {paper} from "../../../main/DiagramCanvas";

interface Props {

}

interface State {

}

export default class FitContentWidget extends React.Component<Props, State> {

	render() {
		return (<span>
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip id="button-tooltip">
					{Locale[ProjectSettings.viewLanguage].menuPanelFitContent}
				</Tooltip>}
			>
			<button onClick={() => {
				let origin = paper.translate();
				let dimensions = paper.getComputedSize();
				paper.scaleContentToFit({
					padding: 5,
					fittingBBox: {
						x: origin.tx,
						y: origin.ty,
						width: dimensions.width,
						height: dimensions.height
					}
				})
				Diagrams[ProjectSettings.selectedDiagram].origin = {
					x: paper.translate().tx, y: paper.translate().ty
				};
				Diagrams[ProjectSettings.selectedDiagram].scale = paper.scale().sx;
			}}><FitContentSVG/></button></OverlayTrigger>
		</span>);
	}
}