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
	handleChangeLoadingStatus: Function;
	projectLanguage: string;
}

export default class ModalRemoveDiagram extends React.Component<Props> {

	save() {
		this.props.handleChangeLoadingStatus(true, "", false);
		Diagrams[this.props.diagram].active = false;
		if (ProjectSettings.selectedDiagram === this.props.diagram) {
			changeDiagrams(0);
		}
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then(result => {
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
					<Modal.Title>{Locale[this.props.projectLanguage].modalRemoveDiagramTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{Locale[this.props.projectLanguage].modalRemoveDiagramDescription}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => {
						this.setState({modalRemove: false});
					}} variant="secondary">{Locale[this.props.projectLanguage].cancel}</Button>
					<Button onClick={() => {
						this.save();
						this.props.update();
						this.props.close();
					}}>{Locale[this.props.projectLanguage].confirm}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}