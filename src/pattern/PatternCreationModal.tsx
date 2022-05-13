import React, { useState } from "react";
import { Button, Form, Modal, Tab, Tabs } from "react-bootstrap";
import { Locale } from "../config/Locale";
import { AppSettings } from "../config/Variables";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import { PatternCreationModalExisting } from "./PatternCreationModalExisting";
import { PatternCreationModalNew } from "./PatternCreationModalNew";
import { Instances, Pattern, Patterns } from "./PatternTypes";
import { v4 } from "uuid";
import { paper } from "../main/DiagramCanvas";
import { createNewConcept } from "../function/FunctionElem";
import { initLanguageObject, parsePrefix } from "../function/FunctionEditVars";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../queries/update/UpdateElementQueries";
import { saveNewLink } from "../function/FunctionLink";
import { Representation } from "../config/Enum";
import { formElementData, formRelationshipData } from "./PatternViewColumn";

type Props = {
  modal: boolean;
  close: Function;
  configuration: PatternCreationConfiguration;
  performTransaction: (...queries: string[]) => void;
};

export const PatternCreationModal: React.FC<Props> = (props: Props) => {
  const [submitLabel, setSubmitLabel] = useState<string>("Create pattern");
  const [tab, setTab] = useState<string>("pattern");
  const [existingPattern, setExistingPattern] = useState<string>("");
  const [createInstance, setCreateInstance] = useState<boolean>(true);
  const [initSubmitNew, setInitSubmitNew] = useState<boolean>(false);
  const [initSubmitEx, setInitSubmitEx] = useState<boolean>(false);

  const submitNew = (pattern: Pattern) => {
    setInitSubmitNew(false);
    if (!pattern.title) return;
    if (!Object.values(pattern.conns).every((c) => c.name)) return;
    if (!Object.values(pattern.terms).every((c) => c.name)) return;
    const id = v4();
    Patterns[id] = pattern;
    if (createInstance) {
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
    const instanceTerms: string[] = Object.values(elements).map((e) => e.iri);
    const instanceConns: string[] = Object.values(connections).map(
      (e) => e.iri
    );
    const queries: string[] = [];
    const matrixLength = Math.max(
      Object.keys(elements).length + Object.keys(connections).length
    );
    const matrixDimension = Math.ceil(Math.sqrt(matrixLength));
    const startingCoords = paper.clientToLocalPoint({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    Object.values(elements)
      .filter((t) => t.create)
      .forEach((t, i) => {
        const x = i % matrixDimension;
        const y = Math.floor(i / matrixDimension);
        const id = createNewConcept(
          { x: startingCoords.x + x * 200, y: startingCoords.y + y * 200 },
          initLanguageObject(t.name),
          AppSettings.canvasLanguage,
          t.scheme,
          t.types
        );
        queries.push(id);
      });
    Object.values(connections)
      .filter((t) => t.create)
      .forEach((c, i) => {
        const x = (i + Object.keys(elements).length) % matrixDimension;
        const y = Math.floor(
          (i + Object.keys(elements).length) / matrixDimension
        );
        const id = createNewConcept(
          { x: startingCoords.x + x * 200, y: startingCoords.y + y * 200 },
          initLanguageObject(c.name),
          AppSettings.canvasLanguage,
          c.scheme,
          [parsePrefix("z-sgov-pojem", "typ-vztahu")]
        );
        queries.push(
          updateProjectElement(true, id),
          updateProjectElementDiagram(AppSettings.selectedDiagram, id),
          ...saveNewLink(
            id,
            elements[c.from].iri,
            elements[c.to].iri,
            Representation.COMPACT
          )
        );
      });
    Instances[v4()] = {
      iri: pattern,
      terms: instanceTerms,
      conns: instanceConns,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
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
      onEntering={() => {}}
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
              submit={(
                pattern: string,
                elements: { [key: string]: formElementData },
                connections: { [key: string]: formRelationshipData }
              ) => submitExisting(pattern, elements, connections)}
            />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        {tab === "pattern" && (
          <span>
            <Form.Check
              style={{ display: "inline-block", marginRight: "20px" }}
              checked={createInstance}
              onChange={(event) =>
                setCreateInstance(event.currentTarget.checked)
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
