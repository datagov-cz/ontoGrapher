import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../locale/LocaleMenu.json";
import {Links} from "../config/Variables";
import {getLabelOrBlank} from "../function/FunctionGetVars";

interface Props {
	modal: boolean;
	close: Function;
	projectLanguage: string;
}

interface State {
	selectedLink: string;
}

export default class NewLinkDiagram extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedLink: ""
		}
		this.handleChangeLink = this.handleChangeLink.bind(this);
	}

	handleChangeLink(event: React.ChangeEvent<HTMLSelectElement>) {
		this.setState({selectedLink: event.currentTarget.value});
		if (event.currentTarget.value !== "") this.props.close(event.currentTarget.value);
	}

	render() {
		return (<Modal centered scrollable show={this.props.modal} onHide={() => this.props.close}>
			<Modal.Header>
				<Modal.Title>{LocaleMenu.modalNewLinkTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{LocaleMenu.modalNewLinkDescription}</p>
				<Form.Control htmlSize={Object.keys(Links).length} as="select" value={this.state.selectedLink}
							  onChange={this.handleChangeLink}>
					{Object.keys(Links).map((link) => (
						<option key={link}
								value={link}>{getLabelOrBlank(Links[link].labels, this.props.projectLanguage)}</option>))}
				</Form.Control>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					this.props.close();
				}} variant="secondary">{LocaleMenu.cancel}</Button>
				<Button onClick={() => {
					this.props.close(this.state.selectedLink);
				}}>{LocaleMenu.confirm}</Button>
			</Modal.Footer>
		</Modal>);
	}
}