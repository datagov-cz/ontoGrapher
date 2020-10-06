import React from 'react';
import {Nav} from "react-bootstrap";
import {drawGraphElement} from "../../function/FunctionGraph";
import {ProjectSettings} from "../../config/Variables";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {graph} from "../../graph/Graph";

interface Props {
	update: Function;
}

interface State {

}

export default class MenuPanelSwitchStereotypes extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		return (<div className={"inert"}><Nav.Link onClick={() => {
			ProjectSettings.viewStereotypes = !ProjectSettings.viewStereotypes;
			graph.getElements().forEach(elem =>
				drawGraphElement(elem, ProjectSettings.selectedLanguage, ProjectSettings.representation));
			this.props.update();
			this.forceUpdate();
		}}>
			{ProjectSettings.viewStereotypes ? LocaleMenu.hideStereotypes : LocaleMenu.showStereotypes}
		</Nav.Link>
		</div>);
	}
}