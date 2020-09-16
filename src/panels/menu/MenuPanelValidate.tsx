import React from 'react';
import {Nav} from "react-bootstrap";
import {Locale} from "../../config/Locale";

interface Props {
	validate: Function;
	projectLanguage: string;
}

interface State {

}

export default class MenuPanelValidate extends React.Component<Props, State> {

	render() {
		return (<div className={"inert"}><Nav.Link onClick={() => this.props.validate()}>
			{Locale[this.props.projectLanguage].validate}
		</Nav.Link>
		</div>);
	}
}