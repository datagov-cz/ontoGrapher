import React from 'react';
import {Dropdown, SplitButton} from 'react-bootstrap';
import {ProjectSettings} from "../../config/Variables";
import {Locale} from "../../config/Locale";

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
				onClick={() => this.openReportURL(true)}>
				<Dropdown.Item eventKey="1"
							   onClick={() => this.openReportURL(false)}>
					{Locale[ProjectSettings.viewLanguage].reportEnhancement}
				</Dropdown.Item>
			</SplitButton>
		</span>);
	}

	openReportURL(issue: boolean) {
		window.open(`https://github.com/opendata-mvcr/sgov-assembly-line/issues/new${
			issue ?
				"?labels=bug&template=po-adavek-na-opravu.md" :
				"?labels=enhancement&template=po-adavek-na-novou-funkcionalitu.md"
		}&title=`, "_blank");
	}
}