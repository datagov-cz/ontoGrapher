import React, { useEffect, useState } from "react";
import {
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
  WorkspaceTerms,
} from "../config/Variables";
import { getName } from "../function/FunctionEditVars";
import * as _ from "lodash";
import { callSuggestionAlgorithm } from "./PatternQueries";
import { v4 as uuidv4 } from "uuid";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import Select from "react-select";
import { getLabelOrBlank } from "../function/FunctionGetVars";

type Props = { configuration: PatternCreationConfiguration };
type formElementData = {
  name: string;
  iri: string;
  types: string[];
  parameter: boolean;
  create: boolean;
  value: { label: string; value: string };
  qualities: string[];
};

type formRelationshipData = {
  name: string;
  from: string;
  to: string;
  sourceCardinality: string;
  targetCardinality: string;
};

export const PatternCreationModalExisting: React.FC<Props> = (props: Props) => {
  const [searchResults, setSearchResults] = useState<string[]>(
    Object.keys(Patterns)
  );
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
        })),
    ]);
    setPatternRelationshipFormData(
      Patterns[pattern].conns.map((c) => ({
        name: c.name,
        from: c.from,
        to: c.to,
        sourceCardinality: c.sourceCardinality,
        targetCardinality: c.targetCardinality,
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
              {/*<PatternInternalView*/}
              {/*  width={"500px"}*/}
              {/*  height={"500px"}*/}
              {/*  fitContent={true}*/}
              {/*  terms={Patterns[detailPattern].terms}*/}
              {/*  conns={Patterns[detailPattern].conns}*/}
              {/*  parameters={[]}*/}
              {/*/>*/}
              <br />
              <h5>Set terms</h5>
              <Table striped={true} borderless={true} size={"sm"}>
                <thead>
                  <th style={{ maxWidth: "50px" }}>Create new?</th>
                  <th>Name</th>
                  <th>Type</th>
                </thead>
                <tbody>
                  {patternElementFormData
                    .filter((term) => !term.parameter)
                    .map((term, index) => (
                      <tr>
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
                          {patternElementFormData[index].create && (
                            <Form.Control
                              size={"sm"}
                              value={patternElementFormData[index].name}
                              onChange={(event) =>
                                modifyFormData(index, {
                                  ...term,
                                  name: event.currentTarget.value,
                                })
                              }
                            />
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
                          {patternElementFormData[index].types
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
                  <th>Name</th>
                  <th colSpan={5}>Detail</th>
                </thead>
                {patternRelationshipFormData.map((data, index) => (
                  <tr>
                    <td>
                      <Form.Control
                        type={"text"}
                        onChange={(event) =>
                          modifyRelationshipData(index, {
                            ...data,
                            name: event.currentTarget.value,
                          })
                        }
                      />
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
