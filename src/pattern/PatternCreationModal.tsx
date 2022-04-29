import React, { useState } from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import { Locale } from "../config/Locale";
import { AppSettings } from "../config/Variables";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import { PatternCreationModalExisting } from "./PatternCreationModalExisting";
import { PatternCreationModalNew } from "./PatternCreationModalNew";

type Props = {
  modal: boolean;
  close: Function;
  configuration: PatternCreationConfiguration;
};

export const PatternCreationModal: React.FC<Props> = (props: Props) => {
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  return (
    <Modal
      centered
      scrollable
      show={props.modal}
      keyboard={true}
      size={"xl"}
      onEscapeKeyDown={() => props.close()}
      onHide={() => props.close}
      onEntering={() => {}}
    >
      <Modal.Header>
        <Modal.Title>Create or apply pattern</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs id={"pattern-creation-tabs"} defaultActiveKey={"instance"}>
          <Tab eventKey={"pattern"} title={"Create new pattern"}>
            <PatternCreationModalNew configuration={props.configuration} />
          </Tab>
          <Tab eventKey={"instance"} title={"Apply existing pattern"}>
            <PatternCreationModalExisting configuration={props.configuration} />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button type={"submit"} disabled={submitDisabled} variant="primary">
          {Locale[AppSettings.interfaceLanguage].confirm}
        </Button>
        <Button
          onClick={() => {
            props.close();
          }}
          variant="secondary"
        >
          {Locale[AppSettings.interfaceLanguage].cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
