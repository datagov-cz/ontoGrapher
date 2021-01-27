import React from 'react';
import {Form} from "react-bootstrap";
import {Languages, ProjectSettings} from "../config/Variables";
import MenuPanelHelp from "./menu/MenuPanelHelp";
import MenuPanelAbout from "./menu/MenuPanelAbout";
import InterfaceNotification from "../components/InterfaceNotification";
import MenuPanelValidate from "./menu/MenuPanelValidate";
import MenuPanelSwitchRepresentation from "./menu/MenuPanelSwitchRepresentation";
import InterfaceStatus from "../components/InterfaceStatus";
import MenuPanelView from "./menu/MenuPanelView";
import ZoomWidget from "./menu/widget/ZoomWidget";
import ViewWidget from "./menu/widget/ViewWidget";
import FitContentWidget from "./menu/widget/FitContentWidget";
import MenuPanelLogout from "./menu/MenuPanelLogout";

interface MenuPanelProps {
	readOnly?: boolean;
	projectLanguage: string;
	handleChangeLanguage: any;
	update: Function;
	loading: boolean;
	status: string;
	error: boolean;
	validate: Function;
	closeDetailPanel: Function;
	handleChangeLoadingStatus: Function;
	performTransaction: (...queries: string[]) => void;
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
										   error={this.props.error}
										   performTransaction={this.props.performTransaction}
										   retry={this.props.retry}/>
					<div className={"right" + (this.props.error ? " nointeract" : "")}>
						<Form inline>
							<InterfaceStatus
								handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
								error={this.props.error}
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
				<div className={"lower" + (this.props.error ? " nointeract" : "")}>
					<MenuPanelView update={() => this.props.update()}
								   performTransaction={this.props.performTransaction}/>
					<MenuPanelSwitchRepresentation update={() => this.props.update()}
												   close={() => this.props.closeDetailPanel()}
												   performTransaction={this.props.performTransaction}/>
					<MenuPanelValidate validate={() => this.props.validate()}/>
					<MenuPanelLogout/>
					<ZoomWidget/>
					<ViewWidget/>
					<FitContentWidget/>
					<div className={"right" + (this.props.error ? " nointeract" : "")}>
						<MenuPanelHelp/>
						<MenuPanelAbout/>
					</div>
				</div>
			</nav>
		);
	}
}