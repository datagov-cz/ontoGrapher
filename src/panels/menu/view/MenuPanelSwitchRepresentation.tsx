import React from 'react';
import {Nav, OverlayTrigger, Tooltip} from "react-bootstrap";
import {setRepresentation} from "../../../function/FunctionGraph";
import {ProjectSettings} from "../../../config/Variables";
import {Representation} from "../../../config/Enum";
import {processTransaction} from "../../../interface/TransactionInterface";
import {Locale} from "../../../config/Locale";

interface Props {
	update: Function;
	close: Function;
	handleChangeLoadingStatus: Function;
}

interface State {
	alert: boolean;
}

const tooltipNew = (
	<Tooltip id="tooltipC">{Locale[ProjectSettings.viewLanguage].deletedRelationships}</Tooltip>
);

export default class MenuPanelSwitchRepresentation extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			alert: false
		}
	}

	switch() {
		let result = setRepresentation(ProjectSettings.representation === Representation.FULL ? Representation.COMPACT : Representation.FULL);
		if (result) this.setState({alert: result.result});
		setTimeout(() => {
			this.setState({alert: false})
		}, 3000)
		this.props.handleChangeLoadingStatus(true, Locale[ProjectSettings.viewLanguage].updating, false);
		processTransaction(ProjectSettings.contextEndpoint, result.transactions).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, Locale[ProjectSettings.viewLanguage].errorUpdating, true);
			}
		});
		this.props.close();
		this.props.update();
		this.forceUpdate();
	}

	render() {
		return (<OverlayTrigger show={this.state.alert} placement="right" overlay={tooltipNew}>
			<div className={"inert"}><Nav.Link onClick={() => this.switch()}>
				{ProjectSettings.representation === Representation.FULL ? Locale[ProjectSettings.viewLanguage].representationCompact : Locale[ProjectSettings.viewLanguage].representationFull}
			</Nav.Link>
			</div>
		</OverlayTrigger>);
	}
}