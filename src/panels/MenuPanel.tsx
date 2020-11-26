import React from 'react';
import {Form} from "react-bootstrap";
import {Languages, ProjectSettings} from "../config/Variables";
import MenuPanelHelp from "./menu/MenuPanelHelp";
import MenuPanelAbout from "./menu/MenuPanelAbout";
import InterfaceNotification from "../components/InterfaceNotification";
import MenuPanelValidate from "./menu/MenuPanelValidate";
import MenuPanelSwitchRepresentation from "./menu/view/MenuPanelSwitchRepresentation";
import InterfaceStatus from "../components/InterfaceStatus";
import MenuPanelView from "./menu/MenuPanelView";

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
	retry: boolean;
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
										   handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
										   retry={this.props.retry}/>
					<div className={"right"}>
						<Form inline>
							<InterfaceStatus
								handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
								error={this.props.loadingError}
								status={this.props.status}
							/>
							&nbsp;
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
					<MenuPanelView update={() => this.props.update()}
								   handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}/>
					<MenuPanelSwitchRepresentation update={() => this.props.update()}
												   close={() => this.props.closeDetailPanel()}
												   handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}/>
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