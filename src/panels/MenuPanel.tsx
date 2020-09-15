import React from 'react';
import {Form} from "react-bootstrap";
import {Languages, ProjectSettings} from "../config/Variables";
import MenuPanelHelp from "./menu/MenuPanelHelp";
import MenuPanelAbout from "./menu/MenuPanelAbout";
import InterfaceNotification from "../components/InterfaceNotification";
import MenuPanelValidate from "./menu/MenuPanelValidate";
import MenuPanelSwitchRepresentation from "./menu/MenuPanelSwitchRepresentation";

interface MenuPanelProps {
	readOnly?: boolean;
	projectLanguage: string;
	handleChangeLanguage: any;
	newProject: Function;
	loadProject: Function;
	loadContext: Function;
	update: Function;
	loading: boolean;
	status: string;
	loadingError: boolean;
	validate: Function;
	closeDetailPanel: Function;
	handleChangeLoadingStatus: Function;
}

interface MenuPanelState {
}

export default class MenuPanel extends React.Component<MenuPanelProps, MenuPanelState> {
    constructor(props: MenuPanelProps) {
        super(props);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    }

    handleChangeLanguage(event: React.ChangeEvent<HTMLSelectElement>) {
		this.props.handleChangeLanguage(event.currentTarget.value);
	}

    render() {
		return (
			<nav className={"menuPanel"}>
				<div className={"upper"}>
					<h5>{ProjectSettings.name[this.props.projectLanguage] === "" ? "<untitled>" : ProjectSettings.name[this.props.projectLanguage]}</h5>
					<InterfaceNotification active={this.props.loading} message={this.props.status}
										   error={this.props.loadingError}
										   handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}/>
					<div className={"right"}>
						<Form inline>
							<Form.Control as="select" value={this.props.projectLanguage}
										  onChange={this.handleChangeLanguage}>
								{Object.keys(Languages).map((languageCode) => (
									<option key={languageCode}
											value={languageCode}>{Languages[languageCode]}</option>))}
							</Form.Control>
						</Form>
					</div>
				</div>
				<div className={"lower"}>
					<MenuPanelSwitchRepresentation update={() => this.props.update()}
												   close={() => this.props.closeDetailPanel()}/>
					<MenuPanelValidate validate={() => this.props.validate()}/>
					<div className={"right"}>
						<MenuPanelHelp/>
						<MenuPanelAbout/>
					</div>
				</div>
			</nav>
		);
	}
}