import React from 'react';
import {Dropdown} from "react-bootstrap";
import {Diagrams, ProjectSettings} from "../../../config/Variables";
import {Locale} from "../../../config/Locale";
import {paper} from "../../../main/DiagramCanvas";

interface Props {

}

interface State {

}

export default class MenuPanelResetZoom extends React.Component<Props, State> {

	render() {
		return (
			<Dropdown.Item onClick={() => {
				paper.scale(1, 1);
				Diagrams[ProjectSettings.selectedDiagram].scale = 1;
			}}>
				{Locale[ProjectSettings.viewLanguage].menuPanelZoom}
			</Dropdown.Item>
		);
	}
}