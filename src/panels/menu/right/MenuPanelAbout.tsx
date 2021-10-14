import React from "react";
import { Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import AboutModal from "../modal/AboutModal";
import { getLastChangeDay } from "../../../function/FunctionGetVars";

interface Props {
  tooltip: boolean;
}

interface State {
  modal: boolean;
}

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
          trigger={[]}
          placement="bottom"
          delay={10000}
          show={this.props.tooltip}
          overlay={
            <Tooltip id={"newVersionTooltip"}>
              {Locale[AppSettings.viewLanguage].newVersion}
            </Tooltip>
          }
        >
          <Nav.Link
            onClick={() => {
              this.setState({ modal: true });
            }}
          >
            {`${getLastChangeDay()} - ${
              Locale[AppSettings.viewLanguage].changelogButton
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
