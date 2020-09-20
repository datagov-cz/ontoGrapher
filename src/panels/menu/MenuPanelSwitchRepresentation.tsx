import React from 'react';
import {Nav, OverlayTrigger, Tooltip} from "react-bootstrap";
import {setRepresentation} from "../../function/FunctionGraph";
import {ProjectSettings} from "../../config/Variables";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {Representation} from "../../config/Enum";

interface Props {
	update: Function;
	close: Function;
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
				let result = setRepresentation(ProjectSettings.representation === Representation.FULL ? Representation.COMPACT : Representation.FULL);
				if (result) this.setState({alert: result});
				setTimeout(() => {
					this.setState({alert: false})
				}, 3000)
				this.props.close();
				this.props.update();
				this.forceUpdate();
			}}>
				{ProjectSettings.representation === Representation.FULL ? LocaleMenu.represantationCompact : LocaleMenu.represantationFull}
			</Nav.Link>
			</div>
		</OverlayTrigger>);
	}
}