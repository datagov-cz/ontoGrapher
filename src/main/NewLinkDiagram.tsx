import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../locale/LocaleMenu.json";
import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {getLabelOrBlank} from "../function/FunctionGetVars";
import {graph} from "../graph/Graph";

interface Props {
	modal: boolean;
	close: Function;
	projectLanguage: string;
	sid: string | undefined;
	tid: string | undefined;
}

interface State {
	selectedLink: string;
}

export default class NewLinkDiagram extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedLink: "",
		}
		this.handleChangeLink = this.handleChangeLink.bind(this);
	}

	handleChangeLink(event: React.ChangeEvent<HTMLSelectElement>) {
		this.setState({selectedLink: event.currentTarget.value});
		if (event.currentTarget.value !== "") this.props.close(event.currentTarget.value);
	}

	getLinks() {
		let elem = graph.getElements().find(elem => elem.id === this.props.sid);
		if (elem && this.props.sid) {
			let conns = ProjectElements[this.props.sid].connections;
			if (ProjectSettings.representation === "full") {
				return Object.keys(Links).filter(link => !conns.find(conn => ProjectLinks[conn].iri === link && ProjectLinks[conn].target === this.props.tid));
			} else if (ProjectSettings.representation === "compact") {
				return Object.keys(VocabularyElements).filter(link => !conns.find(conn => ProjectLinks[conn].iri === link && ProjectLinks[conn].target === this.props.tid && link in VocabularyElements));
			} else return [];
		} else return [];
	}

	setLink(link: string) {
		if (link !== "") this.props.close(link);
	}

	render() {
		return (<Modal centered scrollable show={this.props.modal}
					   onHide={() => this.props.close}
					   onEntering={() => this.setState({selectedLink: ""})}
		>
			<Modal.Header>
				<Modal.Title>{LocaleMenu.modalNewLinkTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{LocaleMenu.modalNewLinkDescription}</p>
				<Form.Control htmlSize={Object.keys(Links).length} as="select" value={this.state.selectedLink}
							  onChange={this.handleChangeLink}>
					{this.getLinks().map((link) => (
						<option key={link}
								onClick={() => this.setLink(link)}
								value={link}>{getLabelOrBlank(Links[link].labels, this.props.projectLanguage)}</option>))}
				</Form.Control>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					this.props.close();
				}} variant="secondary">{LocaleMenu.cancel}</Button>
			</Modal.Footer>
		</Modal>);
	}
}