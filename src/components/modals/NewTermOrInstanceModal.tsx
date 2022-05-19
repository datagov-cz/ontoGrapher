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
import { initLanguageObject } from "../../function/FunctionEditVars";
import { Locale } from "../../config/Locale";
import { NewElemForm } from "./NewElemForm";
import {
  formElementData,
  formRelationshipData,
  PatternViewColumn,
} from "../../pattern/creation/PatternViewColumn";
import {
  createInstance,
  putInstanceOnCanvas,
} from "../../pattern/function/FunctionPattern";
import { Instances, Patterns } from "../../pattern/function/PatternTypes";

interface Props {
  modal: boolean;
  closeElem: (names?: State["termName"], vocabulary?: string) => void;
  closeInstance: (queries: string[], iri: string) => void;
  projectLanguage: string;
  configuration: ElemCreationConfiguration;
}

interface State {
  termName: { [key: string]: string };
  errorText: string;
  selectedVocabulary: string;
  size: undefined | "xl";
}

export const NewTermOrInstanceModal: React.FC<Props> = (props: Props) => {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [tab, setTab] = useState<string>("0");
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

  const save = () => {
    if (errorText === "") {
      const names = _.mapValues(termName, (name) => name.trim());
      props.closeElem(names, selectedVocabulary);
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
    console.log(Instances[instance], instance);
    if (AppSettings.patternView) putInstanceOnCanvas(instance);
    props.closeInstance(queries, instance);
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
      onEscapeKeyDown={() => props.closeElem()}
      onHide={() => props.closeElem()}
      dialogClassName={tab === "1" ? "patternModal" : ""}
      onEntering={() => {
        setSearchResults(Object.keys(Patterns));
        if (!selectedVocabulary) {
          const vocab = Object.keys(WorkspaceVocabularies).find(
            (vocab) => !WorkspaceVocabularies[vocab].readOnly
          );
          if (!vocab) props.closeElem();
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
          eventKey={tab}
          onSelect={(eventKey) => {
            setTab(eventKey!);
            setSize(eventKey === "0" ? undefined : "xl");
          }}
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
            <Tab eventKey={"1"} title={"Vytvořit instanci"}>
              <Container style={{ minWidth: "95%" }}>
                <Row>
                  <Col>
                    <div style={{ marginTop: "10px" }}>
                      <Form.Control
                        size={"sm"}
                        type={"text"}
                        placeholder={"Název"}
                        value={filterName}
                        onChange={(event) =>
                          setFilterName(event.currentTarget.value)
                        }
                      />
                      <Form.Control
                        size={"sm"}
                        type={"text"}
                        placeholder={"Autor"}
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
                          <tr key={r}>
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
                            <td>Nenalezeny žádné šablony</td>
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
                      validate={(val) => setDisabled(!val)}
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
            if (tab === "0" && errorText === "") save();
            if (tab === "1") setInitSubmitEx(true);
          }}
          disabled={tab === "0" ? errorText !== "" : disabled}
          variant="primary"
        >
          {Locale[AppSettings.interfaceLanguage].confirm}
        </Button>
        <Button
          onClick={() => {
            props.closeElem();
          }}
          variant="secondary"
        >
          {Locale[AppSettings.interfaceLanguage].cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
