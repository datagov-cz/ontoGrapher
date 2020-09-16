import React from 'react';
import {Spinner} from "react-bootstrap";
import {retryConnection} from "../function/FunctionProject";
import {ProjectSettings} from "../config/Variables";
import {Locale} from "../config/Locale";

interface Props {
	active: boolean;
	message: string;
	error: boolean;
	handleChangeLoadingStatus: Function;
	projectLanguage: string;
}

export default class InterfaceNotification extends React.Component<Props> {

	render() {
		if (this.props.error) {
			return (<span className={"interfaceNotification"}>
				{Locale[ProjectSettings.selectedLanguage].errorUpdating}&nbsp;
				<button className={"buttonlink"} onClick={() => {
					this.props.handleChangeLoadingStatus(true, Locale[ProjectSettings.selectedLanguage].updating, false);
					retryConnection().then(ret => {
						if (ret) {
							this.props.handleChangeLoadingStatus(false, "", false);
						} else {
							this.props.handleChangeLoadingStatus(false, "", true);
						}
					})
				}}>{Locale.retry}</button>
			</span>);
		} else {
			return (<span className={"interfaceNotification"}>
				{this.props.active && <Spinner animation="border" size="sm"/>}
				&nbsp;
				{this.props.message === "" && !this.props.active ? Locale.savedChanges : this.props.message}
			</span>);
		}
	}
}