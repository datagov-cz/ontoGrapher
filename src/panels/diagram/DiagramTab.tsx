import React from 'react';
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";
// @ts-ignore
import {RIEInput} from "riek";
import {updateProjectSettings} from "../../interface/TransactionInterface";

interface Props {
	name: string;
	diagram: number;
	update: Function;
	performTransaction: (transaction: { add: string[], delete: string[], update: string[] }) => void;
	error: boolean;
}

interface State {

}

export default class DiagramTab extends React.Component<Props, State> {

	deleteDiagram() {
		Diagrams[this.props.diagram].active = false;
		if (this.props.diagram < ProjectSettings.selectedDiagram) changeDiagrams(ProjectSettings.selectedDiagram - 1);
		else if (this.props.diagram === ProjectSettings.selectedDiagram) changeDiagrams(0);
		this.props.update();
		this.props.performTransaction(updateProjectSettings(ProjectSettings.contextIRI));
	}

	changeDiagram() {
		changeDiagrams(this.props.diagram);
		this.props.update();
		ProjectSettings.selectedLink = "";
	}

	handleChangeDiagramName(event: { textarea: string }) {
		Diagrams[this.props.diagram].name = event.textarea;
		this.props.performTransaction(updateProjectSettings(ProjectSettings.contextIRI));
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