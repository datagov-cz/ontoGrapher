import React from "react";
import { Dropdown } from "react-bootstrap";
import { AppSettings } from "../../../config/Variables";
import { graph } from "../../../graph/Graph";
import { Locale } from "../../../config/Locale";
import { drawGraphElement } from "../../../function/FunctionDraw";

interface Props {
  update: Function;
}

interface State {}

export default class MenuPanelSwitchStereotypes extends React.Component<
  Props,
  State
> {
  switch() {
    AppSettings.viewStereotypes = !AppSettings.viewStereotypes;
    graph
      .getElements()
      .forEach((elem) =>
        drawGraphElement(
          elem,
          AppSettings.selectedLanguage,
          AppSettings.representation
        )
      );
    this.props.update();
    this.forceUpdate();
  }

  render() {
    return (
      <div>
        <Dropdown.Item
          onClick={() => this.switch()}
          disabled={!AppSettings.viewStereotypes}
        >
          {(!AppSettings.viewStereotypes ? "✓ " : "") +
            Locale[AppSettings.viewLanguage].hideStereotypes}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => this.switch()}
          disabled={AppSettings.viewStereotypes}
        >
          {(AppSettings.viewStereotypes ? "✓ " : "") +
            Locale[AppSettings.viewLanguage].showStereotypes}
        </Dropdown.Item>
      </div>
    );
  }
}
