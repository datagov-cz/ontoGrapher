import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Container,
  Dropdown,
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
import {
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
} from "../function/FunctionGetVars";
import { getName, getStereotypeList } from "../function/FunctionEditVars";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { Patterns } from "./PatternTypes";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import Select from "react-select";
import PatternInternalView from "./PatternInternalView";
import { getDisplayLabel } from "../function/FunctionDraw";

type newPatternQualities = {
  [key: string]: { [key: string]: boolean };
};

type newPatternParameter = {
  [key: string]: {
    name: string;
    type: string[];
    optional: boolean;
    multiple: boolean;
    multipleIRI: string;
    convolution: string;
    qualities: string[];
    active: boolean;
  };
};

type newPatternData = {
  name: string;
  author: string;
  description: string;
};

type newPatternRelationship = {
  name: string;
  from: string;
  to: string;
  sourceCardinality: string;
  targetCardinality: string;
  active: boolean;
};

type Props = { configuration: PatternCreationConfiguration };

export const PatternCreationModalNew: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    // compact only!
    const rels = Object.keys(WorkspaceLinks).filter(
      (l) =>
        props.configuration.elements.includes(WorkspaceLinks[l].source) &&
        WorkspaceLinks[l].active &&
        WorkspaceLinks[l].iri in WorkspaceTerms
    );
    // create parameters
    const parameters: newPatternParameter = {};
    const relationships: newPatternRelationship[] = [];
    const qualities: newPatternQualities = {};
    rels
      .filter(
        (l) => !props.configuration.elements.includes(WorkspaceLinks[l].target)
      )
      .forEach((l) => {
        if (!(WorkspaceLinks[l].target in parameters)) {
          const term = WorkspaceTerms[WorkspaceLinks[l].target];
          parameters[WorkspaceLinks[l].target] = {
            name: getLabelOrBlank(term.labels, AppSettings.canvasLanguage),
            type: term.types,
            optional: false,
            multiple: false,
            multipleIRI: "",
            convolution: "",
            qualities: getIntrinsicTropeTypeIDs(WorkspaceLinks[l].target),
            active: true,
          };
        }
      });
    // create relationships
    rels.forEach((r) => {
      relationships.push({
        name: getLabelOrBlank(
          WorkspaceTerms[WorkspaceLinks[r].iri].labels,
          AppSettings.canvasLanguage
        ),
        from: WorkspaceLinks[r].source,
        to: WorkspaceLinks[r].target,
        sourceCardinality: CardinalityPool.indexOf(
          WorkspaceLinks[r].sourceCardinality
        ).toString(10),
        targetCardinality: CardinalityPool.indexOf(
          WorkspaceLinks[r].targetCardinality
        ).toString(10),
        active: true,
      });
    });
    // create qualities
    props.configuration.elements.forEach((e) => {
      if (!(e in qualities)) qualities[e] = {};
      getIntrinsicTropeTypeIDs(e).forEach((t) => (qualities[e][t] = true));
    });
    // init info
    setNewPatternData({ name: "", author: "", description: "" });
    setNewPatternQualityData(qualities);
    setNewPatternRelationshipData(relationships);
    setNewPatternParameterData(parameters);
    console.log(props.configuration.elements);
  }, []);

  const [newPatternParameterData, setNewPatternParameterData] =
    useState<newPatternParameter>({});
  const [newPatternRelationshipData, setNewPatternRelationshipData] = useState<
    newPatternRelationship[]
  >([]);
  const [newPatternData, setNewPatternData] = useState<newPatternData>({
    name: "",
    author: "",
    description: "",
  });
  const [newPatternQualityData, setNewPatternQualityData] =
    useState<newPatternQualities>({});

  const modifyRelationshipData: (
    index: number,
    data: newPatternRelationship
  ) => void = (index, data) => {
    const copy = _.clone(newPatternRelationshipData);
    copy[index] = data;
    setNewPatternRelationshipData(copy);
  };

  const modifyPatternData = (
    id: string,
    data: {
      name: string;
      type: string[];
      optional: boolean;
      multiple: boolean;
      multipleIRI: string;
      convolution: string;
      qualities: string[];
      active: boolean;
    }
  ) => {
    console.log(data);
    const copy = _.clone(newPatternParameterData);
    copy[id] = data;
    setNewPatternParameterData(copy);
  };

  const createPattern = () => {
    Patterns[uuidv4()] = {
      title: newPatternData.name,
      author: newPatternData.author,
      date: new Date().toJSON(),
      description: newPatternData.description,
      terms: props.configuration.elements
        .map((e) => ({
          parameter: false,
          types: WorkspaceTerms[e].types,
          name: getLabelOrBlank(
            WorkspaceTerms[e].labels,
            AppSettings.canvasLanguage
          ),
          qualities: Object.keys(newPatternQualityData[e]).filter(
            (q) => newPatternQualityData[e][q]
          ),
        }))
        .concat(
          Object.keys(newPatternParameterData).map((d) => ({
            parameter: true,
            types: newPatternParameterData[d].type,
            name: newPatternParameterData[d].name,
            qualities: newPatternParameterData[d].qualities,
            optional: newPatternParameterData[d].optional,
            multiple: newPatternParameterData[d].multiple,
            convolution: newPatternParameterData[d].convolution,
          }))
        ),
      conns: newPatternRelationshipData.map((d) => ({
        name: d.name,
        from: d.from,
        to: d.to,
        sourceCardinality: d.sourceCardinality,
        targetCardinality: d.targetCardinality,
      })),
    };
    console.log({
      title: newPatternData.name,
      author: newPatternData.author,
      date: new Date().toJSON(),
      description: newPatternData.description,
      terms: props.configuration.elements
        .map((e) => ({
          parameter: false,
          types: WorkspaceTerms[e].types,
          name: getLabelOrBlank(
            WorkspaceTerms[e].labels,
            AppSettings.canvasLanguage
          ),
          qualities: Object.keys(newPatternQualityData[e]).filter(
            (q) => newPatternQualityData[e][q]
          ),
        }))
        .concat(
          Object.keys(newPatternParameterData).map((d) => ({
            parameter: true,
            types: newPatternParameterData[d].type,
            name: newPatternParameterData[d].name,
            qualities: newPatternParameterData[d].qualities,
            optional: newPatternParameterData[d].optional,
            multiple: newPatternParameterData[d].multiple,
            convolution: newPatternParameterData[d].convolution,
          }))
        ),
      conns: newPatternRelationshipData.map((d) => ({
        name: d.name,
        from: d.from,
        to: d.to,
        sourceCardinality: d.sourceCardinality,
        targetCardinality: d.targetCardinality,
      })),
    });
  };

  const modifyQualityData = (i: string, q: string, b: boolean) => {
    const copy = _.clone(newPatternQualityData);
    copy[i][q] = b;
    setNewPatternQualityData(copy);
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
                <th>Intrinsic trope(s)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(newPatternQualityData).map((elem) => (
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
                  <td key={key++}>
                    {Object.keys(newPatternQualityData[elem]).map((e) => (
                      <Dropdown>
                        <Dropdown.Toggle
                          size={"sm"}
                          variant={
                            newPatternQualityData[elem][e]
                              ? "success"
                              : "danger"
                          }
                        >
                          {getLabelOrBlank(
                            WorkspaceTerms[e].labels,
                            AppSettings.canvasLanguage
                          )}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {!newPatternQualityData[elem][e] && (
                            <Dropdown.Item
                              onClick={() => modifyQualityData(elem, e, true)}
                            >
                              Include in pattern
                            </Dropdown.Item>
                          )}
                          {newPatternQualityData[elem][e] && (
                            <Dropdown.Item
                              onClick={() => modifyQualityData(elem, e, false)}
                            >
                              Remove from pattern
                            </Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
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
                <th>Detail</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newPatternRelationshipData
                .filter((data) => data.active)
                .map((data, index) => (
                  <tr key={key++}>
                    <td key={key++}>
                      <Form.Control
                        key={key++}
                        size={"sm"}
                        type={"text"}
                        onChange={(event) =>
                          modifyRelationshipData(index, {
                            ...data,
                            name: event.currentTarget.value,
                          })
                        }
                        value={data.name}
                      />
                    </td>
                    <td key={key++}>
                      <span>
                        <span className={"fromLink"}>
                          <Form.Control
                            key={key++}
                            size={"sm"}
                            as="select"
                            value={data.from}
                            onChange={(event) =>
                              modifyRelationshipData(index, {
                                ...data,
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
                            value={data.sourceCardinality}
                            onChange={(event) =>
                              modifyRelationshipData(index, {
                                ...data,
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
                      <svg
                        width="15px"
                        height="15px"
                        preserveAspectRatio="none"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#333333" />
                      </svg>
                      <span>
                        <span className={"toCard"}>
                          <Form.Control
                            size={"sm"}
                            as="select"
                            key={key++}
                            value={data.targetCardinality}
                            onChange={(event) =>
                              modifyRelationshipData(index, {
                                ...data,
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
                            value={data.to}
                            onChange={(event) =>
                              modifyRelationshipData(index, {
                                ...data,
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
                        key={key++}
                        onClick={() =>
                          modifyRelationshipData(index, {
                            ...data,
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
                      copy.push({
                        active: true,
                        from: Object.keys(newPatternQualityData)[0],
                        name: "",
                        sourceCardinality: "0",
                        targetCardinality: "0",
                        to: Object.keys(newPatternQualityData)[0],
                      });
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
              <th>Name</th>
              <th>Type</th>
              <th>Optional</th>
              <th>Multiple</th>
              <th>Actions</th>
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
                    </td>
                    <td>
                      <Form.Control size="sm" as="select">
                        {Object.keys(Stereotypes).map((s) => (
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
                      {newPatternParameterData[data].multiple && (
                        <Select
                          isSearchable={true}
                          isMulti={false}
                          onChange={(value) => {
                            if (
                              newPatternParameterData[data].multipleIRI in
                              newPatternParameterData
                            ) {
                              modifyPatternData(value!.value, {
                                ...newPatternParameterData[data],
                                multipleIRI: value!.value,
                              });
                            }
                            modifyPatternData(data, {
                              ...newPatternParameterData[data],
                              multipleIRI: value!.value,
                            });
                          }}
                          options={Object.keys(newPatternParameterData)
                            .filter(
                              (d) =>
                                newPatternParameterData[d].multiple &&
                                data !== d
                            )
                            .map((q) => {
                              return {
                                value: q,
                                label: newPatternParameterData[q].name,
                              };
                            })
                            .concat({ value: "", label: "Select" })}
                          value={{
                            value: newPatternParameterData[data].multipleIRI,
                            label:
                              newPatternParameterData[data].multipleIRI in
                              newPatternParameterData
                                ? newPatternParameterData[
                                    newPatternParameterData[data].multipleIRI
                                  ].name
                                : "Select",
                          }}
                        />
                      )}
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
                        {"Remove from pattern"}
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
                        type: [],
                        optional: false,
                        multiple: false,
                        multipleIRI: "",
                        convolution: "",
                        qualities: [],
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
            terms={Object.keys(newPatternQualityData).map((elem) => {
              return {
                name: elem,
                iri: elem,
                types: getStereotypeList(
                  WorkspaceTerms[elem].types,
                  AppSettings.canvasLanguage
                ),
                parameter: false,
                qualities: Object.keys(newPatternQualityData[elem])
                  .filter((q) => newPatternQualityData[elem][q])
                  .map((id) => getDisplayLabel(id, AppSettings.canvasLanguage)),
              };
            })}
            conns={newPatternRelationshipData.map((data) => {
              return {
                name: data.name,
                to: data.to,
                from: data.from,
                sourceCardinality: data.sourceCardinality,
                targetCardinality: data.targetCardinality,
              };
            })}
            parameters={Object.keys(newPatternParameterData).map((data) => {
              return {
                name: newPatternParameterData[data].name,
                id: data,
                types: newPatternParameterData[data].type,
                qualities: newPatternParameterData[data].qualities,
              };
            })}
          />
          <p style={{ paddingTop: "5px" }}>
            <h5>Pattern information</h5>
          </p>
          <Form.Group controlId="formTitle">
            <Form.Label>Title</Form.Label>
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
          <p>
            <Button onClick={() => createPattern()}>Create pattern</Button>
          </p>
        </Col>
      </Row>
    </Container>
  );
};
