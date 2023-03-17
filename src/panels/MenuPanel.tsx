import React from "react";
import { Col, Container, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import InterfaceNotification from "../components/InterfaceNotification";
import { MainViewMode } from "../config/Enum";
import { Environment } from "../config/Environment";
import { Locale } from "../config/Locale";
import { StoreSettings } from "../config/Store";
import { AppSettings } from "../config/Variables";
import { MenuPanelExport } from "./menu/left/MenuPanelExport";
import MenuPanelSettings from "./menu/left/MenuPanelSettings";
import MenuPanelSwitchRepresentation from "./menu/left/MenuPanelSwitchRepresentation";
import MenuPanelValidate from "./menu/left/MenuPanelValidate";
import MenuPanelAbout from "./menu/right/MenuPanelAbout";
import { MenuPanelAvatar } from "./menu/right/MenuPanelAvatar";
import MenuPanelHelp from "./menu/right/MenuPanelHelp";
import MenuPanelReport from "./menu/right/MenuPanelReport";
import FitContentWidget from "./menu/widget/FitContentWidget";
import ViewWidget from "./menu/widget/ViewWidget";
import ZoomWidget from "./menu/widget/ZoomWidget";

interface MenuPanelProps {
  readOnly?: boolean;
  projectLanguage: string;
  handleChangeLanguage: (language: string) => void;
  handleChangeInterfaceLanguage: (language: string) => void;
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
  interactive: boolean;
}

export default class MenuPanel extends React.Component<
  MenuPanelProps,
  MenuPanelState
> {
  constructor(props: MenuPanelProps) {
    super(props);
    this.state = {
      tooltip: false,
      interactive: true,
    };
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    StoreSettings.subscribe(
      (s) => s.mainViewMode,
      (s) => this.setState({ interactive: s === MainViewMode.CANVAS })
    );
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
        <Container fluid className="upper">
          <Row>
            <Col className="left">
              <h3 className={"title"}>
                {Locale[AppSettings.interfaceLanguage].ontoGrapher}
              </h3>
              <InterfaceNotification
                loading={this.props.loading}
                message={this.props.status}
                error={this.props.freeze}
                performTransaction={this.props.performTransaction}
                retry={this.props.retry}
                handleStatus={this.props.handleStatus}
                status={this.props.status}
              />
            </Col>
            <Col className={"right" + (this.props.freeze ? " nointeract" : "")}>
              <MenuPanelReport />
              {Environment.auth && <MenuPanelAvatar />}
            </Col>
          </Row>
        </Container>
        <div
          className={
            "lower" +
            (this.props.freeze || !this.state.interactive ? " nointeract" : "")
          }
        >
          <MenuPanelSettings
            update={() => this.props.update()}
            performTransaction={this.props.performTransaction}
            handleChangeLanguage={this.props.handleChangeLanguage}
            handleChangeInterfaceLanguage={
              this.props.handleChangeInterfaceLanguage
            }
          />
          <MenuPanelSwitchRepresentation
            update={() => this.props.update()}
            close={() => this.props.closeDetailPanel()}
            performTransaction={this.props.performTransaction}
          />
          {Environment.auth && (
            <MenuPanelValidate validate={() => this.props.validate()} />
          )}
          <MenuPanelExport />
          <ZoomWidget />
          <ViewWidget />
          <FitContentWidget />
          <div
            className={
              "right" + (this.props.freeze ? " nointeract" : " interact")
            }
          >
            <MenuPanelHelp />
            <OverlayTrigger
              trigger={[]}
              placement="bottom"
              delay={5000}
              show={this.state.tooltip}
              overlay={
                <Tooltip id={"newVersionTooltip"}>
                  {Locale[AppSettings.interfaceLanguage].newVersion}
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
