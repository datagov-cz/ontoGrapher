import React from 'react';
import DiagramAdd from "./diagram/DiagramAdd";
import {Diagrams} from "../config/Variables";
import DiagramTab from "./diagram/DiagramTab";
import ModalRemoveDiagram from "./modal/ModalRemoveDiagram";

interface Props {
	performTransaction: (transaction: { add: string[], delete: string[], update: string[] }) => void;
	error: boolean;
	update: Function;
}

interface State {
	modalRemoveDiagram: boolean;
	selectedDiagram: number;
}

export default class DiagramPanel extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			modalRemoveDiagram: false,
			selectedDiagram: 0
		}
	}

	render() {
		return (<div className={"diagramPanel" + (this.props.error ? " disabled" : "")}>
			{Diagrams.map((diag, i) => {
				if (diag.active) return (<DiagramTab key={i} diagram={i} name={diag.name}
													 error={this.props.error}
													 update={() => {
														 this.forceUpdate();
														 this.props.update();
													 }}
													 performTransaction={this.props.performTransaction}/>)
				else return "";
			})}
			<DiagramAdd update={() => {
				this.forceUpdate();
				this.props.update();
			}} error={this.props.error} performTransaction={this.props.performTransaction}/>
			<ModalRemoveDiagram
				modal={this.state.modalRemoveDiagram}
				diagram={this.state.selectedDiagram}
				close={() => {
					this.setState({modalRemoveDiagram: false});
				}}
				update={() => {
					this.forceUpdate();
				}}
				performTransaction={this.props.performTransaction}
			/>

		</div>);
	}
}