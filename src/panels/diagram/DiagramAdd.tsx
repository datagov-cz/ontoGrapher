import React from 'react';
import {Diagrams, ProjectElements, ProjectLinks, ProjectSettings} from "../../config/Variables";
import {processTransaction, updateProjectSettings} from "../../interface/TransactionInterface";
import {Locale} from "../../config/Locale";

interface Props {
	update: Function;
	error: boolean;
	handleChangeLoadingStatus: Function;
}

interface State {

}

export default class DiagramAdd extends React.Component<Props, State> {

	addDiagram() {
		this.props.handleChangeLoadingStatus(true, Locale[ProjectSettings.viewLanguage].updating, false);
		let index = Diagrams.push({name: Locale[ProjectSettings.viewLanguage].untitled, json: {}, active: true}) - 1;
		Object.keys(ProjectElements).forEach(elem => ProjectElements[elem].hidden[index] = true);
		Object.keys(ProjectLinks).forEach(link => ProjectLinks[link].vertices[index] = []);
		processTransaction(ProjectSettings.contextEndpoint, updateProjectSettings(ProjectSettings.contextIRI)).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, "", true);
			}
		});
		this.props.update();
	}

	render() {
		return (<div className={"diagramTab" + (this.props.error ? " disabled" : "")}>
			<button className={"buttonlink nounderline"} onClick={() => {
				this.addDiagram();
			}}>
				<span role="img" aria-label={""}>➕</span>
			</button>
		</div>);
	}
}