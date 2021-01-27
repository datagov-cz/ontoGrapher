import React from 'react';
import DiagramAdd from "./diagram/DiagramAdd";
import {Diagrams} from "../config/Variables";
import DiagramTab from "./diagram/DiagramTab";
import ModalRemoveDiagram from "./modal/ModalRemoveDiagram";

interface Props {
	performTransaction: (...queries: string[]) => void;
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
			{Diagrams.filter(diag => diag.active).map((diag, i) =>
				<DiagramTab key={i}
							diagram={Diagrams.indexOf(diag)}
							update={() => {
								this.forceUpdate();
								this.props.update();
							}}
							performTransaction={this.props.performTransaction}
							deleteDiagram={(diag: number) => {
								this.setState({selectedDiagram: diag, modalRemoveDiagram: true});
							}}/>
			)}
			<DiagramAdd update={() => {
				this.forceUpdate();
				this.props.update();
			}} performTransaction={this.props.performTransaction}/>
			<ModalRemoveDiagram
				modal={this.state.modalRemoveDiagram}
				diagram={this.state.selectedDiagram}
				close={() => {
					this.setState({modalRemoveDiagram: false});
				}}
				update={() => {
					this.forceUpdate();
					this.props.update();
				}}
				performTransaction={this.props.performTransaction}
			/>

		</div>);
	}
}