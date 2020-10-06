import React from 'react';
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";
// @ts-ignore
import {RIEInput} from "riek";
import {updateProjectSettings} from "../../interface/TransactionInterface";
import * as LocaleMain from "../../locale/LocaleMain.json";

interface Props {
	name: string;
	diagram: number;
	update: Function;
	handleChangeLoadingStatus: Function;
	error: boolean;
}

interface State {

}

export default class DiagramTab extends React.Component<Props, State> {

	deleteDiagram() {
		this.props.handleChangeLoadingStatus(true, "", false);
		Diagrams[this.props.diagram].active = false;
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then(result => {
			if (result) {
				if (this.props.diagram < ProjectSettings.selectedDiagram) changeDiagrams(ProjectSettings.selectedDiagram - 1);
				else if (this.props.diagram === ProjectSettings.selectedDiagram) changeDiagrams(0);
				this.props.update();
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
			}
		})
	}

	changeDiagram() {
		changeDiagrams(this.props.diagram);
		this.props.update();
	}

	handleChangeDiagramName(event: { textarea: string }) {
		this.props.handleChangeLoadingStatus(true, "", false);
		Diagrams[this.props.diagram].name = event.textarea;
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
			}
		})
		this.forceUpdate();
		this.props.update();
	}

	render() {
		return (
			<div
				className={"diagramTab" + (this.props.diagram === ProjectSettings.selectedDiagram ? " selected" : "") + (this.props.error ? " disabled" : "")}
				onClick={() => this.changeDiagram()}>
				{this.props.diagram === ProjectSettings.selectedDiagram ? <RIEInput
					className={"rieinput"}
					value={this.props.name.length > 0 ? this.props.name : "<blank>"}
					change={(event: { textarea: string }) => {
						this.handleChangeDiagramName(event);
					}}
					propName="textarea"
				/> : this.props.name}
				{Diagrams.filter(diag => diag.active).length > 1 && <button className={"buttonlink"} onClick={(evt) => {
					evt.stopPropagation();
					this.deleteDiagram();
				}}>
                    <span role="img" aria-label={""}>&nbsp;❌</span>
                </button>}
			</div>);
	}
}