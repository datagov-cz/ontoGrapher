import React, { useState } from "react";
import { Button, Form, Modal, Tab, Tabs } from "react-bootstrap";
import { Locale } from "../config/Locale";
import { AppSettings } from "../config/Variables";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import { PatternCreationModalExisting } from "./PatternCreationModalExisting";
import { PatternCreationModalNew } from "./PatternCreationModalNew";
import { Pattern, Patterns } from "./PatternTypes";
import { v4 } from "uuid";

type Props = {
  modal: boolean;
  close: Function;
  configuration: PatternCreationConfiguration;
};

export const PatternCreationModal: React.FC<Props> = (props: Props) => {
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const [submitLabel, setSubmitLabel] = useState<string>("Create pattern");
  const [tab, setTab] = useState<string>("instance");
  const [existingPattern, setExistingPattern] = useState<string>("");
  const [createInstance, setCreateInstance] = useState<boolean>(true);

  const submitNew = (pattern: Pattern) => {
    Patterns[v4()] = pattern;
    if (createInstance) {
      setTab("instance");
    }
  };

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
        <Tabs
          id={"pattern-creation-tabs"}
          activeKey={tab}
          defaultActiveKey={"instance"}
          onSelect={(eventKey) => {
            setTab(eventKey!);
            setSubmitLabel(
              eventKey === "instance"
                ? "Apply existing pattern"
                : "Create new Pattern"
            );
          }}
        >
          <Tab eventKey={"pattern"} title={"Create new pattern"}>
            <PatternCreationModalNew
              configuration={props.configuration}
              submit={submitNew}
            />
          </Tab>
          <Tab eventKey={"instance"} title={"Apply existing pattern"}>
            <PatternCreationModalExisting
              configuration={props.configuration}
              pattern={existingPattern}
              setSubmit={(val) => setSubmitDisabled(val)}
            />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        {tab === "pattern" && (
          <span>
            <Form.Check
              checked={createInstance}
              onChange={(event) =>
                setCreateInstance(event.currentTarget.checked)
              }
            />
            <Button type={"submit"} variant="primary">
              {submitLabel}
            </Button>
          </span>
        )}
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
