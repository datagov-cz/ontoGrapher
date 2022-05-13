import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import _ from "lodash";
import { ElemCreationConfiguration } from "./CreationModals";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { Locale } from "../../config/Locale";
import { NewElemForm } from "./NewElemForm";
import { Instances, Patterns } from "../../pattern/PatternTypes";
import {
  formElementData,
  formRelationshipData,
  PatternViewColumn,
} from "../../pattern/PatternViewColumn";
import { paper } from "../../main/DiagramCanvas";
import { createNewConcept } from "../../function/FunctionElem";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../../queries/update/UpdateElementQueries";
import { saveNewLink } from "../../function/FunctionLink";
import { Representation } from "../../config/Enum";
import { v4 } from "uuid";

interface Props {
  modal: boolean;
  close: (names?: State["termName"], vocabulary?: string) => void;
  projectLanguage: string;
  configuration: ElemCreationConfiguration;
}

interface State {
  termName: { [key: string]: string };
  errorText: string;
  selectedVocabulary: string;
  size: undefined | "xl";
}

export const NewTermOrPatternModal: React.FC<Props> = (props: Props) => {
  const [initSubmitEx, setInitSubmitEx] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<string[]>(
    Object.keys(Patterns)
  );
  const [filterName, setFilterName] = useState<string>("");
  const [filterAuthor, setFilterAuthor] = useState<string>("");
  const [detailPattern, setDetailPattern] = useState<string>("");
  const [termName, setTermName] = useState<{ [key: string]: string }>(
    initLanguageObject("")
  );
  const [selectedVocabulary, setSelectedVocabulary] = useState<string>("");
  const [errorText, setErrorText] = useState<string>(
    Locale[AppSettings.interfaceLanguage].modalNewElemError
  );
  const [size, setSize] = useState<undefined | "xl">(undefined);

  useEffect(() => {
    const vocab = Object.keys(WorkspaceVocabularies).find(
      (vocab) => !WorkspaceVocabularies[vocab].readOnly
    );
    if (!vocab) props.close();
    else setSelectedVocabulary(vocab);
  }, []);

  const save = () => {
    if (errorText === "") {
      const names = _.mapValues(termName, (name) => name.trim());
      props.close(names, selectedVocabulary);
    }
  };

  const submitExisting = (
    pattern: string,
    elements: { [key: string]: formElementData },
    connections: { [key: string]: formRelationshipData }
  ) => {
    setInitSubmitEx(false);
    const instanceTerms: string[] = [];
    const instanceConns: string[] = [];
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

  useEffect(() => {
    setSearchResults(
      Object.keys(Patterns).filter(
        (r) =>
          (filterName
            ? Patterns[r].title.toLowerCase().includes(filterName.toLowerCase())
            : true) &&
          (filterAuthor
            ? Patterns[r].author
                .toLowerCase()
                .includes(filterAuthor.toLowerCase())
            : true)
      )
    );
  }, [filterName, filterAuthor]);

  return (
    <Modal
      centered
      scrollable
      size={size}
      show={props.modal}
      keyboard={true}
      onEscapeKeyDown={() => props.close()}
      onHide={() => props.close()}
      onEntering={() => {
        setSearchResults(Object.keys(Patterns));
        if (!selectedVocabulary) {
          const vocab = Object.keys(WorkspaceVocabularies).find(
            (vocab) => !WorkspaceVocabularies[vocab].readOnly
          );
          if (!vocab) props.close();
          else {
            setTermName(initLanguageObject(""));
            setErrorText(
              Locale[AppSettings.interfaceLanguage].modalNewElemError
            );
            setSelectedVocabulary(vocab);
          }
        } else {
          setTermName(initLanguageObject(""));
          setErrorText(Locale[AppSettings.interfaceLanguage].modalNewElemError);
        }
        const input = document.getElementById(
          "newElemLabelInput" + props.projectLanguage
        );
        if (input) input.focus();
      }}
    >
      <Modal.Header>
        <Modal.Title>{props.configuration.header}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          id={"elem-or-pattern-tabs"}
          defaultActiveKey={"0"}
          onSelect={(eventKey) => setSize(eventKey === "0" ? undefined : "xl")}
        >
          <Tab eventKey={"0"} title={props.configuration.header}>
            {selectedVocabulary && (
              <NewElemForm
                projectLanguage={props.projectLanguage}
                termName={termName}
                selectedVocabulary={selectedVocabulary}
                errorText={errorText}
                setTermName={(name, lang) =>
                  setTermName((prevState) => ({ ...prevState, [lang]: name }))
                }
                setSelectedVocabulary={(p) => setSelectedVocabulary(p)}
                setErrorText={(s) => setErrorText(s)}
              />
            )}
          </Tab>
          {props.configuration.connections.length === 0 && (
            <Tab eventKey={"1"} title={"Create instance"}>
              <Container>
                <Row>
                  <Col>
                    <div style={{ marginTop: "10px" }}>
                      <Form.Control
                        size={"sm"}
                        type={"text"}
                        placeholder={"Pattern title"}
                        value={filterName}
                        onChange={(event) =>
                          setFilterName(event.currentTarget.value)
                        }
                      />
                      <Form.Control
                        size={"sm"}
                        type={"text"}
                        placeholder={"Pattern author"}
                        value={filterAuthor}
                        onChange={(event) =>
                          setFilterAuthor(event.currentTarget.value)
                        }
                      />
                    </div>
                    <Table size={"sm"} borderless striped>
                      <thead>
                        <tr>
                          <th>Pattern list</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((r) => (
                          <tr>
                            <td>
                              <Button
                                className={"buttonlink"}
                                onClick={() => setDetailPattern(r)}
                              >
                                {Patterns[r].title}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {searchResults.length === 0 && (
                          <tr>
                            <td>No patterns found</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                  <Col>
                    <PatternViewColumn
                      pattern={detailPattern}
                      initSubmit={initSubmitEx}
                      submit={submitExisting}
                    />
                  </Col>
                </Row>
              </Container>
            </Tab>
          )}
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type={"submit"}
          onClick={() => {
            if (errorText === "") save();
          }}
          disabled={errorText !== ""}
          variant="primary"
        >
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
