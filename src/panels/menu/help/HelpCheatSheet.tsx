import React from 'react';
import {ProjectSettings} from "../../../config/Variables";
import {LocaleHelp} from "../../../config/Locale";

export default class HelpCheatSheet extends React.Component {

	render() {
		return (<div>
			<h4>{LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.title}</h4>
			<p>{LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.t1}</p>
			{Object.keys(LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.interactions).map((interaction: string, i) =>
				<div key={i++}><h5 key={i++}>{interaction}</h5>
					<ul key={i++}>
						{Object.keys(LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.interactions[interaction])
							.map((part) => <li key={i++}><strong key={i++}>{part + " "}</strong>
								{LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.interactions[interaction][part]}
							</li>)}
					</ul>
				</div>
			)}
		</div>);
	}
}