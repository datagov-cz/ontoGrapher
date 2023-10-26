import React from "react";
import { Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { AboutModal } from "../modal/AboutModal";
import preval from "preval.macro";

interface Props {
  tooltip: boolean;
}

interface State {
  modal: boolean;
}

const buildDate = preval`module.exports = new Date().toLocaleDateString(["cs", "en"]);`;
const buildTime = preval`module.exports = new Date().toLocaleTimeString(["cs", "en"]);`;

export default class MenuPanelAbout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modal: false,
    };
  }

  render() {
    return (
      <div className={"inert"}>
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id={"newVersionTooltip"}>{buildTime}</Tooltip>}
        >
          <Nav.Link
            onClick={() => {
              this.setState({ modal: true });
            }}
          >
            {`${buildDate} - ${
              Locale[AppSettings.interfaceLanguage].changelogButton
            }`}
          </Nav.Link>
        </OverlayTrigger>
        <AboutModal
          modal={this.state.modal}
          close={() => {
            this.setState({ modal: false });
          }}
        />
      </div>
    );
  }
}
