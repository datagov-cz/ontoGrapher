import React from 'react';
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {Locale} from "../../config/Locale";

interface Props {
	update: Function;
}

interface State {

}

export default class DiagramAdd extends React.Component<Props, State> {

	addDiagram() {
		Diagrams.push({name: Locale[ProjectSettings.selectedLanguage].untitled, json: {}, active: true});
		this.props.update();
	}

	render() {
		return (<div className={"diagramTab"}>
			<button className={"buttonlink nounderline"} onClick={() => {
				this.addDiagram();
			}}>
				<span role="img" aria-label={""}>➕</span>
			</button>
		</div>);
	}
}