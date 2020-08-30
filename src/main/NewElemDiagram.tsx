import React from 'react';
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import * as LocaleMenu from "../locale/LocaleMenu.json";

interface Props {
	modal: boolean;
	close: Function;
	projectLanguage: string;
}

interface State {
	conceptName: string;
	displayError: boolean;
}

export default class NewElemDiagram extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			conceptName: "",
			displayError: false,
		}
	}

	render() {
		return (<Modal centered scrollable show={this.props.modal}
					   onHide={() => this.props.close}
					   onEntering={() => this.setState({conceptName: "", displayError: false})}
		>
			<Modal.Header>
				<Modal.Title>{LocaleMenu.modalNewElemTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{LocaleMenu.modalNewElemDescription}</p>
				<InputGroup>
					<InputGroup.Prepend>
						<InputGroup.Text id="inputGroupPrepend">{this.props.projectLanguage}</InputGroup.Text>
					</InputGroup.Prepend>
					<Form.Control type="text" value={this.state.conceptName} required
								  onChange={(event) => this.setState({conceptName: event.currentTarget.value})}/>
				</InputGroup>
				<p style={{display: this.state.displayError ? "block" : "none"}}
				   className="red">{LocaleMenu.modalNewElemError}</p>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					if (this.state.conceptName === "") {
						this.setState({displayError: true});
					} else this.props.close(this.state.conceptName);
				}} variant="primary">{LocaleMenu.confirm}</Button>
				<Button onClick={() => {
					this.props.close();
				}} variant="secondary">{LocaleMenu.cancel}</Button>
			</Modal.Footer>
		</Modal>);
	}
}