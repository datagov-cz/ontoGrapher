import React from 'react';
import {Nav} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";

interface Props {
	validate: Function;
}

interface State {

}

export default class MenuPanelValidate extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		return (<div className={"inert"}><Nav.Link onClick={() => this.props.validate}>
			{LocaleMenu.validate}
		</Nav.Link>
		</div>);
	}
}