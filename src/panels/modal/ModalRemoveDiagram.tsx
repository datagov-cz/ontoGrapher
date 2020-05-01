import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";

interface Props {
	modal: boolean;
	diagram: number;
	close: Function;
	update: Function;
}

export default class ModalRemoveDiagram extends React.Component<Props> {

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
						delete Diagrams[this.props.diagram];
						if (ProjectSettings.selectedDiagram === this.props.diagram) {
							changeDiagrams(Object.keys(Diagrams)[0]);
						}
						this.props.update();
						this.props.close();
					}}>{LocaleMenu.confirm}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}