import React from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { AppSettings, Languages } from "../config/Variables";
import { Locale } from "../config/Locale";
import { Environment } from "../config/Environment";
import MenuPanelReport from "./menu/right/MenuPanelReport";
import MenuPanelView from "./menu/left/MenuPanelView";
import MenuPanelHelp from "./menu/right/MenuPanelHelp";
import { MenuPanelSaveDiagrams } from "./menu/left/MenuPanelSaveDiagrams";
import ZoomWidget from "./menu/widget/ZoomWidget";
import InterfaceNotification from "../components/InterfaceNotification";
import MenuPanelLogout from "./menu/right/MenuPanelLogout";
import ViewWidget from "./menu/widget/ViewWidget";
import MenuPanelAbout from "./menu/right/MenuPanelAbout";
import MenuPanelValidate from "./menu/left/MenuPanelValidate";
import FitContentWidget from "./menu/widget/FitContentWidget";
import InterfaceStatus from "../components/InterfaceStatus";
import MenuPanelSwitchRepresentation from "./menu/left/MenuPanelSwitchRepresentation";

interface MenuPanelProps {
  readOnly?: boolean;
  projectLanguage: string;
  handleChangeLanguage: any;
  update: Function;
  loading: boolean;
  status: string;
  freeze: boolean;
  validate: Function;
  closeDetailPanel: Function;
  handleStatus: Function;
  performTransaction: (...queries: string[]) => void;
  retry: boolean;
  tooltip: boolean;
}

interface MenuPanelState {
  tooltip: boolean;
}

export default class MenuPanel extends React.Component<
  MenuPanelProps,
  MenuPanelState
> {
  constructor(props: MenuPanelProps) {
    super(props);
    this.state = {
      tooltip: false,
    };
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
  }

  handleChangeLanguage(event: React.ChangeEvent<HTMLSelectElement>) {
    this.props.handleChangeLanguage(event.currentTarget.value);
  }

  update() {
    this.forceUpdate();
  }

  render() {
    return (
      <nav className={"menuPanel"}>
        <div className={"upper"}>
          <h5>
            {AppSettings.name[this.props.projectLanguage] === ""
              ? "<untitled>"
              : AppSettings.name[this.props.projectLanguage]}
          </h5>
          <InterfaceNotification
            active={this.props.loading}
            message={this.props.status}
            error={this.props.freeze}
            performTransaction={this.props.performTransaction}
            retry={this.props.retry}
          />
          <div className={"right" + (this.props.freeze ? " nointeract" : "")}>
            <Form inline>
              <MenuPanelReport />
              <InterfaceStatus
                handleStatus={this.props.handleStatus}
                error={this.props.freeze}
                status={this.props.status}
              />
              &nbsp;
              <Form.Control
                as="select"
                value={this.props.projectLanguage}
                onChange={this.handleChangeLanguage}
              >
                {Object.keys(Languages).map((languageCode) => (
                  <option key={languageCode} value={languageCode}>
                    {Languages[languageCode]}
                  </option>
                ))}
              </Form.Control>
            </Form>
          </div>
        </div>
        <div className={"lower" + (this.props.freeze ? " nointeract" : "")}>
          <MenuPanelView
            update={() => this.props.update()}
            performTransaction={this.props.performTransaction}
          />
          <MenuPanelSwitchRepresentation
            update={() => this.props.update()}
            close={() => this.props.closeDetailPanel()}
            performTransaction={this.props.performTransaction}
          />
          {Environment.auth && (
            <MenuPanelValidate validate={() => this.props.validate()} />
          )}
          <MenuPanelSaveDiagrams />
          <ZoomWidget />
          <ViewWidget />
          <FitContentWidget />
          <div className={"right" + (this.props.freeze ? " nointeract" : "")}>
            {Environment.auth && <MenuPanelLogout />}
            <MenuPanelHelp />
            <OverlayTrigger
              trigger={[]}
              placement="bottom"
              delay={5000}
              show={this.state.tooltip}
              overlay={
                <Tooltip id={"newVersionTooltip"}>
                  {Locale[AppSettings.viewLanguage].newVersion}
                </Tooltip>
              }
            >
              <MenuPanelAbout tooltip={this.props.tooltip} />
            </OverlayTrigger>
          </div>
        </div>
      </nav>
    );
  }
}
