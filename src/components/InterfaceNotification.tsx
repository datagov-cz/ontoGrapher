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
			return (<span>
				{Locale.errorUpdating}&nbsp;
				<button className={"buttonlink"} onClick={() => {
					this.props.retry();
				}}>{Locale.retry}</button>
			</span>);
		} else {
			return (<span>
				{this.props.message}
				&nbsp;
				{this.props.active ? <Spinner animation="border" size="sm"/> : ""}
			</span>);
		}
	}
}