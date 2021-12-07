import React from "react";
import { Dropdown } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import MenuPanelSwitchColors from "../view/MenuPanelSwitchColors";
import MenuPanelSwitchStereotypes from "../view/MenuPanelSwitchStereotypes";
import { MenuPanelChangeLanguage } from "../view/MenuPanelChangeLanguage";

interface Props {
  update: Function;
  performTransaction: (...queries: string[]) => void;
  handleChangeLanguage: (language: string) => void;
  handleChangeInterfaceLanguage: (language: string) => void;
}

interface State {}

export default class MenuPanelView extends React.Component<Props, State> {
  render() {
    return (
      <Dropdown className={"lower inert"}>
        <Dropdown.Toggle>
          {Locale[AppSettings.interfaceLanguage].view}
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
            language={"canvasLanguage"}
          />
          <MenuPanelChangeLanguage
            handleChangeLanguage={this.props.handleChangeInterfaceLanguage}
            title={"setInterfaceLanguage"}
            language={"interfaceLanguage"}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
