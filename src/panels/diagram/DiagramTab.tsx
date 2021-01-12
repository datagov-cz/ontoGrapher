import React from 'react';
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";
// @ts-ignore
import {RIEInput} from "riek";
import {updateProjectSettings} from "../../interface/TransactionInterface";

interface Props {
	diagram: number;
	update: Function;
	deleteDiagram: Function;
	performTransaction: (transaction: { add: string[], delete: string[], update: string[] }) => void;
}

interface State {

}

export default class DiagramTab extends React.Component<Props, State> {

	changeDiagram() {
		changeDiagrams(this.props.diagram);
		this.props.update();
	}

	handleChangeDiagramName(event: { textarea: string }) {
		if (event.textarea.length > 0){
			Diagrams[this.props.diagram].name = event.textarea;
			this.props.performTransaction(updateProjectSettings(ProjectSettings.contextIRI));
			this.forceUpdate();
			this.props.update();
		}
	}

	render() {
		return (
			<div
				className={"diagramTab" + (this.props.diagram === ProjectSettings.selectedDiagram ? " selected" : "")}
				onClick={() => this.changeDiagram()}>
				{this.props.diagram === ProjectSettings.selectedDiagram ? <RIEInput
					className={"rieinput"}
					value={Diagrams[this.props.diagram].name}
					change={(event: { textarea: string }) => {
						this.handleChangeDiagramName(event);
					}}
					propName="textarea"
				/> : Diagrams[this.props.diagram].name}
				{Diagrams.filter(diag => diag.active).length > 1 && <button className={"buttonlink"} onClick={(evt) => {
					evt.stopPropagation();
					this.props.deleteDiagram(this.props.diagram);
				}}>
                    <span role="img" aria-label={""}>&nbsp;❌</span>
                </button>}
			</div>);
	}
}