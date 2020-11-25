import React from 'react';
import {Spinner} from "react-bootstrap";
import {processTransaction} from "../interface/TransactionInterface";
import {ProjectSettings} from "../config/Variables";
import {Locale} from "../config/Locale";

interface Props {
	active: boolean;
	message: string;
	error: boolean;
	retry: boolean;
	handleChangeLoadingStatus: Function;
}

export default class InterfaceNotification extends React.Component<Props> {

	render() {
		if (this.props.error) {
			return (<span className={"interfaceNotification"}>
				{this.props.message}&nbsp;
				{this.props.retry && <button className={"buttonlink"} onClick={() => {
					this.props.handleChangeLoadingStatus(true, Locale[ProjectSettings.viewLanguage].updating, false);
					processTransaction(ProjectSettings.contextEndpoint,
						ProjectSettings.lastTransaction
					).then(ret => {
						if (ret) {
							this.props.handleChangeLoadingStatus(false, "", false);
						} else {
							this.props.handleChangeLoadingStatus(false, "", true);
						}
					})
				}}>{Locale[ProjectSettings.viewLanguage].retry}</button>}
			</span>);
		} else {
			return (<span className={"interfaceNotification"}>
				{this.props.active && <Spinner animation="border" size="sm"/>}
				&nbsp;
				{this.props.message === "" && !this.props.active ? Locale[ProjectSettings.viewLanguage].savedChanges : this.props.message}
			</span>);
		}
	}
}