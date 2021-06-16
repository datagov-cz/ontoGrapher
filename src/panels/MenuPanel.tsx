import React from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { AppSettings, Languages } from "../config/Variables";
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
import MenuPanelReport from "./menu/MenuPanelReport";
import { Locale } from "../config/Locale";

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
          <MenuPanelValidate validate={() => this.props.validate()} />
          <ZoomWidget />
          <ViewWidget />
          <FitContentWidget />
          <div className={"right" + (this.props.freeze ? " nointeract" : "")}>
            <MenuPanelLogout />
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
