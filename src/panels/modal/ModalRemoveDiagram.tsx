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
	retry: boolean;
}

export default class ModalRemoveDiagram extends React.Component<Props> {

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
		if (prevState !== this.state && ((this.props.retry && ProjectSettings.lastUpdate.source === this.constructor.name))) {
			this.save();
		}
	}

	save() {
		this.props.handleChangeLoadingStatus(true, "", false);
		delete Diagrams[this.props.diagram];
		if (ProjectSettings.selectedDiagram === this.props.diagram) {
			changeDiagrams(0);
		}
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint, this.constructor.name).then(result => {
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