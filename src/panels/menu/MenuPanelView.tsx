import React from 'react';
import {Dropdown} from 'react-bootstrap';
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import MenuPanelSwitchStereotypes from "./view/MenuPanelSwitchStereotypes";
import MenuPanelSwitchColors from "./view/MenuPanelSwitchColors";

interface Props {
	update: Function;
	handleChangeLoadingStatus: Function;
}

interface State {

}

export default class MenuPanelView extends React.Component<Props, State> {

	render() {
		return (<Dropdown className={"lower inert"}>
			<Dropdown.Toggle>
				{LocaleMenu.view}
			</Dropdown.Toggle>
			<Dropdown.Menu>
				<MenuPanelSwitchStereotypes update={() => this.props.update()}/>
				<Dropdown.Divider/>
				<MenuPanelSwitchColors update={() => this.props.update()}
									   handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}/>
			</Dropdown.Menu>
		</Dropdown>);
	}
}