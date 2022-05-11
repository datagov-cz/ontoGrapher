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
import {
  AppSettings,
  CardinalityPool,
  Stereotypes,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import { getLabelOrBlank } from "../function/FunctionGetVars";
import { getName } from "../function/FunctionEditVars";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import PatternInternalView from "./PatternInternalView";
import { Pattern } from "./PatternTypes";
import { LinkType } from "../config/Enum";

type newPatternTerms = string[];

type newPatternParameter = {
  [key: string]: {
    name: string;
    types: string[];
    optional: boolean;
    multiple: boolean;
    active: boolean;
  };
};

type newPatternData = {
  name: string;
  author: string;
  description: string;
};

type newPatternRelationship = {
  [key: string]: {
    name: string;
    from: string;
    to: string;
    sourceCardinality: string;
    targetCardinality: string;
    linkType: LinkType;
    active: boolean;
  };
};

type Props = {
  configuration: PatternCreationConfiguration;
  submit: (pattern: Pattern) => void;
  initSubmit: boolean;
};

export const PatternCreationModalNew: React.FC<Props> = (props: Props) => {
  const getTermsForGraph = () => {
    const t: {
      [key: string]: {
        name: string;
        types: string[];
        parameter?: boolean;
        optional?: boolean;
        multiple?: boolean;
      };
    } = {};
    for (const term of newPatternTermData) {
      t[term] = {
        name: getLabelOrBlank(
          WorkspaceTerms[term].labels,
          AppSettings.canvasLanguage
        ),
        types: WorkspaceTerms[term].types,
      };
    }
    for (const param in newPatternParameterData) {
      t[param] = {
        name: newPatternParameterData[param].name,
        types: newPatternParameterData[param].types,
        parameter: true,
        optional: newPatternParameterData[param].optional,
        multiple: newPatternParameterData[param].multiple,
      };
    }
    return t;
  };

  useEffect(() => {
    if (props.initSubmit) props.submit(createPattern());
  }, [props.initSubmit]);

  useEffect(() => {
    const rels = Object.keys(WorkspaceLinks).filter(
      (l) =>
        props.configuration.elements.includes(WorkspaceLinks[l].source) &&
        WorkspaceLinks[l].active &&
        WorkspaceLinks[l].iri in WorkspaceTerms
    );
    // create parameters
    const parameters: newPatternParameter = {};
    const relationships: newPatternRelationship = {};
    rels
      .filter(
        (l) => !props.configuration.elements.includes(WorkspaceLinks[l].target)
      )
      .forEach((l) => {
        if (!(WorkspaceLinks[l].target in parameters)) {
          const term = WorkspaceTerms[WorkspaceLinks[l].target];
          parameters[WorkspaceLinks[l].target] = {
            name: getLabelOrBlank(term.labels, AppSettings.canvasLanguage),
            types: [""],
            optional: false,
            multiple: false,
            active: true,
          };
        }
      });
    // create relationships
    rels.forEach((r) => {
      const sc = CardinalityPool.findIndex(
        (c) => c.getString() === WorkspaceLinks[r].sourceCardinality.getString()
      ).toString(10);
      const tc = CardinalityPool.findIndex(
        (c) => c.getString() === WorkspaceLinks[r].targetCardinality.getString()
      ).toString(10);
      relationships[r] = {
        name: getLabelOrBlank(
          WorkspaceTerms[WorkspaceLinks[r].iri].labels,
          AppSettings.canvasLanguage
        ),
        from: WorkspaceLinks[r].source,
        to: WorkspaceLinks[r].target,
        sourceCardinality: sc === "-1" ? "0" : sc,
        targetCardinality: tc === "-1" ? "0" : tc,
        linkType: WorkspaceLinks[r].type,
        active: true,
      };
    });
    // init info
    setNewPatternData({ name: "", author: "", description: "" });
    setNewPatternRelationshipData(relationships);
    setNewPatternTermData(props.configuration.elements);
    setNewPatternParameterData(parameters);
  }, []);

  const [newPatternParameterData, setNewPatternParameterData] =
    useState<newPatternParameter>({});
  const [newPatternRelationshipData, setNewPatternRelationshipData] =
    useState<newPatternRelationship>({});
  const [newPatternData, setNewPatternData] = useState<newPatternData>({
    name: "",
    author: "",
    description: "",
  });
  const [newPatternTermData, setNewPatternTermData] = useState<newPatternTerms>(
    []
  );
  useEffect(
    () => setNewPatternTermData(props.configuration.elements),
    [props.configuration]
  );

  const modifyRelationshipData: (
    index: string,
    data: newPatternRelationship[keyof newPatternRelationship]
  ) => void = (index, data) => {
    const copy = _.clone(newPatternRelationshipData);
    copy[index] = data;
    setNewPatternRelationshipData(copy);
  };

  const modifyPatternData = (
    id: string,
    data: newPatternParameter[keyof newPatternParameter]
  ) => {
    const copy = _.clone(newPatternParameterData);
    copy[id] = data;
    setNewPatternParameterData(copy);
  };

  const createPattern = () => {
    const t: {
      [key: string]: {
        name: string;
        types: string[];
        parameter?: boolean;
        optional?: boolean;
        multiple?: boolean;
      };
    } = {};
    const c: {
      [key: string]: {
        name: string;
        to: string;
        from: string;
        sourceCardinality: string;
        targetCardinality: string;
        linkType: LinkType;
      };
    } = {};
    props.configuration.elements.forEach((e) => {
      t[e] = {
        name: getLabelOrBlank(
          WorkspaceTerms[e].labels,
          AppSettings.canvasLanguage
        ),
        types: WorkspaceTerms[e].types,
      };
    });
    for (const param in newPatternParameterData) {
      t[param] = {
        name: newPatternParameterData[param].name,
        types: newPatternParameterData[param].types,
        parameter: true,
        optional: newPatternParameterData[param].optional,
        multiple: newPatternParameterData[param].multiple,
      };
    }
    for (const param in newPatternRelationshipData) {
      c[param] = {
        name: newPatternRelationshipData[param].name,
        to: newPatternRelationshipData[param].to,
        from: newPatternRelationshipData[param].from,
        sourceCardinality: newPatternRelationshipData[param].sourceCardinality,
        targetCardinality: newPatternRelationshipData[param].targetCardinality,
        linkType: newPatternRelationshipData[param].linkType,
      };
    }
    return {
      title: newPatternData.name,
      author: newPatternData.author,
      date: new Date().toJSON(),
      description: newPatternData.description,
      terms: t,
      conns: c,
    };
  };

  let key = 0;

  return (
    <Container className={"newPattern"} fluid={true}>
      <Row>
        <Col>
          <h5>Terms</h5>
          <Table size={"sm"} borderless={true} striped={true}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type(s)</th>
              </tr>
            </thead>
            <tbody>
              {newPatternTermData.map((elem) => (
                <tr key={key++}>
                  <td key={key++}>
                    {getLabelOrBlank(
                      WorkspaceTerms[elem].labels,
                      AppSettings.canvasLanguage
                    )}
                  </td>
                  <td key={key++}>
                    {WorkspaceTerms[elem].types
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
          <h5>Relationships</h5>
          <Table size={"sm"} borderless={true} striped={true}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Relationship detail</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(newPatternRelationshipData)
                .filter((data) => newPatternRelationshipData[data].active)
                .map((data) => (
                  <tr key={key++}>
                    <td key={key++}>
                      <Form.Control
                        key={key++}
                        size={"sm"}
                        type={"text"}
                        onChange={(event) =>
                          modifyRelationshipData(data, {
                            ...newPatternRelationshipData[data],
                            name: event.currentTarget.value,
                          })
                        }
                        value={newPatternRelationshipData[data].name}
                      />
                      {!newPatternRelationshipData[data].name && (
                        <p className={"red"}>Please choose a name.</p>
                      )}
                    </td>
                    <td key={key++}>
                      <span>
                        <span className={"fromLink"}>
                          <Form.Control
                            key={key++}
                            size={"sm"}
                            as="select"
                            value={newPatternRelationshipData[data].from}
                            onChange={(event) =>
                              modifyRelationshipData(data, {
                                ...newPatternRelationshipData[data],
                                from: event.currentTarget.value,
                              })
                            }
                          >
                            {props.configuration.elements.map((elem) => (
                              <option key={key++} value={elem}>
                                {getLabelOrBlank(
                                  WorkspaceTerms[elem].labels,
                                  AppSettings.canvasLanguage
                                )}
                              </option>
                            ))}
                            {Object.keys(newPatternParameterData).map(
                              (param) => (
                                <option key={key++} value={param}>
                                  {newPatternParameterData[param].name}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </span>
                        <span className={"fromCard"}>
                          <Form.Control
                            size={"sm"}
                            key={key++}
                            as="select"
                            value={
                              newPatternRelationshipData[data].sourceCardinality
                            }
                            onChange={(event) =>
                              modifyRelationshipData(data, {
                                ...newPatternRelationshipData[data],
                                sourceCardinality: event.currentTarget.value,
                              })
                            }
                          >
                            {CardinalityPool.map((card, i) => (
                              <option key={key++} value={i.toString(10)}>
                                {card.getString()}
                              </option>
                            ))}
                          </Form.Control>
                        </span>
                      </span>
                      <br />
                      <button
                        onClick={() =>
                          modifyRelationshipData(data, {
                            ...newPatternRelationshipData[data],
                            linkType:
                              newPatternRelationshipData[data].linkType ===
                              LinkType.DEFAULT
                                ? LinkType.GENERALIZATION
                                : LinkType.DEFAULT,
                          })
                        }
                        className={"buttonlink linktype"}
                      >
                        <svg
                          width="15px"
                          height="15px"
                          preserveAspectRatio="none"
                        >
                          {newPatternRelationshipData[data].linkType ===
                            LinkType.DEFAULT && (
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#333333" />
                          )}
                          {newPatternRelationshipData[data].linkType ===
                            LinkType.GENERALIZATION && (
                            <path
                              d="M 0 0 L 10 5 L 0 10 z"
                              stroke="#333333"
                              strokeWidth="1"
                              fill="#FFFFFF"
                            />
                          )}
                        </svg>
                      </button>
                      <span>
                        <span className={"toCard"}>
                          <Form.Control
                            size={"sm"}
                            as="select"
                            key={key++}
                            value={
                              newPatternRelationshipData[data].targetCardinality
                            }
                            onChange={(event) =>
                              modifyRelationshipData(data, {
                                ...newPatternRelationshipData[data],
                                targetCardinality: event.currentTarget.value,
                              })
                            }
                          >
                            {CardinalityPool.map((card, i) => (
                              <option key={key++} value={i.toString(10)}>
                                {card.getString()}
                              </option>
                            ))}
                          </Form.Control>
                        </span>
                        <span className={"toLink"}>
                          <Form.Control
                            size={"sm"}
                            key={key++}
                            as="select"
                            value={newPatternRelationshipData[data].to}
                            onChange={(event) =>
                              modifyRelationshipData(data, {
                                ...newPatternRelationshipData[data],
                                to: event.currentTarget.value,
                              })
                            }
                          >
                            {props.configuration.elements.map((elem) => (
                              <option key={key++} value={elem}>
                                {getLabelOrBlank(
                                  WorkspaceTerms[elem].labels,
                                  AppSettings.canvasLanguage
                                )}
                              </option>
                            ))}
                            {Object.keys(newPatternParameterData).map(
                              (param) => (
                                <option key={key++} value={param}>
                                  {newPatternParameterData[param].name}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </span>
                      </span>
                    </td>
                    <td key={key++} style={{ wordBreak: "keep-all" }}>
                      <Button
                        size={"sm"}
                        key={key++}
                        onClick={() =>
                          modifyRelationshipData(data, {
                            ...newPatternRelationshipData[data],
                            active: false,
                          })
                        }
                        variant={"danger"}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              <tr>
                <td colSpan={3}>
                  <Button
                    size={"sm"}
                    onClick={() => {
                      const copy = _.clone(newPatternRelationshipData);
                      copy[uuidv4()] = {
                        active: true,
                        from: newPatternTermData[0],
                        name: "",
                        sourceCardinality: "0",
                        targetCardinality: "0",
                        to: newPatternTermData[0],
                        linkType: LinkType.DEFAULT,
                      };
                      setNewPatternRelationshipData(copy);
                    }}
                  >
                    Add relationship
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
          <h5>Parameters</h5>
          <Table size={"sm"} borderless={true} striped={true}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th style={{ wordBreak: "keep-all" }}>Optional</th>
                <th style={{ wordBreak: "keep-all" }}>Multiple</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(newPatternParameterData).map((data) => {
                return (
                  <tr>
                    <td>
                      <Form.Control
                        size={"sm"}
                        type={"text"}
                        placeholder={"Parameter name"}
                        value={newPatternParameterData[data].name}
                        onChange={(event) =>
                          modifyPatternData(data, {
                            ...newPatternParameterData[data],
                            name: event.currentTarget.value,
                          })
                        }
                      />
                      {!newPatternParameterData[data].name && (
                        <p className={"red"}>Please choose a name.</p>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        onChange={(event) =>
                          modifyPatternData(data, {
                            ...newPatternParameterData[data],
                            types: [event.currentTarget.value],
                          })
                        }
                        value={newPatternParameterData[data].types[0]}
                        size="sm"
                        as="select"
                      >
                        <option value={""}>No type</option>
                        {Object.keys(Stereotypes)
                          .filter(
                            (s) =>
                              ![
                                "https://slovník.gov.cz/základní/pojem/typ-vztahu",
                                "https://slovník.gov.cz/základní/pojem/typ-vlastnosti",
                              ].includes(s)
                          )
                          .map((s) => (
                            <option value={s}>
                              {getName(s, AppSettings.canvasLanguage)}
                            </option>
                          ))}
                      </Form.Control>
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        onChange={(event) =>
                          modifyPatternData(data, {
                            ...newPatternParameterData[data],
                            optional: event.currentTarget.checked,
                          })
                        }
                        checked={newPatternParameterData[data].optional}
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        onChange={(event) =>
                          modifyPatternData(data, {
                            ...newPatternParameterData[data],
                            multiple: event.currentTarget.checked,
                          })
                        }
                        checked={newPatternParameterData[data].multiple}
                      />
                    </td>
                    <td>
                      <Button
                        size={"sm"}
                        key={key++}
                        onClick={() =>
                          modifyPatternData(data, {
                            ...newPatternParameterData[data],
                            active: false,
                          })
                        }
                        variant={"danger"}
                      >
                        {"Remove"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={5}>
                  <Button
                    size={"sm"}
                    onClick={() =>
                      modifyPatternData(uuidv4(), {
                        name: "",
                        types: [""],
                        optional: false,
                        multiple: false,
                        active: true,
                      })
                    }
                  >
                    Add parameter
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
        <Col>
          <h5>Pattern structure</h5>
          <PatternInternalView
            width={"100%"}
            height={"500px"}
            fitContent={true}
            terms={getTermsForGraph()}
            conns={newPatternRelationshipData}
          />
          <h5 style={{ paddingTop: "5px" }}>Pattern information</h5>
          <Form.Group controlId="formTitle">
            <Form.Label>Title*</Form.Label>
            <Form.Control
              value={newPatternData.name}
              onChange={(event) =>
                setNewPatternData({
                  ...newPatternData,
                  name: event.currentTarget.value,
                })
              }
              type="text"
            />
            {!newPatternData.name && (
              <p className={"red"}>Please choose a title.</p>
            )}
          </Form.Group>
          <Form.Group controlId="formAuthor">
            <Form.Label>Author</Form.Label>
            <Form.Control
              value={newPatternData.author}
              onChange={(event) =>
                setNewPatternData({
                  ...newPatternData,
                  author: event.currentTarget.value,
                })
              }
              type="text"
            />
          </Form.Group>
          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={newPatternData.description}
              onChange={(event) =>
                setNewPatternData({
                  ...newPatternData,
                  description: event.currentTarget.value,
                })
              }
              as={"textarea"}
              rows={3}
            />
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
};
