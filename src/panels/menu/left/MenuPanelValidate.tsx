import React from "react";
import { Nav } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import classNames from "classnames";

interface Props {
  validate: Function;
}

export default class MenuPanelValidate extends React.Component<Props> {
  render() {
    return (
      <div
        className={classNames("inert", {
          nointeract: AppSettings.selectedDiagram === "",
        })}
      >
        <Nav.Link onClick={() => this.props.validate()}>
          {Locale[AppSettings.interfaceLanguage].validate}
        </Nav.Link>
      </div>
    );
  }
}
