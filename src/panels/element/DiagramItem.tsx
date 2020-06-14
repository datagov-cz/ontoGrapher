import React from 'react';
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {loadDiagram, saveDiagram} from "../../function/FunctionDiagram";
import {graph} from "../../graph/Graph";
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
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint, DiagramItem.name).then(result => {
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
		if (prevProps !== this.props && ((this.props.retry && ProjectSettings.lastSource === DiagramItem.name))) {
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
											   placement={"bottom"}
							   >
                                    <button className={"buttonlink"} onClick={() => {
										this.props.openRenameDiagram();
									}}><span role="img" aria-label={""}>✏</span></button>
                                </OverlayTrigger>
                                <OverlayTrigger
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