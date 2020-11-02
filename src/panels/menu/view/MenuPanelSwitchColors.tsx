import React from 'react';
import {Dropdown} from 'react-bootstrap';
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import {ColorPool} from "../../../config/ColorPool";
import {ProjectSettings} from "../../../config/Variables";
import {graph} from "../../../graph/Graph";
import {drawGraphElement} from "../../../function/FunctionGraph";
import {setSchemeColors} from "../../../function/FunctionGetVars";

interface Props {
	update: Function;
}

interface State {

}

export default class MenuPanelSwitchColors extends React.Component<Props, State> {

	switch(pool: string) {
		ProjectSettings.viewColorPool = pool;
		setSchemeColors(pool);
		graph.getElements().forEach(elem =>
			drawGraphElement(elem, ProjectSettings.selectedLanguage, ProjectSettings.representation));
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