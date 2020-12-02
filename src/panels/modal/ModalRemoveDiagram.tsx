import React from 'react';
import {Button, Modal} from "react-bootstrap";
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
		if (ProjectSettings.selectedDiagram === this.props.diagram) {
			changeDiagrams(0);
		}
		this.props.performTransaction(updateProjectSettings(ProjectSettings.contextIRI));
	}

	render() {
		return (
			<Modal centered show={this.props.modal}>
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
					<Button onClick={() => {
						this.save();
						this.props.update();
						this.props.close();
					}}>{Locale[ProjectSettings.viewLanguage].confirm}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}