import React from "react";
import { Nav } from "react-bootstrap";
import { AppSettings } from "../../config/Variables";
import { Locale } from "../../config/Locale";

interface Props {
  validate: Function;
}

interface State {}

export default class MenuPanelValidate extends React.Component<Props, State> {
  render() {
    return (
      <div className={"inert"}>
        <Nav.Link onClick={() => this.props.validate()}>
          {Locale[AppSettings.viewLanguage].validate}
        </Nav.Link>
      </div>
    );
  }
}
