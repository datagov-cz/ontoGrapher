import React from 'react';
import {ProjectSettings} from "../../../config/Variables";
import HelpCheatSheet from "./HelpCheatSheet";
import {helpModal} from "../../../locale/help";

export default class HelpMain extends React.Component {

	render() {
		return (<div>
			<p>{helpModal[ProjectSettings.viewLanguage].intro.t2}</p>
			<p><a href="https://github.com/opendata-mvcr/ontoGrapher/issues/new"
				  rel="noopener noreferrer"
				  target="_blank">https://github.com/opendata-mvcr/ontoGrapher/issues/new</a></p>
			<HelpCheatSheet/>
		</div>);
	}
}