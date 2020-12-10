import React from 'react';
import {Locale} from "../../../config/Locale";
import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../../../config/Variables";
import {getLabelOrBlank, getLinkOrVocabElem} from "../../../function/FunctionGetVars";
import IRIlabel from "../../../components/IRIlabel";
import TableList from "../../../components/TableList";

interface Props {
	connections: string[];
	projectLanguage: string;
	to: boolean;
	showButton: boolean;
	button: JSX.Element;
}

interface State {

}

export default class ConnectionTable extends React.Component<Props, State> {

	render() {
		return (<TableList
			headings={[Locale[ProjectSettings.viewLanguage].connectionVia,
				this.props.to ? Locale[ProjectSettings.viewLanguage].connectionTo : Locale[ProjectSettings.viewLanguage].connectionFrom]}>
			{this.props.connections.map((conn) =>
				<tr key={conn}>
					<IRIlabel
						label={getLinkOrVocabElem(ProjectLinks[conn].iri).labels[this.props.projectLanguage]}
						iri={ProjectLinks[conn].iri}/>
					<td>{getLabelOrBlank(VocabularyElements[ProjectElements[
						this.props.to ? ProjectLinks[conn].target : ProjectLinks[conn].source].iri].labels, this.props.projectLanguage)}</td>
				</tr>
			)}
			{this.props.showButton && <th colSpan={2}>
				{this.props.button}
            </th>}
		</TableList>);
	}
}