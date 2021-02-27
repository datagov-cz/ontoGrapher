import React from 'react';
import {Dropdown, SplitButton} from 'react-bootstrap';
import {ProjectSettings} from "../../config/Variables";
import {Locale} from "../../config/Locale";
import {Environment} from "../../config/Environment";

interface Props {

}

interface State {

}

export default class MenuPanelReport extends React.Component<Props, State> {

	render() {
		return (<span>
			<SplitButton
				id={"reportIssueSplitButton"}
				className={"inert report"}
				title={Locale[ProjectSettings.viewLanguage].reportIssue}
				variant={"warning"}
				href={Environment.components.issueTracker.meta.newBug}
				menuAlign={{sm: "left"}}
				target={"_blank"}>
				<Dropdown.Item href={Environment.components.issueTracker.meta.newFeature} target={"_blank"}>
					{Locale[ProjectSettings.viewLanguage].reportEnhancement}
				</Dropdown.Item>
			</SplitButton>
		</span>);
	}
}