import React from 'react';
import {Dropdown} from "react-bootstrap";
import {ProjectSettings} from "../../../config/Variables";
import {Locale} from "../../../config/Locale";
import {centerDiagram} from "../../../function/FunctionDiagram";

interface Props {

}

interface State {

}

export default class MenuPanelCenterView extends React.Component<Props, State> {

	render() {
		return (
			<Dropdown.Item onClick={() => centerDiagram()}>
				{Locale[ProjectSettings.viewLanguage].menuPanelCenterView}
			</Dropdown.Item>
		);
	}
}