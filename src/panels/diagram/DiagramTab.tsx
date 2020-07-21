import React from 'react';
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {changeDiagrams} from "../../function/FunctionDiagram";
// @ts-ignore
import {RIEInput} from "riek";

interface Props {
	name: string;
	diagram: number;
	update: Function;
}

interface State {

}

export default class DiagramTab extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	deleteDiagram() {
		Diagrams.splice(this.props.diagram, 1);
		if (this.props.diagram < ProjectSettings.selectedDiagram) changeDiagrams(ProjectSettings.selectedDiagram - 1);
		else if (this.props.diagram === ProjectSettings.selectedDiagram) changeDiagrams(0);
		this.props.update();
	}

	changeDiagram() {
		debugger;
		changeDiagrams(this.props.diagram);
		this.props.update();
	}

	handleChangeDiagramName(event: { textarea: string }) {
		Diagrams[this.props.diagram].name = event.textarea;
		this.forceUpdate();
		this.props.update();
	}

	render() {
		return (
			<div className={"diagramTab" + (this.props.diagram === ProjectSettings.selectedDiagram ? " selected" : "")}
				 onClick={() => this.changeDiagram()}>
				{this.props.diagram === ProjectSettings.selectedDiagram ? <RIEInput
					className={"rieinput"}
					value={this.props.name.length > 0 ? this.props.name : "<blank>"}
					change={(event: { textarea: string }) => {
						this.handleChangeDiagramName(event);
					}}
					propName="textarea"
				/> : this.props.name}
				{Diagrams.length !== 1 && <button className={"buttonlink"} onClick={() => {
					this.deleteDiagram();
				}}>
                    <span role="img" aria-label={""}>&nbsp;❌</span>
                </button>}
			</div>);
	}
}