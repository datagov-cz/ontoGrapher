import React from 'react';
import {ProjectSettings} from "../../../config/Variables";
import {Dropdown} from "react-bootstrap";
import {Locale} from "../../../config/Locale";

interface Props {
	update: Function;
}

interface State {

}

export default class MenuPanelSwitchItemPanelTypes extends React.Component<Props, State> {

	switch() {
		ProjectSettings.viewItemPanelTypes = !ProjectSettings.viewItemPanelTypes;
		this.props.update();
		this.forceUpdate();
	}

	render() {
		return (<div>
			<Dropdown.Item onClick={() => this.switch()} disabled={!ProjectSettings.viewStereotypes}>
				{(!ProjectSettings.viewItemPanelTypes ? "✓ " : "") + Locale[ProjectSettings.viewLanguage].sortByName}
			</Dropdown.Item>
			<Dropdown.Item onClick={() => this.switch()} disabled={ProjectSettings.viewStereotypes}>
				{(ProjectSettings.viewItemPanelTypes ? "✓ " : "") + Locale[ProjectSettings.viewLanguage].sortByStereotypes}
			</Dropdown.Item>
		</div>);
	}
}