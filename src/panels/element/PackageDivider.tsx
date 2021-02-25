import React from 'react';
import {ProjectSettings, Stereotypes} from "../../config/Variables";
import {Locale} from "../../config/Locale";

interface Props {
	iri: string;
	projectLanguage: string;
	handleSelect: Function;
	items: string[];
	visible: boolean;
}

interface State {
	hover: boolean;
}

export default class PackageDivider extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hover: false,
		}
	}

	render() {
		return (<div className={"packageDivider" + (this.props.visible ? "" : " closed") +
		(this.props.items.every(elem => ProjectSettings.selectedElements.includes(elem)) ? " selected" : "")}
					 onMouseOver={() => {
						 this.setState({hover: true})
					 }}
					 onMouseLeave={() => {
						 this.setState({hover: false})
					 }}
					 onClick={(event) => {
						 event.stopPropagation();
						 if (event.ctrlKey) {
							 this.props.handleSelect();
							 this.forceUpdate();
						 }
					 }}
		>
			{this.props.iri in Stereotypes ? Stereotypes[this.props.iri].labels[this.props.projectLanguage] : Locale[ProjectSettings.viewLanguage].unsorted}
		</div>);
	}
}
