import React from 'react';
import {Spinner} from "react-bootstrap";
import {ProjectSettings} from "../config/Variables";
import {Locale} from "../config/Locale";

interface Props {
	active: boolean;
	message: string;
	error: boolean;
	retry: boolean;
	performTransaction: (...queries: string[]) => void;
}

export default class InterfaceNotification extends React.Component<Props> {

	render() {
		if (this.props.error) {
			return (<span className={"interfaceNotification"}>
				{this.props.active && <span><Spinner animation="border" size="sm"/>&nbsp;</span>}
				{this.props.message}&nbsp;
				{this.props.retry && <button className={"buttonlink"} onClick={() => {
					this.props.performTransaction(ProjectSettings.lastTransaction);
				}}>{Locale[ProjectSettings.viewLanguage].retry}</button>}
			</span>);
		} else {
			return (<span className={"interfaceNotification"}>
				{this.props.active && <span><Spinner animation="border" size="sm"/>&nbsp;</span>}
				{this.props.message}
			</span>);
		}
	}
}