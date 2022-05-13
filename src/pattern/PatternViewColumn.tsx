import React, { useEffect, useState } from "react";
import { Patterns } from "./PatternTypes";
import * as _ from "lodash";
import {
  AppSettings,
  CardinalityPool,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { createNewElemIRI } from "../function/FunctionCreateVars";
import { Badge, Button, Form, Table } from "react-bootstrap";
import PatternInternalView from "./PatternInternalView";
import Select from "react-select";
import {
  getActiveToConnections,
  getLabelOrBlank,
} from "../function/FunctionGetVars";
import { getName } from "../function/FunctionEditVars";
import { LinkType } from "../config/Enum";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";

export type formElementData = {
  name: string;
  iri: string;
  types: string[];
  parameter?: boolean;
  create: boolean;
  value: { label: string; value: string };
  optional?: boolean;
  use?: boolean;
  scheme: string;
  multiple?: boolean;
};
export type formRelationshipData = {
  name: string;
  from: string;
  to: string;
  iri: string;
  sourceCardinality: string;
  targetCardinality: string;
  scheme: string;
  linkType: LinkType;
  create: boolean;
  id?: string;
};
type Props = {
  configuration?: PatternCreationConfiguration;
  pattern: string;
  initSubmit: boolean;
  submit: (
    pattern: string,
    elements: { [key: string]: formElementData },
    connections: { [key: string]: formRelationshipData }
  ) => void;
};

export const PatternViewColumn: React.FC<Props> = (props: Props) => {
  const [detailPattern, setDetailPattern] = useState<string>("");
  const [patternElementFormData, setPatternElementFormData] = useState<{
    [key: string]: formElementData;
  }>({});
  const [patternRelationshipFormData, setPatternRelationshipFormData] =
    useState<{ [key: string]: formRelationshipData }>({});

  const modifyFormData = (index: string, data: formElementData) => {
    const copy = _.clone(patternElementFormData);
    copy[index] = data;
    setPatternElementFormData(copy);
  };

  useEffect(() => {
    if (props.initSubmit)
      props.submit(
        detailPattern,
        patternElementFormData,
        patternRelationshipFormData
      );
  }, [props.initSubmit]);

  useEffect(() => {
    if (props.pattern) {
      selectPattern(props.pattern);
    }
  }, [props.pattern]);

  const selectPattern = (pattern: string) => {
    const elementFormData: { [key: string]: formElementData } = {};
    const internalConns = getAvailableConnsFromSelection();
    for (const term in Patterns[pattern].terms) {
      elementFormData[term] = {
        ...Patterns[pattern].terms[term],
        iri: term,
        create: true,
        value: { value: "", label: "" },
        scheme: Object.keys(WorkspaceVocabularies).find(
          (vocab) => !WorkspaceVocabularies[vocab].readOnly
        )!,
        use: true,
      };
    }
    setPatternElementFormData(elementFormData);
    const relationshipFormData: { [key: string]: formRelationshipData } = {};
    for (const conn in Patterns[pattern].conns) {
      relationshipFormData[conn] = {
        ...Patterns[pattern].conns[conn],
        create: !internalConns?.find(
          (conn) =>
            WorkspaceLinks[conn].source ===
              Patterns[pattern].conns[conn].from &&
            WorkspaceLinks[conn].target === Patterns[pattern].conns[conn].to
        ),
        scheme: Object.keys(WorkspaceVocabularies).find(
          (vocab) => !WorkspaceVocabularies[vocab].readOnly
        )!,
        iri: conn,
        id: internalConns?.find(
          (conn) =>
            WorkspaceLinks[conn].source ===
              Patterns[pattern].conns[conn].from &&
            WorkspaceLinks[conn].target === Patterns[pattern].conns[conn].to
        ),
      };
    }
    setPatternRelationshipFormData(relationshipFormData);
    setDetailPattern(pattern);
    console.log(
      relationshipFormData,
      elementFormData,
      getAvailableConnsFromSelection()
    );
  };

  const modifyRelationshipData: (
    index: string,
    data: formRelationshipData
  ) => void = (index, data) => {
    const copy = _.clone(patternRelationshipFormData);
    copy[index] = data;
    console.log(copy);
    setPatternRelationshipFormData(copy);
  };

  const addMultipleTermAndRelationships = (index: string) => {
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
        create: patternRelationshipFormData[r].create,
        iri: patternRelationshipFormData[r].iri,
      };
    }
    setPatternRelationshipFormData((prevState) => ({
      ...prevState,
      ...relObject,
    }));
  };

  const getAvailableConnsFromSelection = () => {
    return props.configuration?.elements
      .flatMap((e) => getActiveToConnections(e))
      .filter((link) =>
        props.configuration?.elements.includes(WorkspaceLinks[link].target)
      );
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

  return (
    <div>
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
                .filter(([_, term]) => !term.parameter && term.use)
                .map(([t, term]) => (
                  <tr>
                    <td>
                      {patternElementFormData[t].create && (
                        <div>
                          <Form.Control
                            size={"sm"}
                            value={patternElementFormData[t].name}
                            onChange={(event) => {
                              const curr = createNewElemIRI(
                                WorkspaceVocabularies[
                                  patternElementFormData[t].scheme
                                ].glossary,
                                event.currentTarget.value
                              );
                              modifyFormData(t, {
                                ...term,
                                name: event.currentTarget.value,
                                iri: curr,
                              });
                            }}
                          />
                          <Form.Control
                            size={"sm"}
                            as={"select"}
                            value={patternElementFormData[t].scheme}
                            onChange={(event) => {
                              const curr = createNewElemIRI(
                                WorkspaceVocabularies[
                                  patternElementFormData[t].scheme
                                ].glossary,
                                patternElementFormData[t].name
                              );
                              modifyFormData(t, {
                                ...term,
                                scheme: event.currentTarget.value,
                                iri: curr,
                              });
                            }}
                          >
                            {Object.keys(WorkspaceVocabularies)
                              .filter(
                                (vocab) =>
                                  !WorkspaceVocabularies[vocab].readOnly
                              )
                              .map((vocab) => (
                                <option
                                  style={{
                                    backgroundColor:
                                      WorkspaceVocabularies[vocab].color,
                                  }}
                                  value={vocab}
                                  key={vocab}
                                >
                                  {
                                    WorkspaceVocabularies[vocab].labels[
                                      AppSettings.canvasLanguage
                                    ]
                                  }
                                </option>
                              ))}
                          </Form.Control>
                          {!patternElementFormData[t].name && (
                            <p className={"red"}>Please input a name.</p>
                          )}
                          {checkExists(
                            WorkspaceVocabularies[
                              patternElementFormData[t].scheme
                            ].glossary,
                            patternElementFormData[t].name
                          ) && (
                            <p className={"red"}>
                              This name is already taken for this vocabulary.
                            </p>
                          )}
                        </div>
                      )}
                      {!patternElementFormData[t].create && (
                        <Select
                          options={Object.keys(WorkspaceTerms)
                            .filter((t) =>
                              patternElementFormData[t].types.every((type) =>
                                WorkspaceTerms[t].types.includes(type)
                              )
                            )
                            .map((t) => ({
                              label: `${
                                props.configuration &&
                                props.configuration.elements.includes(t)
                                  ? "🏷 "
                                  : ""
                              }${getLabelOrBlank(
                                WorkspaceTerms[t].labels,
                                AppSettings.canvasLanguage
                              )}`,
                              value: t,
                            }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
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
                            {getName(stereotype, AppSettings.canvasLanguage)}
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
              {Object.entries(patternRelationshipFormData).map(([d, data]) => (
                <tr>
                  {patternRelationshipFormData[d].linkType ===
                    LinkType.DEFAULT && (
                    <td>
                      {patternRelationshipFormData[d].id && (
                        <Button
                          onClick={() =>
                            modifyRelationshipData(d, {
                              ...data,
                              create: !data.create,
                            })
                          }
                          className={"buttonlink"}
                        >
                          {patternRelationshipFormData[d].create ? "🏷" : "✏"}
                        </Button>
                      )}
                      {!patternRelationshipFormData[d].create &&
                        patternRelationshipFormData[d].id && (
                          <Form.Control
                            type={"text"}
                            size={"sm"}
                            disabled={true}
                            value={patternRelationshipFormData[d].name}
                          />
                        )}
                      {patternRelationshipFormData[d].create &&
                        patternRelationshipFormData[d].linkType ===
                          LinkType.DEFAULT && (
                          <div>
                            <Form.Control
                              type={"text"}
                              size={"sm"}
                              onChange={(event) =>
                                modifyRelationshipData(d, {
                                  ...data,
                                  name: event.currentTarget.value,
                                  iri: createNewElemIRI(
                                    WorkspaceVocabularies[
                                      patternRelationshipFormData[d].scheme
                                    ].glossary,
                                    patternRelationshipFormData[d].name
                                  ),
                                })
                              }
                              value={patternRelationshipFormData[d].name}
                            />
                            <Form.Control
                              size={"sm"}
                              as={"select"}
                              value={patternRelationshipFormData[d].scheme}
                              onChange={(event) => {
                                modifyRelationshipData(d, {
                                  ...data,
                                  scheme: event.currentTarget.value,
                                  iri: createNewElemIRI(
                                    WorkspaceVocabularies[
                                      patternRelationshipFormData[d].scheme
                                    ].glossary,
                                    patternRelationshipFormData[d].name
                                  ),
                                });
                              }}
                            >
                              {Object.keys(WorkspaceVocabularies)
                                .filter(
                                  (scheme) =>
                                    !WorkspaceVocabularies[scheme].readOnly
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
                            {!patternRelationshipFormData[d].name && (
                              <p className={"red"}>Please input a name.</p>
                            )}
                            {checkExists(
                              WorkspaceVocabularies[
                                patternRelationshipFormData[d].scheme
                              ].glossary,
                              patternRelationshipFormData[d].name
                            ) && (
                              <p className={"red"}>
                                This name is already taken for this vocabulary.
                              </p>
                            )}
                          </div>
                        )}
                      {!patternRelationshipFormData[d].create &&
                        !patternRelationshipFormData[d].id && (
                          <Form.Control
                            type={"text"}
                            size={"sm"}
                            disabled={true}
                            value={patternRelationshipFormData[d].name}
                          />
                        )}
                    </td>
                  )}
                  <td style={{ wordBreak: "keep-all" }}>
                    {patternElementFormData[data.from].name}
                  </td>
                  <td>
                    <Badge variant={"secondary"}>
                      {CardinalityPool[
                        parseInt(data.sourceCardinality, 10)
                      ].getString()}
                    </Badge>
                  </td>
                  <td className={"link"}>
                    <svg width="100%" height="25px" preserveAspectRatio="none">
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
                    {patternElementFormData[data.to].name}
                  </td>
                </tr>
              ))}
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
                            value={patternElementFormData[t].scheme}
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
                                  !WorkspaceVocabularies[vocab].readOnly
                              )
                              .map((vocab) => (
                                <option
                                  style={{
                                    backgroundColor:
                                      WorkspaceVocabularies[vocab].color,
                                  }}
                                  value={vocab}
                                  key={vocab}
                                >
                                  {
                                    WorkspaceVocabularies[vocab].labels[
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
                              patternElementFormData[t].types.every((type) =>
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
                            {getName(stereotype, AppSettings.canvasLanguage)}
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
                          onClick={() => addMultipleTermAndRelationships(t)}
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
      {!(detailPattern in Patterns) && <h3>No pattern selected</h3>}
    </div>
  );
};
