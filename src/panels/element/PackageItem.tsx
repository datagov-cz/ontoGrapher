import React from 'react';
import {ProjectElements, ProjectSettings, VocabularyElements} from "../../config/Variables";
import {getLabelOrBlank} from "../../function/FunctionGetVars";
import {
	highlightElement,
	resetDiagramSelection,
	unhighlightElement,
	updateDiagramPosition
} from "../../function/FunctionDiagram";
import {graph} from "../../graph/Graph";
import {paper} from "../../main/DiagramCanvas";
import {ReactComponent as HiddenElementSVG} from "../../svg/hiddenElement.svg";
import {isElementHidden} from "../../function/FunctionElem";
import classNames from "classnames";

interface Props {
	id: string;
	openRemoveItem: (id: string) => void;
	showDetails: Function;
	readOnly: boolean;
	projectLanguage: string;
	visible: boolean;
	update: () => void;
}

interface State {
	hover: boolean;
	modalRemove: boolean;
}

export default class PackageItem extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hover: false,
			modalRemove: false,
		}
	}

	getLabel(): JSX.Element {
		return <span className={"label"}>
				{getLabelOrBlank(VocabularyElements[ProjectElements[this.props.id].iri].labels, this.props.projectLanguage)}
			{VocabularyElements[ProjectElements[this.props.id].iri].altLabels
				.filter(alt => alt.language === this.props.projectLanguage).length > 0 &&
            <span className={"altLabel"}>
				&nbsp;{"(" + VocabularyElements[ProjectElements[this.props.id].iri].altLabels
				.filter(alt => alt.language === this.props.projectLanguage)
				.map(alt => alt.label).join(", ") + ")"}
			</span>}
		</span>
	}

	handleClick(event: React.MouseEvent<HTMLDivElement>) {
		event.stopPropagation();
		if (event.ctrlKey) {
			if (ProjectSettings.selectedElements.includes(this.props.id))
				unhighlightElement(this.props.id)
			else highlightElement(this.props.id);
		} else resetDiagramSelection();
		highlightElement(this.props.id);
		let elem = graph.getElements().find(elem => elem.id === this.props.id);
		if (elem) {
			const scale = paper.scale().sx;
			paper.translate(0, 0);
			paper.translate((-elem.position().x * scale) + (paper.getComputedSize().width / 2) - elem.getBBox().width,
				(-elem.position().y * scale) + (paper.getComputedSize().height / 2) - elem.getBBox().height);
			updateDiagramPosition(ProjectSettings.selectedDiagram);
		}
		this.props.update();
		this.props.showDetails(this.props.id);
	}

	render() {
		return (
			<div draggable
				 onDragStart={(event) => {
					 event.dataTransfer.setData("newClass", JSON.stringify({
						 type: "existing",
						 id: ProjectSettings.selectedElements.length > 0 ? ProjectSettings.selectedElements : [this.props.id],
						 iri: ProjectSettings.selectedElements.length > 0 ? ProjectSettings.selectedElements.map(id => ProjectElements[id].iri) : [ProjectElements[this.props.id].iri]
					 }));
				 }}
				 onDragEnd={() => {
					 resetDiagramSelection();
					 this.props.update();
				 }}
				 onClick={(event) => this.handleClick(event)}
				 onMouseOver={() => {
					 this.setState({hover: true})
				 }}
				 onMouseLeave={() => {
					 this.setState({hover: false})
				 }}
				 id={this.props.id}
				 className={classNames("stereotypeElementItem", {
					 'hidden': isElementHidden(this.props.id, ProjectSettings.selectedDiagram),
					 'closed': !this.props.visible,
					 'selected': ProjectSettings.selectedElements.includes(this.props.id)
				 })}
			>
				{this.getLabel()}
				{isElementHidden(this.props.id, ProjectSettings.selectedDiagram) && <HiddenElementSVG/>}
				{(this.state.hover && !(this.props.readOnly)) &&
				<span className={"packageOptions right"}>
						<button className={"buttonlink"}
								onClick={(event) => {
									event.stopPropagation();
									this.props.openRemoveItem(this.props.id);
								}}><span role="img"
										 aria-label={""}>❌</span>
                        </button>
                    </span>
				}
			</div>
		);
	}
}
