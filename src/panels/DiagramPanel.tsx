import React from 'react';
import DiagramAdd from "./diagram/DiagramAdd";
import {Diagrams} from "../config/Variables";
import DiagramTab from "./diagram/DiagramTab";
import ModalRemoveDiagram from "./modal/ModalRemoveDiagram";

interface Props {
	retry: boolean;
	handleChangeLoadingStatus: Function;
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
		return (<div className={"diagramPanel"}>
			{Diagrams.map((diag, i) => <DiagramTab key={i} diagram={i} name={diag.name}
												   update={() => this.forceUpdate()}
												   handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}/>)}
			<DiagramAdd update={() => this.forceUpdate()}/>

			{/*<ModalRenameDiagram*/}
			{/*	modal={this.state.modalRenameDiagram}*/}
			{/*	diagram={this.state.selectedDiagram}*/}
			{/*	close={() => {*/}
			{/*		this.setState({modalRenameDiagram: false});*/}
			{/*	}}*/}
			{/*	update={() => {*/}
			{/*		this.forceUpdate();*/}
			{/*	}}*/}
			{/*	handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}*/}
			{/*	retry={this.props.retry}*/}
			{/*/>*/}

			<ModalRemoveDiagram
				modal={this.state.modalRemoveDiagram}
				diagram={this.state.selectedDiagram}
				close={() => {
					this.setState({modalRemoveDiagram: false});
				}}
				update={() => {
					this.forceUpdate();
				}}
				handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
				retry={this.props.retry}
			/>

		</div>);
	}
}