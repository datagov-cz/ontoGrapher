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
import { Patterns } from "./PatternTypes";
import {
  AppSettings,
  CardinalityPool,
  Stereotypes,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import {
  getName,
  initLanguageObject,
  parsePrefix,
} from "../function/FunctionEditVars";
import * as _ from "lodash";
import { callSuggestionAlgorithm } from "./PatternQueries";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import Select from "react-select";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";
import PatternInternalView from "./PatternInternalView";
import { createNewElemIRI } from "../function/FunctionCreateVars";
import { paper } from "../main/DiagramCanvas";
import { createNewConcept } from "../function/FunctionElem";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../queries/update/UpdateElementQueries";
import { saveNewLink } from "../function/FunctionLink";
import { Representation } from "../config/Enum";

type Props = {
  configuration: PatternCreationConfiguration;
  setSubmit: (val: boolean) => void;
  pattern: string;
};
type formElementData = {
  name: string;
  iri: string;
  types: string[];
  parameter: boolean;
  create: boolean;
  value: { label: string; value: string };
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
  const [filterName, setFilterName] = useState<string>("");
  const [filterAuthor, setFilterAuthor] = useState<string>("");
  const [filterSuggest, setFilterSuggest] = useState<boolean>(false);
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

  const suggestPatterns: () => Promise<string[]> = async () => {
    return await callSuggestionAlgorithm(AppSettings.selectedElements);
  };

  useEffect(() => {
    if (props.pattern) {
      selectPattern(props.pattern);
    }
  }, [props.pattern]);

  const createInstance = () => {
    const queries: string[] = [];
    const matrixLength = Math.max(
      patternElementFormData.length + patternRelationshipFormData.length
    );
    const matrixDimension = Math.ceil(Math.sqrt(matrixLength));
    const startingCoords = paper.clientToLocalPoint({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    patternElementFormData.forEach((t, i) => {
      const x = i % matrixDimension;
      const y = Math.floor(i / matrixDimension);
      const id = createNewConcept(
        { x: startingCoords.x + x * 200, y: startingCoords.y + y * 200 },
        initLanguageObject(t.name),
        AppSettings.canvasLanguage,
        getVocabularyFromScheme(t.scheme),
        t.types
      );
      queries.push(id);
    });
    patternRelationshipFormData.forEach((c, i) => {
      const x = (i + patternElementFormData.length) % matrixDimension;
      const y = Math.floor(
        (i + patternElementFormData.length) / matrixDimension
      );
      const id = createNewConcept(
        { x: startingCoords.x + x * 200, y: startingCoords.y + y * 200 },
        initLanguageObject(c.name),
        AppSettings.canvasLanguage,
        getVocabularyFromScheme(c.scheme),
        [parsePrefix("z-sgov-pojem", "typ-vztahu")]
      );
      queries.push(
        updateProjectElement(true, id),
        updateProjectElementDiagram(AppSettings.selectedDiagram, id),
        ...saveNewLink(id, c.from, c.to, Representation.COMPACT)
      );
    });
    return queries;
  };

  const selectPattern = (pattern: string) => {
    setDetailPattern(pattern);
    setPatternElementFormData(
      Object.keys(Patterns[pattern].terms)
        .filter((t) => Patterns[pattern].terms[t].parameter)
        .map((t) => ({
          name: Patterns[pattern].terms[t].name,
          iri: "",
          types: Patterns[pattern].terms[t].types,
          parameter: true,
          create: true,
          value: { value: "", label: "" },
          qualities: [],
          scheme: "",
        }))
    );
    setPatternElementFormData((prevState) => [
      ...prevState,
      ...Object.keys(Patterns[pattern].terms)
        .filter((t) => !Patterns[pattern].terms[t].parameter)
        .map((t) => ({
          name: Patterns[pattern].terms[t].name,
          iri: "",
          types: Patterns[pattern].terms[t].types,
          parameter: false,
          create: true,
          value: { value: "", label: "" },
          qualities: [],
          scheme: "",
        })),
    ]);
    setPatternRelationshipFormData(
      Object.keys(Patterns[pattern].conns).map((c) => ({
        name: Patterns[pattern].conns[c].name,
        from: Patterns[pattern].conns[c].from,
        to: Patterns[pattern].conns[c].to,
        sourceCardinality: Patterns[pattern].conns[c].sourceCardinality,
        targetCardinality: Patterns[pattern].conns[c].targetCardinality,
        scheme: "",
      }))
    );
  };

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
    let num: string;
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
    <Container>
      <Row>
        <Col>
          <div>
            <Button size={"sm"} onClick={() => setOpenFilter(!openFilter)}>
              Toggle filter
            </Button>
            {openFilter && (
              <div>
                <Form.Control
                  size={"sm"}
                  type={"text"}
                  placeholder={"Pattern title"}
                  value={filterName}
                  onChange={(event) => setFilterName(event.currentTarget.value)}
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
            )}
          </div>
          <Table size={"sm"} borderless striped>
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
