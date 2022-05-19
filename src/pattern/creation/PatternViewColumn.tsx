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
import { getLabelOrBlank } from "../../function/FunctionGetVars";
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
  parameter: string;
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
  parameter: string;
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
  validate: (val: boolean) => void;
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
    validateForm(copy, patternRelationshipFormData);
  };

  const validateForm = (
    elements: typeof patternElementFormData,
    conns: typeof patternRelationshipFormData
  ) => {
    let ret = true;
    for (const [t, term] of Object.entries(elements)) {
      if (!elements[t].create && !elements[t].iri) {
        ret = false;
      }
      if (
        !elements[t].create &&
        Object.keys(elements).find(
          (elem) => elements[elem].iri === term.iri && t !== elem
        )
      ) {
        ret = false;
      }
      if (!elements[t].name) {
        ret = false;
      }
      if (
        elements[t].create &&
        checkExists(
          WorkspaceVocabularies[elements[t].scheme].glossary,
          elements[t].name
        )
      ) {
        ret = false;
      }
    }
    for (const [d, data] of Object.entries(conns)) {
      if (
        data.linkType !== LinkType.GENERALIZATION &&
        Object.keys(conns).find(
          (rel) => conns[rel].name === data.name && rel !== d
        )
      ) {
        ret = false;
      }
      if (!conns[d].name) {
        ret = false;
      }
      if (
        data.linkType !== LinkType.GENERALIZATION &&
        checkExists(
          WorkspaceVocabularies[conns[d].scheme].glossary,
          conns[d].name
        )
      ) {
        ret = false;
      }
    }
    props.validate(ret);
  };

  useEffect(() => {
    if (props.initSubmit) {
      props.submit(
        detailPattern,
        patternElementFormData,
        patternRelationshipFormData
      );
      setDetailPattern("");
      setPatternElementFormData({});
      setPatternRelationshipFormData({});
    }
  }, [
    props,
    detailPattern,
    patternElementFormData,
    patternRelationshipFormData,
  ]);

  useEffect(() => {
    if (props.pattern) {
      const elementFormData: { [key: string]: formElementData } = {};
      for (const term in Patterns[props.pattern].terms) {
        const iri = createNewElemIRI(
          WorkspaceVocabularies[
            Object.keys(WorkspaceVocabularies).find(
              (vocab) => !WorkspaceVocabularies[vocab].readOnly
            )!
          ].glossary,
          Patterns[props.pattern].terms[term].name
        );
        elementFormData[term] = {
          ...Patterns[props.pattern].terms[term],
          iri:
            props.configuration && Patterns[props.pattern].terms[term].iri
              ? Patterns[props.pattern].terms[term].iri!
              : iri,
          create: props.configuration ? !(term in WorkspaceTerms) : true,
          parameter: term,
          types: props.configuration
            ? !(term in WorkspaceTerms)
              ? Patterns[props.pattern].terms[term].types
              : WorkspaceTerms[term].types
            : Patterns[props.pattern].terms[term].types,
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
          optional: Patterns[props.pattern].terms[term].optional
            ? Patterns[props.pattern].terms[term].optional
            : undefined,
          use: true,
        };
      }
      setPatternElementFormData(elementFormData);
      const relationshipFormData: { [key: string]: formRelationshipData } = {};
      for (const conn in Patterns[props.pattern].conns) {
        relationshipFormData[conn] = {
          ...Patterns[props.pattern].conns[conn],
          parameter: conn,
          create:
            !Patterns[props.pattern].conns[conn].id ||
            Patterns[props.pattern].conns[conn].linkType ===
              LinkType.GENERALIZATION,
          scheme: Object.keys(WorkspaceVocabularies).find(
            (vocab) => !WorkspaceVocabularies[vocab].readOnly
          )!,
          iri:
            Patterns[props.pattern].conns[conn].id &&
            Patterns[props.pattern].conns[conn].linkType === LinkType.DEFAULT
              ? WorkspaceLinks[Patterns[props.pattern].conns[conn].id!].iri
              : createNewElemIRI(
                  WorkspaceVocabularies[
                    Object.keys(WorkspaceVocabularies).find(
                      (vocab) => !WorkspaceVocabularies[vocab].readOnly
                    )!
                  ].glossary,
                  Patterns[props.pattern].conns[conn].name
                ),
          id: Patterns[props.pattern].conns[conn].id,
        };
      }
      setPatternRelationshipFormData(relationshipFormData);
      setDetailPattern(props.pattern);
    }
  }, [props.pattern, props.configuration]);

  const modifyRelationshipData: (
    index: string,
    data: formRelationshipData
  ) => void = (index, data) => {
    const copy = _.clone(patternRelationshipFormData);
    copy[index] = data;
    setPatternRelationshipFormData(copy);
    validateForm(patternElementFormData, copy);
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
        parameter: patternRelationshipFormData[r].parameter,
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

  const getTermsForView = () => {
    const t: {
      [key: string]: {
        name: string;
        types: string[];
        parameter: string;
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
          <h5>Parametry</h5>
          <Table size="sm" borderless striped>
            <thead>
              <tr>
                <th colSpan={2}>Parametr</th>
                <th>Vytvořit nový?</th>
                <th>Typ</th>
                <th style={{ minWidth: "80px" }}>Akce</th>
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
                          <p className={"red"}>Prosíme, vložte pojem.</p>
                        )}
                      {!patternElementFormData[t].create &&
                        Object.keys(patternElementFormData).find(
                          (elem) =>
                            patternElementFormData[elem].iri === term.iri &&
                            t !== elem
                        ) && (
                          <p className={"red"}>
                            Tento název musí být unikátní vzhledem k ostatním
                            parametrům.
                          </p>
                        )}
                      {!patternElementFormData[t].name && (
                        <p className={"red"}>Parametr musí mít název.</p>
                      )}
                      {patternElementFormData[t].create &&
                        checkExists(
                          WorkspaceVocabularies[
                            patternElementFormData[t].scheme
                          ].glossary,
                          patternElementFormData[t].name
                        ) && (
                          <p className={"red"}>
                            Tento název již v tomto slovníku existuje.
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
                          {`Volitelné - ${
                            patternElementFormData[t].optional
                              ? "Vyloučit"
                              : "Zahrnout"
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
                            Kopírovatelné - Vytvořit kopii
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
                          Kopie - Odstranit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
          <h5>Vztahy</h5>
          <Table size={"sm"} striped borderless>
            <thead>
              <tr>
                <th colSpan={2}>Vztah</th>
                <th colSpan={5}>Detail</th>
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
                          Tento název musí být unikátní vzhledem k ostatním
                          vztahům.
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
                              <p className={"red"}>
                                Tento vztah musí mít název.
                              </p>
                            )}
                            {checkExists(
                              WorkspaceVocabularies[
                                patternRelationshipFormData[d].scheme
                              ].glossary,
                              patternRelationshipFormData[d].name
                            ) && (
                              <p className={"red"}>
                                Tento název již v tomto slovníku existuje.
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
      {!(detailPattern in Patterns) && <h3>Nevybrána žádná šablona</h3>}
    </div>
  );
};
