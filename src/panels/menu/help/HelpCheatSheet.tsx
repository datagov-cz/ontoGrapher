import React from 'react';
import {ProjectSettings} from "../../../config/Variables";
import {helpModal} from "../../../locale/help";

export default class HelpCheatSheet extends React.Component {

	render() {
		return (<div>
			<h4>{helpModal[ProjectSettings.viewLanguage].cheatSheet.title}</h4>
			<p>{helpModal[ProjectSettings.viewLanguage].cheatSheet.t1}</p>
			{Object.keys(helpModal[ProjectSettings.viewLanguage].cheatSheet.interactions).map((interaction: string) => {
				return <div><h5>{interaction}</h5>
					<ul>
						{Object.keys(helpModal[ProjectSettings.viewLanguage].cheatSheet.interactions[interaction])
							.map(part => <li><strong>{part + " "}</strong>
								{helpModal[ProjectSettings.viewLanguage].cheatSheet.interactions[interaction][part]}
							</li>)}
					</ul>
				</div>
			})}
		</div>);
	}
}