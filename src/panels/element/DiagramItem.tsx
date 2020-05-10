import React from 'react';
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {loadDiagram, saveDiagram} from "../../function/FunctionDiagram";
import {graph} from "../../graph/graph";
import {updateProjectSettings} from "../../interface/TransactionInterface";

interface Props {
	diagram: number;
	update: Function;
	selectedDiagram: number;
	openRenameDiagram: Function;
	openRemoveDiagram: Function;
	handleChangeLoadingStatus: Function;
	retry: boolean;
}

interface State {
	hover: boolean;
	name: string;
}

const tooltipE = (
	<Tooltip id="tooltipE">{LocaleMain.renameDiagram}</Tooltip>
);

export default class DiagramItem extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hover: false,
			name: this.props.diagram === ProjectSettings.selectedDiagram ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram"
		};
		this.alertPanel = this.alertPanel.bind(this);
	}


	save() {
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint, this.constructor.name).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, "", true);
			}
		})
	}

	alertPanel() {
		if (this.props.diagram !== ProjectSettings.selectedDiagram) {
			Diagrams[ProjectSettings.selectedDiagram].json = saveDiagram();
			let load = Diagrams[this.props.diagram].json;
			if (Object.keys(load).length === 0) {
				graph.clear();
			} else {
				loadDiagram(load);
			}
			this.save();
			ProjectSettings.selectedDiagram = this.props.diagram;
			this.setClassName();
			this.props.update();
		}
	}

	componentDidMount(): void {
		this.setClassName();
	}

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
		if (prevProps.selectedDiagram !== this.props.selectedDiagram) {
			this.setClassName();
			this.forceUpdate();
		}
		if (prevState !== this.state && ((this.props.retry && ProjectSettings.lastUpdate.source === this.constructor.name))) {
			this.save();
		}
	}

	setClassName() {
		this.setState({name: this.props.diagram === ProjectSettings.selectedDiagram ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram"});
	}

	render() {
		return (
			<div
				className={this.state.name}
				onClick={this.alertPanel}
				onMouseOver={() => {
					this.setState({hover: true})
				}}
				onMouseLeave={() => {
					this.setState({hover: false})
				}}
			>
				<span className={"label"}>{Diagrams[this.props.diagram].name}</span>
				<span className={"packageOptions right"}
					  style={{display: this.state.hover ? "inline-block" : "none"}}>
                               <OverlayTrigger overlay={tooltipE}
											   popperConfig={{
												   modifiers: {
													   preventOverflow: {
														   enabled: false
													   }
												   }
											   }}
											   placement={"bottom"}
							   >
                                    <button className={"buttonlink"} onClick={() => {
										this.props.openRenameDiagram();
									}}><span role="img" aria-label={""}>✏</span></button>
                                </OverlayTrigger>
                                <OverlayTrigger
									popperConfig={{
										modifiers: {
											preventOverflow: {
												enabled: false
											}
										}
									}}
									placement={"bottom"}
									overlay={
										(<Tooltip id={"tltip"}>{LocaleMain.del}</Tooltip>)
									}>
                                    <button className={"buttonlink"} onClick={() => {
										this.props.openRemoveDiagram();
									}}><span role="img" aria-label={""}>❌</span></button>
                                </OverlayTrigger>
                        </span>
			</div>
		);
	}
}