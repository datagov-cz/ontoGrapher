import React from 'react';
import {Dropdown} from 'react-bootstrap';
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import {ColorPool} from "../../../config/ColorPool";
import {ProjectSettings} from "../../../config/Variables";
import {graph} from "../../../graph/Graph";
import {drawGraphElement} from "../../../function/FunctionGraph";
import {setSchemeColors} from "../../../function/FunctionGetVars";
import {updateProjectSettings} from "../../../interface/TransactionInterface";
import * as LocaleMain from "../../../locale/LocaleMain.json";

interface Props {
	update: Function;
	handleChangeLoadingStatus: Function;
}

interface State {

}

export default class MenuPanelSwitchColors extends React.Component<Props, State> {

	switch(pool: string) {
		this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
		ProjectSettings.viewColorPool = pool;
		setSchemeColors(pool);
		graph.getElements().forEach(elem =>
			drawGraphElement(elem, ProjectSettings.selectedLanguage, ProjectSettings.representation));
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, "", true);
			}
		});
		this.props.update();
		this.forceUpdate();
	}

	render() {
		return (<Dropdown drop={"right"}>
			<Dropdown.Toggle>
				{LocaleMenu.switchColors}
			</Dropdown.Toggle>
			<Dropdown.Menu>
				{Object.keys(ColorPool).map((pool) =>
					<Dropdown.Item disabled={pool === ProjectSettings.viewColorPool}
								   onClick={() => this.switch(pool)}>{(pool === ProjectSettings.viewColorPool ? "✓ " : "") + ColorPool[pool].label}</Dropdown.Item>)}
			</Dropdown.Menu>
		</Dropdown>);
	}
}