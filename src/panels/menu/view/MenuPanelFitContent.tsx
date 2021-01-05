import React from 'react';
import {paper} from "../../../main/DiagramCanvas";
import {Diagrams, ProjectSettings} from "../../../config/Variables";
import {Locale} from "../../../config/Locale";
import {Dropdown} from "react-bootstrap";

interface Props {

}

interface State {

}

export default class MenuPanelFitContent extends React.Component<Props, State> {

	render() {
		return (<Dropdown.Item onClick={() => {
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
		}}>
			{Locale[ProjectSettings.viewLanguage].menuPanelFitContent}
		</Dropdown.Item>);
	}
}