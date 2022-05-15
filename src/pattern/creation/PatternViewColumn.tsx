import React, { useEffect, useState } from "react";
import {
  AppSettings,
  CardinalityPool,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import {
  getActiveToConnections,
  getLabelOrBlank,
} from "../../function/FunctionGetVars";
import { Badge, Button, Form, Table } from "react-bootstrap";
import { getName } from "../../function/FunctionEditVars";
import EditingPatternInternalView from "../structures/EditingPatternInternalView";
import { createNewElemIRI } from "../../function/FunctionCreateVars";
import { PatternCreationConfiguration } from "../../components/modals/CreationModals";
import { LinkType } from "../../config/Enum";
import { Patterns } from "../function/PatternTypes";
import Select from "react-select";
import * as _ from "lodash";

export type formElementData = {
  name: string;
  iri: string;
  types: string[];
  parameter?: boolean;
  create: boolean;
  value: { label: string; value: string };
  optional?: boolean;
  scheme: string;
  multiple?: boolean;
  multipleSource?: string;
  use?: boolean;
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
  multipleSource?: string;
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
        iri: props.configuration
          ? term
          : createNewElemIRI(
              WorkspaceVocabularies[
                Object.keys(WorkspaceVocabularies).find(
                  (vocab) => !WorkspaceVocabularies[vocab].readOnly
                )!
              ].glossary,
              Patterns[pattern].terms[term].name
            ),
        create: props.configuration ? !(term in WorkspaceTerms) : true,
        types: props.configuration
          ? !(term in WorkspaceTerms)
            ? Patterns[pattern].terms[term].types
            : WorkspaceTerms[term].types
          : Patterns[pattern].terms[term].types,
        value:
          term in WorkspaceTerms && props.configuration
            ? {
                value: term,
                label: `🏷 ${getLabelOrBlank(
                  WorkspaceTerms[term].labels,
                  AppSettings.canvasLanguage
                )}`,
              }
            : { value: "", label: "" },
        scheme: Object.keys(WorkspaceVocabularies).find(
          (vocab) => !WorkspaceVocabularies[vocab].readOnly
        )!,
        optional: Patterns[pattern].terms[term].optional
          ? Patterns[pattern].terms[term].optional
          : undefined,
        use: true,
      };
    }
    setPatternElementFormData(elementFormData);
    const relationshipFormData: { [key: string]: formRelationshipData } = {};
    for (const conn in Patterns[pattern].conns) {
      const existingConn = internalConns.find(
        (conn) =>
          WorkspaceLinks[conn].source === Patterns[pattern].conns[conn].from &&
          WorkspaceLinks[conn].target === Patterns[pattern].conns[conn].to
      );
      relationshipFormData[conn] = {
        ...Patterns[pattern].conns[conn],
        create: !existingConn,
        scheme: Object.keys(WorkspaceVocabularies).find(
          (vocab) => !WorkspaceVocabularies[vocab].readOnly
        )!,
        iri: createNewElemIRI(
          WorkspaceVocabularies[
            Object.keys(WorkspaceVocabularies).find(
              (vocab) => !WorkspaceVocabularies[vocab].readOnly
            )!
          ].glossary,
          Patterns[pattern].conns[conn].name
        ),
        id: existingConn,
      };
    }
    setPatternRelationshipFormData(relationshipFormData);
    setDetailPattern(pattern);
    console.log(elementFormData, relationshipFormData);
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
    let newIDparam = index;
    while (newIDparam in patternElementFormData) {
      newIDparam += "+";
    }
    setPatternElementFormData((prevState) => ({
      ...prevState,
      ...{
        [newIDparam]: { ...prevState[index], multipleSource: index, use: true },
      },
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
        id: patternRelationshipFormData[r].id,
        multipleSource: r,
      };
    }
    setPatternRelationshipFormData((prevState) => ({
      ...prevState,
      ...relObject,
    }));
  };

  const getAvailableConnsFromSelection = () => {
    return props.configuration
      ? props.configuration.elements
          .flatMap((e) => getActiveToConnections(e))
          .filter((link) =>
            props.configuration?.elements.includes(WorkspaceLinks[link].target)
          )
      : [];
  };

  const getTermsForView = () => {
    const t: {
      [key: string]: {
        name: string;
        types: string[];
        parameter?: boolean;
        optional?: boolean;
        multiple?: boolean;
      };
    } = {};
    for (const term in patternElementFormData) {
      if (!patternElementFormData[term].use) continue;
      t[term] = {
        ...patternElementFormData[term],
        name: patternElementFormData[term].create
          ? patternElementFormData[term].name
          : getLabelOrBlank(
              WorkspaceTerms[patternElementFormData[term].iri].labels,
              AppSettings.canvasLanguage
            ),
      };
    }
    return t;
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
          <EditingPatternInternalView
            width={"500px"}
            height={"500px"}
            fitContent={true}
            terms={getTermsForView()}
            conns={patternRelationshipFormData}
          />
          <br />
          <h5>Set parameters</h5>
          <Table size="sm" borderless striped>
            <thead>
              <tr>
                <th colSpan={2}>Parameter</th>
                <th>Create new?</th>
                <th>Type</th>
                <th style={{ minWidth: "80px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(patternElementFormData)
                .filter(([_, term]) => term.parameter && term.use)
                .map(([t, term]) => (
                  <tr>
                    <td>
                      {
                        Patterns[props.pattern].terms[
                          term.multipleSource ? term.multipleSource : t
                        ].name
                      }
                    </td>
                    <td style={{ minWidth: "200px" }}>
                      {patternElementFormData[t].create && (
                        <span>
                          <Form.Control
                            size={"sm"}
                            value={patternElementFormData[t].name}
                            onChange={(event) => {
                              modifyFormData(t, {
                                ...term,
                                name: event.currentTarget.value,
                                iri: createNewElemIRI(
                                  WorkspaceVocabularies[
                                    patternElementFormData[t].scheme
                                  ].glossary,
                                  event.currentTarget.value
                                ),
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
                                iri: createNewElemIRI(
                                  WorkspaceVocabularies[
                                    event.currentTarget.value
                                  ].glossary,
                                  patternElementFormData[t].name
                                ),
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
                            .filter((term) =>
                              patternElementFormData[t].types.every((type) =>
                                WorkspaceTerms[term].types.includes(type)
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
                              name: value!.label,
                              value: {
                                value: value!.value,
                                label: value!.label,
                              },
                            })
                          }
                        />
                      )}
                      {!patternElementFormData[t].create &&
                        !patternElementFormData[t].iri && (
                          <p className={"red"}>Please input a term.</p>
                        )}
                      {!patternElementFormData[t].create &&
                        Object.keys(patternElementFormData).find(
                          (elem) =>
                            patternElementFormData[elem].iri === term.iri &&
                            t !== elem
                        ) && (
                          <p className={"red"}>
                            This term is already taken by another parameter.
                          </p>
                        )}
                      {!patternElementFormData[t].name && (
                        <p className={"red"}>Please input a name.</p>
                      )}
                      {patternElementFormData[t].create &&
                        checkExists(
                          WorkspaceVocabularies[
                            patternElementFormData[t].scheme
                          ].glossary,
                          patternElementFormData[t].name
                        ) && (
                          <p className={"red"}>
                            This name is already taken for this vocabulary.
                          </p>
                        )}
                    </td>
                    <td>
                      <Form.Check
                        checked={patternElementFormData[t].create}
                        onChange={(event) =>
                          modifyFormData(t, {
                            ...term,
                            create: event.currentTarget.checked,
                            value: {
                              value: Object.keys(WorkspaceTerms).filter(
                                (term) =>
                                  patternElementFormData[t].types.every(
                                    (type) =>
                                      WorkspaceTerms[term].types.includes(type)
                                  )
                              )[0],
                              label:
                                WorkspaceTerms[
                                  Object.keys(WorkspaceTerms).filter((term) =>
                                    patternElementFormData[t].types.every(
                                      (type) =>
                                        WorkspaceTerms[term].types.includes(
                                          type
                                        )
                                    )
                                  )[0]
                                ].labels[AppSettings.canvasLanguage],
                            },
                            iri: event.currentTarget.checked
                              ? createNewElemIRI(
                                  WorkspaceVocabularies[
                                    Object.keys(WorkspaceVocabularies).find(
                                      (vocab) =>
                                        !WorkspaceVocabularies[vocab].readOnly
                                    )!
                                  ].glossary,
                                  Patterns[detailPattern].terms[
                                    term.multipleSource
                                      ? term.multipleSource
                                      : t
                                  ].name
                                )
                              : Object.keys(WorkspaceTerms).filter((term) =>
                                  patternElementFormData[t].types.every(
                                    (type) =>
                                      WorkspaceTerms[term].types.includes(type)
                                  )
                                )[0],
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
                      {typeof patternElementFormData[
                        term.multipleSource ? term.multipleSource : t
                      ].optional !== "undefined" && (
                        <Button
                          size={"sm"}
                          disabled={!!term.multipleSource}
                          onClick={() =>
                            modifyFormData(t, {
                              ...term,
                              optional: !patternElementFormData[t].optional,
                            })
                          }
                          variant={"info"}
                        >
                          {`Optional - ${
                            patternElementFormData[t].optional
                              ? "Exclude"
                              : "Include"
                          }`}
                        </Button>
                      )}
                      {!patternElementFormData[t].multipleSource &&
                        patternElementFormData[
                          term.multipleSource ? term.multipleSource : t
                        ].multiple && (
                          <Button
                            size={"sm"}
                            disabled={!!term.multipleSource}
                            onClick={() => addMultipleTermAndRelationships(t)}
                            variant={"secondary"}
                          >
                            Cloneable - Clone
                          </Button>
                        )}
                      {!!patternElementFormData[t].multipleSource && (
                        <Button
                          size={"sm"}
                          onClick={() =>
                            modifyFormData(t, { ...term, use: false })
                          }
                          variant={"danger"}
                        >
                          Clone - Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
          <h5>Set relationships</h5>
          <Table size={"sm"} striped borderless>
            <thead>
              <tr>
                <th colSpan={2}>Relationship</th>
                <th colSpan={5}>Relationship detail</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(patternRelationshipFormData).map(([d, data]) => (
                <tr>
                  <td style={{ minWidth: "100px" }}>
                    {
                      Patterns[detailPattern].conns[
                        data.multipleSource ? data.multipleSource : d
                      ].name
                    }
                  </td>
                  {patternRelationshipFormData[d].linkType ===
                    LinkType.DEFAULT && (
                    <td style={{ display: "inline-flex" }}>
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
                          {patternRelationshipFormData[d].create ? "✏ " : "🏷 "}
                        </Button>
                      )}
                      &nbsp;
                      {!patternRelationshipFormData[d].create &&
                        patternRelationshipFormData[d].id && (
                          <Form.Control
                            type={"text"}
                            size={"sm"}
                            disabled={true}
                            value={patternRelationshipFormData[d].name}
                          />
                        )}
                      {Object.keys(patternRelationshipFormData).find(
                        (rel) =>
                          patternRelationshipFormData[rel].name === data.name &&
                          rel !== d
                      ) && (
                        <p className={"red"}>
                          This relationship name is already taken by another
                          parameter.
                        </p>
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
                                    event.currentTarget.value
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
                                      event.currentTarget.value
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
                  {patternRelationshipFormData[d].linkType ===
                    LinkType.GENERALIZATION && <td>Generalization</td>}
                  <td style={{ wordBreak: "keep-all" }}>
                    {patternElementFormData[data.from].create
                      ? patternElementFormData[data.from].name
                      : getLabelOrBlank(
                          WorkspaceTerms[patternElementFormData[data.from].iri]
                            .labels,
                          AppSettings.canvasLanguage
                        )}
                  </td>
                  <td>
                    {patternRelationshipFormData[d].linkType ===
                      LinkType.DEFAULT && (
                      <Badge variant={"secondary"}>
                        {CardinalityPool[
                          parseInt(data.sourceCardinality, 10)
                        ].getString()}
                      </Badge>
                    )}
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
                    {patternRelationshipFormData[d].linkType ===
                      LinkType.DEFAULT && (
                      <Badge variant={"secondary"}>
                        {CardinalityPool[
                          parseInt(data.targetCardinality, 10)
                        ].getString()}
                      </Badge>
                    )}
                  </td>
                  <td style={{ wordBreak: "keep-all" }}>
                    {patternElementFormData[data.to].create
                      ? patternElementFormData[data.to].name
                      : getLabelOrBlank(
                          WorkspaceTerms[patternElementFormData[data.to].iri]
                            .labels,
                          AppSettings.canvasLanguage
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
