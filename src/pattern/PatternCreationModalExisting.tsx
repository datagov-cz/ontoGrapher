import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { Instances, Patterns } from "./PatternTypes";
import {
  AppSettings,
  CardinalityPool,
  Stereotypes,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { getName } from "../function/FunctionEditVars";
import * as _ from "lodash";
import { callSuggestionAlgorithm } from "./PatternQueries";
import { v4 as uuidv4 } from "uuid";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import Select from "react-select";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";
import PatternInternalView from "./PatternInternalView";
import { createNewElemIRI } from "../function/FunctionCreateVars";

type Props = { configuration: PatternCreationConfiguration };
type formElementData = {
  name: string;
  iri: string;
  types: string[];
  parameter: boolean;
  create: boolean;
  value: { label: string; value: string };
  qualities: string[];
  optional?: boolean;
  scheme: string;
  multiple?: boolean;
};

type formRelationshipData = {
  name: string;
  from: string;
  to: string;
  sourceCardinality: string;
  targetCardinality: string;
  scheme: string;
};

export const PatternCreationModalExisting: React.FC<Props> = (props: Props) => {
  const [searchResults, setSearchResults] = useState<string[]>(
    Object.keys(Patterns)
  );
  const [errorElements, setErrorElements] = useState<string>("");
  const [errorRelationships, setErrorRelationships] = useState<string>("");
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [detailPattern, setDetailPattern] = useState<string>("");
  const [patternElementFormData, setPatternElementFormData] = useState<
    formElementData[]
  >([]);
  const [patternRelationshipFormData, setPatternRelationshipFormData] =
    useState<formRelationshipData[]>([]);

  const modifyFormData = (index: number, data: formElementData) => {
    const copy = _.clone(patternElementFormData);
    copy[index] = data;
    setPatternElementFormData(copy);
  };

  const suggestPatterns = () => {
    callSuggestionAlgorithm(AppSettings.selectedElements).then((r) =>
      setSearchResults(r)
    );
  };

  const createInstance = () => {
    Instances[uuidv4()] = {
      iri: detailPattern,
      terms: patternElementFormData.map((e) => ({
        iri: e.name,
        qualities: e.qualities,
      })),
      conns: patternRelationshipFormData.map((e) => ({
        iri: e.name,
        sourceCardinality: e.sourceCardinality,
        targetCardinality: e.targetCardinality,
        to: e.to,
        from: e.from,
      })),
      x: 0,
      y: 0,
    };
  };

  const selectPattern = (pattern: string) => {
    setDetailPattern(pattern);
    setPatternElementFormData(
      Patterns[pattern].terms
        .filter((t) => t.parameter)
        .map((t) => ({
          name: t.name,
          iri: "",
          types: t.types,
          parameter: true,
          create: true,
          value: { value: "", label: "" },
          qualities: [],
          scheme: "",
        }))
    );
    setPatternElementFormData((prevState) => [
      ...prevState,
      ...Patterns[pattern].terms
        .filter((t) => !t.parameter)
        .map((t) => ({
          name: t.name,
          iri: "",
          types: t.types,
          parameter: false,
          create: true,
          value: { value: "", label: "" },
          qualities: [],
          scheme: "",
        })),
    ]);
    setPatternRelationshipFormData(
      Patterns[pattern].conns.map((c) => ({
        name: c.name,
        from: c.from,
        to: c.to,
        sourceCardinality: c.sourceCardinality,
        targetCardinality: c.targetCardinality,
        scheme: "",
      }))
    );
  };

  useEffect(() => selectPattern("text"), []);

  const modifyRelationshipData: (
    index: number,
    data: formRelationshipData
  ) => void = (index, data) => {
    const copy = _.clone(patternRelationshipFormData);
    copy[index] = data;
    setPatternRelationshipFormData(copy);
  };

  const addMultipleTermAndRelationships = (index: number) => {
    setPatternElementFormData((prevState) => [
      ...prevState,
      patternElementFormData[index],
    ]);
    const relationships = patternRelationshipFormData.filter(
      (r) =>
        r.to === patternElementFormData[index].iri ||
        r.from === patternElementFormData[index].iri
    );
    setPatternRelationshipFormData((prevState) => {
      return [
        ...prevState,
        ...relationships.map((r) => ({
          name: r.name,
          from: r.from,
          to: r.to,
          sourceCardinality: r.sourceCardinality,
          targetCardinality: r.targetCardinality,
          scheme: r.scheme,
        })),
      ];
    });
  };

  const checkExists: (scheme: string, name: string) => boolean = (
    scheme: string,
    name: string
  ) => {
    const newIRI = createNewElemIRI(scheme, name);
    return (
      Object.keys(WorkspaceTerms)
        .filter((iri) => WorkspaceTerms[iri].inScheme === scheme)
        .find(
          (iri) =>
            (iri === newIRI &&
              Object.keys(WorkspaceElements).find(
                (elem) => WorkspaceElements[elem].active && elem === iri
              )) ||
            Object.values(WorkspaceTerms[iri].labels).find(
              (label) =>
                label.trim().toLowerCase() === name.trim().toLowerCase()
            )
        ) !== undefined
    );
  };

  const checkNames = (
    scheme: string,
    names: string,
    relationship: boolean,
    index: number
  ) => {
    let num = "";
    switch (index) {
      case 1:
        num = "st";
        break;
      case 2:
        num = "nd";
        break;
      case 3:
        num = "rd";
        break;
      default:
        num = "th";
        break;
    }
    let errorText = "";
    if (names === "") {
      errorText = `The name of the ${index}${num} ${
        relationship ? "relationship" : "term"
      } on the list has to be filled out.`;
    } else if (Object.values(names).find((name) => checkExists(scheme, name))) {
      errorText = `The name of the ${index}${num} ${
        relationship ? "relationship" : "term"
      } on the list is already taken.`;
    } else if (names && (names.length < 2 || names.length > 150)) {
      errorText = `The name of the ${index}${num} ${
        relationship ? "relationship" : "term"
      } on the list must have between 2 and 150 characters.`;
    } else if (
      createNewElemIRI(scheme, names) ===
      WorkspaceVocabularies[getVocabularyFromScheme(scheme)].namespace
    ) {
      errorText = `The name of the ${index}${num} ${
        relationship ? "relationship" : "term"
      } on the list has to have non-special characters.`;
    }
    relationship
      ? setErrorRelationships(errorText)
      : setErrorElements(errorText);
  };

  return (
    <Container>
      <Row>
        <Col>
          <Button onClick={() => setOpenFilter(!openFilter)}>
            Toggle filter
          </Button>
          <Button onClick={() => suggestPatterns()}>Suggest patterns</Button>
          <Table size={"sm"} bordered striped>
            {searchResults.map((r) => (
              <tr>
                <td>
                  <a onClick={() => selectPattern(r)}>{Patterns[r].title}</a>
                </td>
              </tr>
            ))}
          </Table>
        </Col>
        <Col>
          {detailPattern in Patterns && (
            <div>
              <h5>Internal view</h5>
              <PatternInternalView
                width={"500px"}
                height={"500px"}
                fitContent={true}
                terms={Patterns[detailPattern].terms}
                conns={Patterns[detailPattern].conns}
                parameters={[]}
              />
              <br />
              <h5>Set terms</h5>
              {errorElements && (
                <Alert variant={"danger"}>{errorElements}</Alert>
              )}
              <Table striped={true} borderless={true} size={"sm"}>
                <thead>
                  <th>Name</th>
                  <th style={{ maxWidth: "50px" }}>Create new?</th>
                  <th>Type</th>
                </thead>
                <tbody>
                  {patternElementFormData
                    .filter((term) => !term.parameter)
                    .map((term, index) => (
                      <tr>
                        <td>
                          {patternElementFormData[index].create && (
                            <span>
                              <Form.Control
                                size={"sm"}
                                value={patternElementFormData[index].name}
                                onChange={(event) => {
                                  modifyFormData(index, {
                                    ...term,
                                    name: event.currentTarget.value,
                                  });
                                  checkNames(
                                    patternElementFormData[index].scheme,
                                    event.currentTarget.value,
                                    false,
                                    index
                                  );
                                }}
                              />
                              <Form.Control
                                size={"sm"}
                                as={"select"}
                                value={patternElementFormData[index].scheme}
                                onChange={(event) => {
                                  modifyFormData(index, {
                                    ...term,
                                    scheme: event.currentTarget.value,
                                  });
                                }}
                              >
                                {Object.keys(WorkspaceVocabularies)
                                  .filter(
                                    (scheme) =>
                                      !scheme.startsWith(
                                        AppSettings.ontographerContext
                                      )
                                  )
                                  .map((scheme) => (
                                    <option
                                      style={{
                                        backgroundColor:
                                          WorkspaceVocabularies[scheme].color,
                                      }}
                                      value={scheme}
                                      key={scheme}
                                    >
                                      {
                                        WorkspaceVocabularies[scheme].labels[
                                          AppSettings.canvasLanguage
                                        ]
                                      }
                                    </option>
                                  ))}
                              </Form.Control>
                            </span>
                          )}
                          {!patternElementFormData[index].create && (
                            <Select
                              options={Object.keys(WorkspaceTerms)
                                .filter((t) =>
                                  patternElementFormData[index].types.every(
                                    (type) =>
                                      WorkspaceTerms[t].types.includes(type)
                                  )
                                )
                                .map((t) => ({
                                  label: getLabelOrBlank(
                                    WorkspaceTerms[t].labels,
                                    AppSettings.canvasLanguage
                                  ),
                                  value: t,
                                }))}
                              value={patternElementFormData[index].value}
                              onChange={(value) =>
                                modifyFormData(index, {
                                  ...term,
                                  iri: value!.value,
                                })
                              }
                            />
                          )}
                        </td>
                        <td>
                          <Form.Check
                            checked={patternElementFormData[index].create}
                            onChange={(event) =>
                              modifyFormData(index, {
                                ...term,
                                create: event.currentTarget.checked,
                              })
                            }
                          />
                        </td>
                        <td>
                          {patternElementFormData[index].optional && (
                            <Badge variant={"info"}>Optional</Badge>
                          )}
                          {patternElementFormData[index].multiple && (
                            <Badge variant={"secondary"}>Clonable</Badge>
                          )}
                          {patternElementFormData[index].multiple && (
                            <Button
                              size={"sm"}
                              onClick={() =>
                                addMultipleTermAndRelationships(index)
                              }
                              variant={"secondary"}
                            >
                              Clone
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
              <h5>Set relationships</h5>
              {errorRelationships && (
                <Alert variant={"danger"}>{errorRelationships}</Alert>
              )}
              <Table size={"sm"} striped borderless>
                <thead>
                  <th>Name</th>
                  <th colSpan={5}>Detail</th>
                </thead>
                {patternRelationshipFormData.map((data, index) => (
                  <tr>
                    <td>
                      <span>
                        <Form.Control
                          type={"text"}
                          onChange={(event) =>
                            modifyRelationshipData(index, {
                              ...data,
                              name: event.currentTarget.value,
                            })
                          }
                        />
                        <Form.Control
                          size={"sm"}
                          as={"select"}
                          value={patternRelationshipFormData[index].scheme}
                          onChange={(event) => {
                            modifyRelationshipData(index, {
                              ...data,
                              scheme: event.currentTarget.value,
                            });
                          }}
                        >
                          {Object.keys(WorkspaceVocabularies)
                            .filter(
                              (scheme) =>
                                !scheme.startsWith(
                                  AppSettings.ontographerContext
                                )
                            )
                            .map((scheme) => (
                              <option
                                style={{
                                  backgroundColor:
                                    WorkspaceVocabularies[scheme].color,
                                }}
                                value={scheme}
                                key={scheme}
                              >
                                {
                                  WorkspaceVocabularies[scheme].labels[
                                    AppSettings.canvasLanguage
                                  ]
                                }
                              </option>
                            ))}
                        </Form.Control>
                      </span>
                    </td>
                    <td>
                      {data.from in WorkspaceTerms
                        ? getLabelOrBlank(
                            WorkspaceTerms[data.from].labels,
                            AppSettings.canvasLanguage
                          )
                        : data.from}{" "}
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
                    <td>
                      {data.to in WorkspaceTerms
                        ? getLabelOrBlank(
                            WorkspaceTerms[data.to].labels,
                            AppSettings.canvasLanguage
                          )
                        : data.to}
                    </td>
                  </tr>
                ))}
                {patternElementFormData
                  .filter((term) => !term.parameter)
                  .map((term, index) => (
                    <tr>
                      <td>
                        <Form.Switch
                          checked={term.create}
                          onChange={(event) =>
                            modifyFormData(index, {
                              ...term,
                              create: event.currentTarget.checked,
                            })
                          }
                        />
                      </td>
                      <td>
                        {term.create ? (
                          <Form.Control
                            value={patternElementFormData[index].name}
                            onChange={(event) =>
                              modifyFormData(index, {
                                ...term,
                                name: event.currentTarget.value,
                              })
                            }
                          />
                        ) : (
                          <Select
                            isSearchable={true}
                            value={patternElementFormData[index].value}
                            options={Object.keys(WorkspaceTerms)
                              .filter(
                                (t) =>
                                  _.intersection(
                                    WorkspaceTerms[t].types,
                                    patternElementFormData[index].types
                                  ).length ===
                                  patternElementFormData[index].types.length
                              )
                              .map((t) => ({
                                label: getLabelOrBlank(
                                  WorkspaceTerms[t].labels,
                                  AppSettings.canvasLanguage
                                ),
                                value: t,
                              }))}
                          />
                        )}
                      </td>
                      <td>
                        {patternElementFormData[index].types
                          .filter((type) => type in Stereotypes)
                          .map((stereotype) => (
                            <Badge variant={"info"}>
                              {getName(stereotype, AppSettings.canvasLanguage)}
                            </Badge>
                          ))}
                      </td>
                    </tr>
                  ))}
              </Table>
            </div>
          )}
          <Button onClick={() => createInstance()}>Apply pattern</Button>
        </Col>
      </Row>
    </Container>
  );
};
