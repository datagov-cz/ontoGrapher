import React from 'react';
import {Diagrams, ProjectElements, ProjectLinks, ProjectSettings} from "../../config/Variables";
import * as Locale from "../../locale/LocaleMain.json";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {updateProjectSettings} from "../../interface/TransactionInterface";

interface Props {
	update: Function;
	error: boolean;
	handleChangeLoadingStatus: Function;
}

interface State {

}

export default class DiagramAdd extends React.Component<Props, State> {

	addDiagram() {
		this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
		let index = Diagrams.push({name: Locale.untitled, json: {}, active: true}) - 1;
		Object.keys(ProjectElements).forEach(elem => ProjectElements[elem].hidden[index] = true);
		Object.keys(ProjectLinks).forEach(link => ProjectLinks[link].vertices[index] = []);
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then(result => {
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