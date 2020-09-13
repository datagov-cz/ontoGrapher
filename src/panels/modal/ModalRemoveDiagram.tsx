import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";
import {updateProjectSettings} from "../../interface/TransactionInterface";

interface Props {
	modal: boolean;
	diagram: number;
	close: Function;
	update: Function;
	handleChangeLoadingStatus: Function;
}

export default class ModalRemoveDiagram extends React.Component<Props> {

	save() {
		this.props.handleChangeLoadingStatus(true, "", false);
		Diagrams[this.props.diagram].active = false;
		if (ProjectSettings.selectedDiagram === this.props.diagram) {
			changeDiagrams(0);
		}
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint, ModalRemoveDiagram.name).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, "", true);
			}
		})
	}

	render() {
		return (
			<Modal centered show={this.props.modal}>
				<Modal.Header>
					<Modal.Title>{LocaleMenu.modalRemoveDiagramTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{LocaleMenu.modalRemoveDiagramDescription}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => {
						this.setState({modalRemove: false});
					}} variant="secondary">{LocaleMenu.cancel}</Button>
					<Button onClick={() => {
						this.save();
						this.props.update();
						this.props.close();
					}}>{LocaleMenu.confirm}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}