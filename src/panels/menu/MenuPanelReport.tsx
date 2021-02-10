import React from 'react';
import {Dropdown, SplitButton} from 'react-bootstrap';
import {ProjectSettings} from "../../config/Variables";
import {Locale} from "../../config/Locale";

interface Props {

}

interface State {

}

const issueURL = "https://github.com/opendata-mvcr/sgov-assembly-line/issues/new?labels=bug&template=po-adavek-na-opravu.md&title=";
const enhancementURL = "https://github.com/opendata-mvcr/sgov-assembly-line/issues/new?labels=enhancement&template=po-adavek-na-novou-funkcionalitu.md&title=";

export default class MenuPanelReport extends React.Component<Props, State> {

	render() {
		return (<span>
			<SplitButton
				id={"reportIssueSplitButton"}
				className={"inert report"}
				title={Locale[ProjectSettings.viewLanguage].reportIssue}
				variant={"warning"}
				href={issueURL}
				menuAlign={{sm: "left"}}
				target={"_blank"}>
				<Dropdown.Item href={enhancementURL} target={"_blank"}>
					{Locale[ProjectSettings.viewLanguage].reportEnhancement}
				</Dropdown.Item>
			</SplitButton>
		</span>);
	}
}