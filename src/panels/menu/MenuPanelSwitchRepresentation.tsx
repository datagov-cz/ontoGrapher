import React from 'react';
import {Nav, OverlayTrigger, Tooltip} from "react-bootstrap";
import {setRepresentation} from "../../function/FunctionGraph";
import {ProjectSettings} from "../../config/Variables";
import {Locale} from "../../config/Locale";

interface Props {
	update: Function;
	close: Function;
	projectLanguage: string;
}

interface State {
	alert: boolean;
}

export default class MenuPanelSwitchRepresentation extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			alert: false
		}
	}

	render() {
		return (<OverlayTrigger show={this.state.alert} placement="right" overlay={<Tooltip
			id="tooltipC">{Locale[this.props.projectLanguage].deletedRelationships}</Tooltip>}>
			<div className={"inert"}><Nav.Link onClick={() => {
				let result = setRepresentation(ProjectSettings.representation === "full" ? "compact" : "full");
				if (result) this.setState({alert: result});
				setTimeout(() => {
					this.setState({alert: false})
				}, 3000)
				this.props.close();
				this.props.update();
				this.forceUpdate();
			}}>
				{ProjectSettings.representation === "full" ? Locale[this.props.projectLanguage].represantationCompact : Locale[this.props.projectLanguage].represantationFull}
			</Nav.Link>
			</div>
		</OverlayTrigger>);
	}
}