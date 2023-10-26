import React, { useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import ReactMarkdown from "react-markdown";

interface Props {
  modal: boolean;
  close: Function;
}

const changelogURL =
  "https://raw.githubusercontent.com/datagov-cz/sgov-assembly-line/main/CHANGELOG.md";

export const AboutModal: React.FC<Props> = (props: Props) => {
  const [changelog, setChangelog] = useState<JSX.Element>(<Spinner />);

  const loadChangelog = async () => {
    setChangelog(<Spinner />);
    return fetch(changelogURL)
      .then((response) => response.text())
      .then((text) => {
        setChangelog(<ReactMarkdown>{text}</ReactMarkdown>);
      })
      .catch((e) => {
        console.error(e);
        setChangelog(
          <Alert variant="danger">
            {`${Locale[AppSettings.interfaceLanguage].changelogLoadError} `}
            <Button onClick={() => loadChangelog()}>
              {Locale[AppSettings.interfaceLanguage].retry}
            </Button>
          </Alert>
        );
      });
  };

  return (
    <Modal
      centered
      scrollable
      show={props.modal}
      keyboard
      onEscapeKeyDown={() => props.close()}
      onEnter={() => loadChangelog()}
      size="xl"
    >
      <Modal.Header>
        <Modal.Title>
          {Locale[AppSettings.interfaceLanguage].changelog}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="flexCenter">
        <div>{changelog}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => props.close()}>
          {Locale[AppSettings.interfaceLanguage].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
