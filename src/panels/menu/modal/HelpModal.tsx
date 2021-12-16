import React from "react";
import { Button, Modal } from "react-bootstrap";
import { AppSettings } from "../../../config/Variables";
import { Locale, LocaleHelp } from "../../../config/Locale";
import HelpMain from "../help/HelpMain";

interface Props {
  modal: boolean;
  close: Function;
}

interface State {
  topic: string;
}

export default class HelpModal extends React.Component<Props, State> {
  private readonly topics: {
    [key: string]: { title: string; page: JSX.Element };
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      topic: "main",
    };
    this.topics = {
      main: {
        title: LocaleHelp[AppSettings.interfaceLanguage].intro.title,
        page: <HelpMain />,
      },
    };
  }

  render() {
    return (
      <Modal
        centered
        show={this.props.modal}
        keyboard
        scrollable
        size={"lg"}
        onEscapeKeyDown={() => this.props.close()}
      >
        <Modal.Header>
          <Modal.Title>
            {Locale[AppSettings.interfaceLanguage].help}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.topics[this.state.topic].page}</Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              this.props.close();
            }}
          >
            {Locale[AppSettings.interfaceLanguage].close}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
