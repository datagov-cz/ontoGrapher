import React, { useState } from "react";
import { Button, Form, Modal, Tab, Tabs } from "react-bootstrap";

import { PatternCreationModalExisting } from "./PatternCreationModalExisting";
import { PatternCreationModalNew } from "./PatternCreationModalNew";
import { v4 } from "uuid";
import { formElementData, formRelationshipData } from "./PatternViewColumn";
import { PatternCreationConfiguration } from "../../components/modals/CreationModals";
import { Locale } from "../../config/Locale";
import { Pattern, Patterns } from "../function/PatternTypes";
import {
  createInstance,
  putInstanceOnCanvas,
} from "../function/FunctionPattern";
import { AppSettings } from "../../config/Variables";

type Props = {
  modal: boolean;
  close: Function;
  configuration: PatternCreationConfiguration;
  performTransaction: (...queries: string[]) => void;
};

export const PatternCreationModal: React.FC<Props> = (props: Props) => {
  const [submitLabel, setSubmitLabel] = useState<string>("Create pattern");
  const [tab, setTab] = useState<string>("instance");
  const [existingPattern, setExistingPattern] = useState<string>("test");
  const [createInstanceFromNewPattern, setCreateInstanceFromNewPattern] =
    useState<boolean>(true);
  const [initSubmitNew, setInitSubmitNew] = useState<boolean>(false);
  const [initSubmitEx, setInitSubmitEx] = useState<boolean>(false);

  const submitNew = (pattern: Pattern) => {
    setInitSubmitNew(false);
    if (!pattern.title) return;
    if (!Object.values(pattern.conns).every((c) => c.name)) return;
    if (!Object.values(pattern.terms).every((c) => c.name)) return;
    const id = v4();
    Patterns[id] = pattern;
    console.log(id, pattern);
    if (createInstanceFromNewPattern) {
      setTab("instance");
      setExistingPattern(id);
    } else {
      props.close();
    }
  };

  const submitExisting = (
    pattern: string,
    elements: { [key: string]: formElementData },
    connections: { [key: string]: formRelationshipData }
  ) => {
    setInitSubmitEx(false);
    const { instance, queries } = createInstance(
      pattern,
      elements,
      connections
    );
    if (AppSettings.patternView) putInstanceOnCanvas(instance);
    props.close();
    return queries;
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
      onEntering={() => {
        setExistingPattern("");
      }}
      dialogClassName="patternModal"
    >
      <Modal.Header>
        <Modal.Title>Create or apply pattern</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          id={"pattern-creation-tabs"}
          activeKey={tab}
          onSelect={(eventKey) => {
            setTab(eventKey!);
            setSubmitLabel(
              eventKey === "instance"
                ? "Apply existing pattern"
                : "Create new pattern"
            );
          }}
        >
          <Tab eventKey={"pattern"} title={"Create new pattern"}>
            <PatternCreationModalNew
              configuration={props.configuration}
              submit={(pattern) => submitNew(pattern)}
              initSubmit={initSubmitNew}
            />
          </Tab>
          <Tab eventKey={"instance"} title={"Apply existing pattern"}>
            <PatternCreationModalExisting
              configuration={props.configuration}
              pattern={existingPattern}
              initSubmit={initSubmitEx}
              submit={submitExisting}
            />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        {tab === "pattern" && (
          <span>
            <Form.Check
              style={{ display: "inline-block", marginRight: "20px" }}
              checked={createInstanceFromNewPattern}
              onChange={(event) =>
                setCreateInstanceFromNewPattern(event.currentTarget.checked)
              }
              label={"Create an instance from this pattern"}
            />
            <Button
              type={"submit"}
              onClick={() => setInitSubmitNew(true)}
              variant="primary"
            >
              {submitLabel}
            </Button>
          </span>
        )}
        {tab === "instance" && (
          <span>
            <Button
              type={"submit"}
              onClick={() => setInitSubmitEx(true)}
              variant="primary"
            >
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
