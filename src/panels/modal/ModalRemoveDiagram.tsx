import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";
import {Locale} from "../../config/Locale";
import {updateProjectSettings} from "../../queries/UpdateMiscQueries";

interface Props {
	modal: boolean;
	diagram: number;
	close: Function;
	update: Function;
	performTransaction: (...queries: string[]) => void;
}

export default class ModalRemoveDiagram extends React.Component<Props> {

	save() {
		Diagrams[this.props.diagram].active = false;
		if (ProjectSettings.selectedDiagram === this.props.diagram) {
			changeDiagrams(Diagrams.findIndex(diag => diag.active));
		}
		this.props.update();
		this.props.performTransaction(updateProjectSettings(ProjectSettings.contextIRI, this.props.diagram));
	}

	render() {
		return (
			<Modal centered show={this.props.modal} keyboard onEscapeKeyDown={() => this.props.close()}
				   onEntering={() => {
					   const elem = document.getElementById("modalRemoveDiagramConfirm");
					   if (elem) elem.focus();
				   }}>
				<Modal.Header>
					<Modal.Title>{Locale[ProjectSettings.viewLanguage].modalRemoveDiagramTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{Locale[ProjectSettings.viewLanguage].modalRemoveDiagramDescription}</p>
				</Modal.Body>
				<Modal.Footer>
					<Form onSubmit={(event => {
						event.preventDefault();
						this.save();
						this.props.update();
						this.props.close();
					})}>
						<Button id={"modalRemoveDiagramConfirm"}
								type={"submit"}>{Locale[ProjectSettings.viewLanguage].confirm}</Button>
					</Form>
					<Button onClick={() => {
						this.props.close();
					}} variant="secondary">{Locale[ProjectSettings.viewLanguage].cancel}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}