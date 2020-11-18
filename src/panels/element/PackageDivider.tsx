import React from 'react';
import {Stereotypes} from "../../config/Variables";
import * as LocaleMain from "../../locale/LocaleMain.json";

interface Props {
	iri: string;
	projectLanguage: string;
	showCheckbox: boolean;
	handleShowCheckbox: Function;
	checkboxChecked: boolean;
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
		return (<div className={"packageDivider"}
					 onMouseOver={() => {
						 this.setState({hover: true})
					 }}
					 onMouseLeave={() => {
						 this.setState({hover: false})
					 }}
					 onClick={(event) => {
						 event.stopPropagation();
						 if (event.shiftKey) {
							 this.props.handleShowCheckbox();
						 }
					 }}
		>
			{this.props.iri in Stereotypes ? Stereotypes[this.props.iri].labels[this.props.projectLanguage] : LocaleMain.unsorted}
			{(this.props.showCheckbox || this.state.hover) && <span className={"packageOptions right"}>
				<input type="checkbox" checked={this.props.checkboxChecked}
                       onClick={(event) => {
						   event.stopPropagation();
						   this.props.handleShowCheckbox();
					   }}
                       onChange={() => {
					   }}/>
			</span>}
		</div>);
	}
}