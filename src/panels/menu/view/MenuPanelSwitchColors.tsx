import React from 'react';
import {Dropdown} from 'react-bootstrap';
import {ColorPool} from "../../../config/ColorPool";
import {ProjectSettings} from "../../../config/Variables";
import {graph} from "../../../graph/Graph";
import {setSchemeColors} from "../../../function/FunctionGetVars";
import {updateProjectSettings} from "../../../interface/TransactionInterface";
import {Locale} from "../../../config/Locale";
import {drawGraphElement} from "../../../function/FunctionDraw";

interface Props {
	update: Function;
	performTransaction: (transaction: { add: string[], delete: string[], update: string[] }) => void;
}

interface State {

}

export default class MenuPanelSwitchColors extends React.Component<Props, State> {

	switch(pool: string) {
		ProjectSettings.viewColorPool = pool;
		setSchemeColors(pool);
		graph.getElements().forEach(elem =>
			drawGraphElement(elem, ProjectSettings.selectedLanguage, ProjectSettings.representation));
		this.props.performTransaction(updateProjectSettings(ProjectSettings.contextIRI))
		this.props.update();
		this.forceUpdate();
	}

	render() {
		return (<Dropdown drop={"right"}>
			<Dropdown.Toggle>
				{Locale[ProjectSettings.viewLanguage].switchColors}
			</Dropdown.Toggle>
			<Dropdown.Menu>
				{Object.keys(ColorPool).map((pool) =>
					<Dropdown.Item disabled={pool === ProjectSettings.viewColorPool}
								   onClick={() => this.switch(pool)}>{(pool === ProjectSettings.viewColorPool ? "✓ " : "") + ColorPool[pool].label}</Dropdown.Item>)}
			</Dropdown.Menu>
		</Dropdown>);
	}
}