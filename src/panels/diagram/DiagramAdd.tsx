import React from 'react';
import {Diagrams} from "../../config/Variables";
import * as Locale from "../../locale/LocaleMain.json";

interface Props {
	update: Function;
	error: boolean;
}

interface State {

}

export default class DiagramAdd extends React.Component<Props, State> {

	addDiagram() {
		Diagrams.push({name: Locale.untitled, json: {}, active: true});
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