import React, { useEffect, useState } from "react";
import {
  Badge,
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
import {
  AppSettings,
  CardinalityPool,
  Stereotypes,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import _ from "lodash";
import { ElemCreationConfiguration } from "./CreationModals";
import { getName, initLanguageObject } from "../../function/FunctionEditVars";
import { Locale } from "../../config/Locale";
import { NewElemForm } from "./NewElemForm";
import { Patterns } from "../../pattern/PatternTypes";
import PatternInternalView from "../../pattern/PatternInternalView";
import Select from "react-select";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import {
  formElementData,
  formRelationshipData,
} from "../../pattern/PatternCreationModalExisting";
import { callSuggestionAlgorithm } from "../../pattern/PatternQueries";

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

export const NewElemModal: React.FC<Props> = (props: Props) => {
  const [searchResults, setSearchResults] = useState<string[]>(
    Object.keys(Patterns)
  );
  const [filterName, setFilterName] = useState<string>("");
  const [filterAuthor, setFilterAuthor] = useState<string>("");
  const [filterSuggest, setFilterSuggest] = useState<boolean>(false);
  const [detailPattern, setDetailPattern] = useState<string>("");
  const [patternElementFormData, setPatternElementFormData] = useState<{
    [key: string]: formElementData;
  }>({});
  const [patternRelationshipFormData, setPatternRelationshipFormData] =
    useState<{ [key: string]: formRelationshipData }>({});
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

  const modifyFormData = (index: string, data: formElementData) => {
    const copy = _.clone(patternElementFormData);
    copy[index] = data;
    setPatternElementFormData(copy);
  };

  useEffect(() => setSearchResults(Object.keys(Patterns)), []);

  const suggestPatterns: () => Promise<string[]> = async () => {
    return await callSuggestionAlgorithm(AppSettings.selectedElements);
  };

  // useEffect(() => {
  //   if (props.initSubmit)
  //     props.submit(
  //       detailPattern,
  //       patternElementFormData,
  //       patternRelationshipFormData
  //     );
  // }, [props.initSubmit]);
  //
  // useEffect(() => {
  //   if (props.pattern) {
  //     selectPattern(props.pattern);
  //   }
  // }, [props.pattern]);

  const selectPattern = (pattern: string) => {
    setDetailPattern(pattern);
    const elementFormData: { [key: string]: formElementData } = {};
    for (const term in Patterns[pattern].terms) {
      elementFormData[term] = {
        ...Patterns[pattern].terms[term],
        iri: "",
        create: true,
        value: { value: "", label: "" },
        scheme: "",
        use: Patterns[pattern].terms[term].optional ? true : undefined,
      };
    }
    setPatternElementFormData(elementFormData);
    const relationshipFormData: { [key: string]: formRelationshipData } = {};
    for (const term in Patterns[pattern].conns) {
      relationshipFormData[term] = {
        ...Patterns[pattern].conns[term],
        scheme: "",
      };
    }
    setPatternRelationshipFormData(relationshipFormData);
  };

  const modifyRelationshipData: (
    index: string,
    data: formRelationshipData
  ) => void = (index, data) => {
    const copy = _.clone(patternRelationshipFormData);
    copy[index] = data;
    setPatternRelationshipFormData(copy);
  };

  const addMultipleTermAndRelationships = (index: string) => {
    // debugger;
    let newIDparam = index;
    while (newIDparam in patternElementFormData) {
      newIDparam += "+";
    }
    setPatternElementFormData((prevState) => ({
      ...prevState,
      ...{ [newIDparam]: prevState[index] },
    }));
    const relationships = Object.keys(patternRelationshipFormData).filter(
      (r) =>
        patternRelationshipFormData[r].to === index ||
        patternRelationshipFormData[r].from === index
    );
    const relObject: { [key: string]: formRelationshipData } = {};
    const relDirectionObject: { [key: string]: boolean } = {};
    for (const r of relationships) {
      relDirectionObject[r] = patternRelationshipFormData[r].from === index;
      let newID = r;
      while (newID in patternRelationshipFormData || newID in relObject) {
        newID += "+";
      }
      relObject[newID] = {
        name: patternRelationshipFormData[r].name,
        from: relDirectionObject[r]
          ? newIDparam
          : patternRelationshipFormData[r].from,
        to: relDirectionObject[r]
          ? patternRelationshipFormData[r].to
          : newIDparam,
        sourceCardinality: patternRelationshipFormData[r].sourceCardinality,
        targetCardinality: patternRelationshipFormData[r].targetCardinality,
        scheme: patternRelationshipFormData[r].scheme,
        linkType: patternRelationshipFormData[r].linkType,
      };
    }
    setPatternRelationshipFormData((prevState) => ({
      ...prevState,
      ...relObject,
    }));
  };

  useEffect(() => {
    if (filterSuggest)
      suggestPatterns().then((results) =>
        setSearchResults(
          results.filter(
            (r) =>
              (filterName
                ? Patterns[r].title
                    .toLowerCase()
                    .includes(filterName.toLowerCase())
                : true) &&
              (filterAuthor
                ? Patterns[r].author
                    .toLowerCase()
                    .includes(filterAuthor.toLowerCase())
                : true)
          )
        )
      );
    else
      setSearchResults(
        Object.keys(Patterns).filter(
          (r) =>
            (filterName
              ? Patterns[r].title
                  .toLowerCase()
                  .includes(filterName.toLowerCase())
              : true) &&
            (filterAuthor
              ? Patterns[r].author
                  .toLowerCase()
                  .includes(filterAuthor.toLowerCase())
              : true)
        )
      );
  }, [filterName, filterAuthor, filterSuggest]);

  return (
    <Modal
      centered
      scrollable
      size={size}
      show={props.modal}
      keyboard={true}
      onEscapeKeyDown={() => props.close()}
      onHide={() => props.close}
      onEntering={() => {
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
                      <Form.Check
                        label="Suggest only patterns that conform to selection"
                        checked={filterSuggest}
                        onChange={(event) =>
                          setFilterSuggest(event.currentTarget.checked)
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
                                onClick={() => selectPattern(r)}
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
                    {detailPattern in Patterns && (
                      <div>
                        <h3>Using pattern {Patterns[detailPattern].title}</h3>
                        <h5>Internal view</h5>
                        <PatternInternalView
                          width={"500px"}
                          height={"500px"}
                          fitContent={true}
                          terms={patternElementFormData}
                          conns={patternRelationshipFormData}
                        />
                        <br />
                        <h5>Set terms</h5>
                        <Table striped={true} borderless={true} size={"sm"}>
                          <thead>
                            <tr>
                              <th>Name & Vocabulary</th>
                              <th style={{ minWidth: "105px" }}>Create new?</th>
                              <th style={{ minWidth: "50px" }}>Type(s)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(patternElementFormData)
                              .filter(([_, term]) => !term.parameter)
                              .map(([t, term]) => (
                                <tr>
                                  <td>
                                    {patternElementFormData[t].create && (
                                      <span>
                                        <Form.Control
                                          size={"sm"}
                                          value={patternElementFormData[t].name}
                                          onChange={(event) => {
                                            modifyFormData(t, {
                                              ...term,
                                              name: event.currentTarget.value,
                                            });
                                          }}
                                        />
                                        <Form.Control
                                          size={"sm"}
                                          as={"select"}
                                          value={
                                            patternElementFormData[t].scheme
                                          }
                                          onChange={(event) => {
                                            modifyFormData(t, {
                                              ...term,
                                              scheme: event.currentTarget.value,
                                            });
                                          }}
                                        >
                                          {Object.keys(WorkspaceVocabularies)
                                            .filter(
                                              (vocab) =>
                                                !WorkspaceVocabularies[vocab]
                                                  .readOnly
                                            )
                                            .map((vocab) => (
                                              <option
                                                style={{
                                                  backgroundColor:
                                                    WorkspaceVocabularies[vocab]
                                                      .color,
                                                }}
                                                value={vocab}
                                                key={vocab}
                                              >
                                                {
                                                  WorkspaceVocabularies[vocab]
                                                    .labels[
                                                    AppSettings.canvasLanguage
                                                  ]
                                                }
                                              </option>
                                            ))}
                                        </Form.Control>
                                      </span>
                                    )}
                                    {!patternElementFormData[t].create && (
                                      <Select
                                        options={Object.keys(WorkspaceTerms)
                                          .filter((t) =>
                                            patternElementFormData[
                                              t
                                            ].types.every((type) =>
                                              WorkspaceTerms[t].types.includes(
                                                type
                                              )
                                            )
                                          )
                                          .map((t) => ({
                                            label: getLabelOrBlank(
                                              WorkspaceTerms[t].labels,
                                              AppSettings.canvasLanguage
                                            ),
                                            value: t,
                                          }))}
                                        value={patternElementFormData[t].value}
                                        onChange={(value) =>
                                          modifyFormData(t, {
                                            ...term,
                                            iri: value!.value,
                                          })
                                        }
                                      />
                                    )}
                                  </td>
                                  <td>
                                    <Form.Check
                                      checked={patternElementFormData[t].create}
                                      onChange={(event) =>
                                        modifyFormData(t, {
                                          ...term,
                                          create: event.currentTarget.checked,
                                        })
                                      }
                                    />
                                  </td>
                                  <td>
                                    {patternElementFormData[t].types
                                      .filter((type) => type in Stereotypes)
                                      .map((stereotype) => (
                                        <Badge variant={"info"}>
                                          {getName(
                                            stereotype,
                                            AppSettings.canvasLanguage
                                          )}
                                        </Badge>
                                      ))}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                        <h5>Set relationships</h5>
                        <Table size={"sm"} striped borderless>
                          <thead>
                            <tr>
                              <th>Name & Vocabulary</th>
                              <th colSpan={5}>Relationship detail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(patternRelationshipFormData).map(
                              ([d, data]) => (
                                <tr>
                                  <td>
                                    <span>
                                      <Form.Control
                                        type={"text"}
                                        size={"sm"}
                                        onChange={(event) =>
                                          modifyRelationshipData(d, {
                                            ...data,
                                            name: event.currentTarget.value,
                                          })
                                        }
                                        value={
                                          patternRelationshipFormData[d].name
                                        }
                                      />
                                      <Form.Control
                                        size={"sm"}
                                        as={"select"}
                                        value={
                                          patternRelationshipFormData[d].scheme
                                        }
                                        onChange={(event) => {
                                          modifyRelationshipData(d, {
                                            ...data,
                                            scheme: event.currentTarget.value,
                                          });
                                        }}
                                      >
                                        {Object.keys(WorkspaceVocabularies)
                                          .filter(
                                            (scheme) =>
                                              !WorkspaceVocabularies[scheme]
                                                .readOnly
                                          )
                                          .map((scheme) => (
                                            <option
                                              style={{
                                                backgroundColor:
                                                  WorkspaceVocabularies[scheme]
                                                    .color,
                                              }}
                                              value={scheme}
                                              key={scheme}
                                            >
                                              {
                                                WorkspaceVocabularies[scheme]
                                                  .labels[
                                                  AppSettings.canvasLanguage
                                                ]
                                              }
                                            </option>
                                          ))}
                                      </Form.Control>
                                    </span>
                                  </td>
                                  <td style={{ wordBreak: "keep-all" }}>
                                    {data.from in WorkspaceTerms
                                      ? getLabelOrBlank(
                                          WorkspaceTerms[data.from].labels,
                                          AppSettings.canvasLanguage
                                        )
                                      : patternElementFormData[data.from].name}
                                  </td>
                                  <td>
                                    <Badge variant={"secondary"}>
                                      {CardinalityPool[
                                        parseInt(data.sourceCardinality, 10)
                                      ].getString()}
                                    </Badge>
                                  </td>
                                  <td className={"link"}>
                                    <svg
                                      width="100%"
                                      height="25px"
                                      preserveAspectRatio="none"
                                    >
                                      <line
                                        x1="0"
                                        y1="50%"
                                        x2="100%"
                                        y2="50%"
                                        strokeWidth="2"
                                        stroke="#333333"
                                      />
                                    </svg>
                                  </td>
                                  <td>
                                    <Badge variant={"secondary"}>
                                      {CardinalityPool[
                                        parseInt(data.targetCardinality, 10)
                                      ].getString()}
                                    </Badge>
                                  </td>
                                  <td style={{ wordBreak: "keep-all" }}>
                                    {data.to in WorkspaceTerms
                                      ? getLabelOrBlank(
                                          WorkspaceTerms[data.to].labels,
                                          AppSettings.canvasLanguage
                                        )
                                      : patternElementFormData[data.to].name}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                        <h5>Set parameters</h5>
                        <Table>
                          <thead>
                            <tr>
                              <th>Name & vocabulary</th>
                              <th>Create new?</th>
                              <th>Type</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(patternElementFormData)
                              .filter(([_, term]) => term.parameter)
                              .map(([t, term]) => (
                                <tr>
                                  <td>
                                    {patternElementFormData[t].create && (
                                      <span>
                                        <Form.Control
                                          size={"sm"}
                                          value={patternElementFormData[t].name}
                                          onChange={(event) => {
                                            modifyFormData(t, {
                                              ...term,
                                              name: event.currentTarget.value,
                                            });
                                          }}
                                        />
                                        <Form.Control
                                          size={"sm"}
                                          as={"select"}
                                          value={
                                            patternElementFormData[t].scheme
                                          }
                                          onChange={(event) => {
                                            modifyFormData(t, {
                                              ...term,
                                              scheme: event.currentTarget.value,
                                            });
                                          }}
                                        >
                                          {Object.keys(WorkspaceVocabularies)
                                            .filter(
                                              (vocab) =>
                                                !WorkspaceVocabularies[vocab]
                                                  .readOnly
                                            )
                                            .map((vocab) => (
                                              <option
                                                style={{
                                                  backgroundColor:
                                                    WorkspaceVocabularies[vocab]
                                                      .color,
                                                }}
                                                value={vocab}
                                                key={vocab}
                                              >
                                                {
                                                  WorkspaceVocabularies[vocab]
                                                    .labels[
                                                    AppSettings.canvasLanguage
                                                  ]
                                                }
                                              </option>
                                            ))}
                                        </Form.Control>
                                      </span>
                                    )}
                                    {!patternElementFormData[t].create && (
                                      <Select
                                        options={Object.keys(WorkspaceTerms)
                                          .filter((t) =>
                                            patternElementFormData[
                                              t
                                            ].types.every((type) =>
                                              WorkspaceTerms[t].types.includes(
                                                type
                                              )
                                            )
                                          )
                                          .map((t) => ({
                                            label: getLabelOrBlank(
                                              WorkspaceTerms[t].labels,
                                              AppSettings.canvasLanguage
                                            ),
                                            value: t,
                                          }))}
                                        value={patternElementFormData[t].value}
                                        onChange={(value) =>
                                          modifyFormData(t, {
                                            ...term,
                                            iri: value!.value,
                                          })
                                        }
                                      />
                                    )}
                                  </td>
                                  <td>
                                    <Form.Check
                                      checked={patternElementFormData[t].create}
                                      onChange={(event) =>
                                        modifyFormData(t, {
                                          ...term,
                                          create: event.currentTarget.checked,
                                        })
                                      }
                                    />
                                  </td>
                                  <td>
                                    {patternElementFormData[t].types
                                      .filter((type) => type in Stereotypes)
                                      .map((stereotype) => (
                                        <Badge variant={"info"}>
                                          {getName(
                                            stereotype,
                                            AppSettings.canvasLanguage
                                          )}
                                        </Badge>
                                      ))}
                                  </td>
                                  <td>
                                    {patternElementFormData[t].optional && (
                                      <Button
                                        size={"sm"}
                                        onClick={() =>
                                          modifyFormData(t, {
                                            ...term,
                                            use: !patternElementFormData[t].use,
                                          })
                                        }
                                        variant={"info"}
                                      >
                                        {`Optional - ${
                                          patternElementFormData[t].use
                                            ? "Exclude"
                                            : "Include"
                                        }`}
                                      </Button>
                                    )}
                                    {patternElementFormData[t].multiple && (
                                      <Button
                                        size={"sm"}
                                        onClick={() =>
                                          addMultipleTermAndRelationships(t)
                                        }
                                        variant={"secondary"}
                                      >
                                        Cloneable - Clone
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                    {!(detailPattern in Patterns) && (
                      <h3>No pattern selected</h3>
                    )}
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
