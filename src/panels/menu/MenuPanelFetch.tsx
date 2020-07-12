import React from 'react';
import {Nav} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import FileFetchContextModal from "./file/FileFetchContextModal";

interface Props {
	loadContext: Function;
}

interface State {
	modal: boolean;
}

export default class MenuPanelFetch extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			modal: false
		};
	}

	render() {
		return (<div className={"inert"}><Nav.Link onClick={() => {
			this.setState({modal: true});
		}}>
			{LocaleMenu.fileFetchContextTitle}
		</Nav.Link>
			<FileFetchContextModal modal={this.state.modal} close={() => {
				this.setState({modal: false})
			}} loadContext={this.props.loadContext}/>
		</div>);
	}
}