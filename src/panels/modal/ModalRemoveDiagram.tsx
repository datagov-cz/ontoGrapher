import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";
import {updateProjectSettings} from "../../interface/TransactionInterface";
import {Locale} from "../../config/Locale";

interface Props {
	modal: boolean;
	diagram: number;
	close: Function;
	update: Function;
	performTransaction: (transaction: { add: string[], delete: string[], update: string[] }) => void;
}

export default class ModalRemoveDiagram extends React.Component<Props> {

	save() {
		Diagrams[this.props.diagram].active = false;
		if (this.props.diagram < ProjectSettings.selectedDiagram) changeDiagrams(ProjectSettings.selectedDiagram - 1);
		else if (this.props.diagram === ProjectSettings.selectedDiagram) changeDiagrams(0);
		this.props.update();
		this.props.performTransaction(updateProjectSettings(ProjectSettings.contextIRI));
	}

	render() {
		return (
			<Modal centered show={this.props.modal} keyboard onEscapeKeyDown={() => this.props.close()}>
				<Modal.Header>
					<Modal.Title>{Locale[ProjectSettings.viewLanguage].modalRemoveDiagramTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{Locale[ProjectSettings.viewLanguage].modalRemoveDiagramDescription}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => {
						this.setState({modalRemove: false});
					}} variant="secondary">{Locale[ProjectSettings.viewLanguage].cancel}</Button>
					<Form onSubmit={(event => {
						event.preventDefault();
						this.save();
						this.props.update();
						this.props.close();
					})}>
						<Button type={"submit"}>{Locale[ProjectSettings.viewLanguage].confirm}</Button>
					</Form>
				</Modal.Footer>
			</Modal>
		);
	}
}