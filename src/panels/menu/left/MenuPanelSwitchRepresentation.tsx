import React from "react";
import { Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { setRepresentation } from "../../../function/FunctionGraph";
import { AppSettings } from "../../../config/Variables";
import { Representation } from "../../../config/Enum";

interface Props {
  update: Function;
  close: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {
  alert: boolean;
}

export default class MenuPanelSwitchRepresentation extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      alert: false,
    };
  }

  switch() {
    const result = setRepresentation(
      AppSettings.representation === Representation.FULL
        ? Representation.COMPACT
        : Representation.FULL,
      AppSettings.selectedDiagram
    );
    if (result) {
      this.setState({ alert: result.result });
      setTimeout(() => {
        this.setState({ alert: false });
      }, 3000);
    }
    this.props.performTransaction(...result.transaction);
    this.props.close();
    this.props.update();
    this.forceUpdate();
  }

  render() {
    return (
      <OverlayTrigger
        show={this.state.alert}
        placement="right"
        overlay={
          <Tooltip id="tooltipC">
            {Locale[AppSettings.interfaceLanguage].hiddenTermsAndLinks}
          </Tooltip>
        }
      >
        <div className={"inert"}>
          <Nav.Link onClick={() => this.switch()}>
            {AppSettings.representation === Representation.FULL
              ? Locale[AppSettings.interfaceLanguage]
                  .representationCompactSwitch
              : Locale[AppSettings.interfaceLanguage].representationFullSwitch}
          </Nav.Link>
        </div>
      </OverlayTrigger>
    );
  }
}
