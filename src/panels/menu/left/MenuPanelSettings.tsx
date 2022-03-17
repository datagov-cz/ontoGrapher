import React from "react";
import { Dropdown } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import MenuPanelSwitchColors from "../settings/MenuPanelSwitchColors";
import MenuPanelSwitchStereotypes from "../settings/MenuPanelSwitchStereotypes";
import { MenuPanelChangeLanguage } from "../settings/MenuPanelChangeLanguage";
import { MenuPanelChangeDefaultCardinality } from "../settings/MenuPanelChangeDefaultCardinality";

interface Props {
  update: Function;
  performTransaction: (...queries: string[]) => void;
  handleChangeLanguage: (language: string) => void;
  handleChangeInterfaceLanguage: (language: string) => void;
}

interface State {}

export default class MenuPanelSettings extends React.Component<Props, State> {
  render() {
    return (
      <Dropdown className={"lower inert"}>
        <Dropdown.Toggle>
          {Locale[AppSettings.interfaceLanguage].menuPanelSettings}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuPanelSwitchStereotypes update={() => this.props.update()} />
          <Dropdown.Divider />
          <MenuPanelSwitchColors
            update={() => this.props.update()}
            performTransaction={this.props.performTransaction}
          />
          <MenuPanelChangeLanguage
            handleChangeLanguage={this.props.handleChangeLanguage}
            title={"setCanvasLanguage"}
            languageType={"canvasLanguage"}
          />
          <MenuPanelChangeLanguage
            handleChangeLanguage={this.props.handleChangeInterfaceLanguage}
            title={"setInterfaceLanguage"}
            languageType={"interfaceLanguage"}
          />
          <MenuPanelChangeDefaultCardinality
            cardinality={"defaultCardinalitySource"}
          />
          <MenuPanelChangeDefaultCardinality
            cardinality={"defaultCardinalityTarget"}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
