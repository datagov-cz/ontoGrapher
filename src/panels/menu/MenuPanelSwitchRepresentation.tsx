import React from 'react';
import {Nav, OverlayTrigger, Tooltip} from "react-bootstrap";
import {switchRepresentation} from "../../function/FunctionGraph";
import {ProjectSettings} from "../../config/Variables";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import * as LocaleMain from "../../locale/LocaleMain.json";

interface Props {
	update: Function;
}

interface State {
	alert: boolean;
}

const tooltipNew = (
	<Tooltip id="tooltipC">{LocaleMain.deletedRelationships}</Tooltip>
);

export default class MenuPanelSwitchRepresentation extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			alert: false
		}
	}

	render() {
		return (<OverlayTrigger show={this.state.alert} placement="right" overlay={tooltipNew}>
			<div className={"inert"}><Nav.Link onClick={() => {
				let result = switchRepresentation(ProjectSettings.representation === "full" ? "compact" : "full");
				if (result) this.setState({alert: result});
				setTimeout(() => {
					this.setState({alert: false})
				}, 3000)
				this.props.update();
			}}>
				{ProjectSettings.representation === "full" ? LocaleMenu.represantationCompact : LocaleMenu.represantationFull}
			</Nav.Link>
			</div>
		</OverlayTrigger>);
	}
}