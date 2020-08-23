import React from 'react';
import {Spinner} from "react-bootstrap";
import * as Locale from "../locale/LocaleMain.json";

interface Props {
	active: boolean;
	message: string;
	error: boolean;
	retry: Function;
}

export default class InterfaceNotification extends React.Component<Props> {

	render() {
		if (this.props.error) {
			return (<span className={"interfaceNotification"}>
				{Locale.errorUpdating}&nbsp;
				<button className={"buttonlink"} onClick={() => {
					this.props.retry();
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