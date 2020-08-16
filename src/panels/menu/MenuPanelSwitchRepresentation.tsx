import React from 'react';
import {Nav} from "react-bootstrap";
import {switchRepresentation} from "../../function/FunctionGraph";
import {ProjectSettings} from "../../config/Variables";
import * as LocaleMenu from "../../locale/LocaleMenu.json";

interface Props {

}

interface State {

}

export default class MenuPanelSwitchRepresentation extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		return (<div className={"inert"}><Nav.Link onClick={() => switchRepresentation()}>
			{ProjectSettings.representation === "full" ? LocaleMenu.represantationCompact : LocaleMenu.represantationFull}
		</Nav.Link>
		</div>);
	}
}