import React from 'react';
import {ProjectSettings} from "../../../config/Variables";
import {LocaleHelp} from "../../../config/Locale";

export default class HelpCheatSheet extends React.Component {

	render() {
		let key = 0;
		return (<div>
			<h4>{LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.title}</h4>
			<p>{LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.t1}</p>
			{Object.keys(LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.interactions).map((interaction: string) =>
				<div key={key++}><h5 key={key++}>{interaction}</h5>
					<ul key={key++}>
						{Object.keys(LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.interactions[interaction])
							.map((part) => <li key={key++}><strong key={key++}>{part + " "}</strong>
								{LocaleHelp[ProjectSettings.viewLanguage].cheatSheet.interactions[interaction][part]}
							</li>)}
					</ul>
				</div>
			)}
		</div>);
	}
}