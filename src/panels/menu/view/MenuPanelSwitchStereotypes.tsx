import React from 'react';
import {Dropdown} from "react-bootstrap";
import {drawGraphElement} from "../../../function/FunctionGraph";
import {ProjectSettings} from "../../../config/Variables";
import {graph} from "../../../graph/Graph";
import {Locale} from "../../../config/Locale";

interface Props {
	update: Function;
}

interface State {

}

export default class MenuPanelSwitchStereotypes extends React.Component<Props, State> {

	switch() {
		ProjectSettings.viewStereotypes = !ProjectSettings.viewStereotypes;
		graph.getElements().forEach(elem =>
			drawGraphElement(elem, ProjectSettings.selectedLanguage, ProjectSettings.representation));
		this.props.update();
		this.forceUpdate();
	}

	render() {
		return (<div>
			<Dropdown.Item onClick={() => this.switch()} disabled={!ProjectSettings.viewStereotypes}>
				{(!ProjectSettings.viewStereotypes ? "✓ " : "") + Locale[ProjectSettings.viewLanguage].hideStereotypes}
			</Dropdown.Item>
			<Dropdown.Item onClick={() => this.switch()} disabled={ProjectSettings.viewStereotypes}>
				{(ProjectSettings.viewStereotypes ? "✓ " : "") + Locale[ProjectSettings.viewLanguage].showStereotypes}
			</Dropdown.Item>
		</div>);
	}
}