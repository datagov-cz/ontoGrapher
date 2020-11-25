import React from 'react';
import {OverlayTrigger, Spinner, Tooltip} from 'react-bootstrap';
import {ProjectSettings} from "../config/Variables";
import {Locale} from "../config/Locale";

interface Props {
	handleChangeLoadingStatus: Function;
	error: boolean;
}

interface State {
	connection: boolean;
}

export default class InterfaceStatus extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			connection: true
		}
		this.setStatus = this.setStatus.bind(this);
	}

	componentDidMount() {
		window.setInterval(this.setStatus, 10000)
	}

	setStatus() {
		this.checkStatus().then(status => {
			this.setState({connection: status});
			if (status === this.props.error) this.props.handleChangeLoadingStatus(false, "", !status, false)
		}).catch(() => {
			this.setState({connection: false});
			this.props.handleChangeLoadingStatus(false, "Error: connection unsuccessful.", true, false);
		});
	}

	async checkStatus(): Promise<boolean> {
		if (!(navigator.onLine)) return false;
		else return await fetch(ProjectSettings.contextEndpoint + "?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo.%7D%20limit%201", {
			headers: {'Accept': 'application/json'}, method: "GET"
		}).then(response => response.ok).catch(() => false);
	}

	render() {
		return (<span>
			<OverlayTrigger placement="left" overlay={
				<Tooltip
					id="tooltipC">{this.state.connection ? Locale[ProjectSettings.viewLanguage].stableConnection : Locale[ProjectSettings.viewLanguage].brokenConnection}</Tooltip>
			}>
				{(!this.state.connection) ?
					<Spinner animation="grow" size="sm" variant={"danger"}/> : <div className={"noresponse"}>🟢</div>}
			</OverlayTrigger>
		</span>);
	}
}