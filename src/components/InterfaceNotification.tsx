import React from 'react';
import {Spinner} from "react-bootstrap";
import * as Locale from "../locale/LocaleMain.json";

interface Props {
	active: boolean;
	message: string;
	error: boolean;
}

interface State {

}

export default class InterfaceNotification extends React.Component<Props, State> {

	render() {
		if (this.props.error) {
			return (<span>
				{Locale.errorUpdating}
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