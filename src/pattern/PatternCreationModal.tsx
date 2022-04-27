import React, { useState } from "react";
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
import { Locale } from "../config/Locale";
import {
  AppSettings,
  CardinalityPool,
  Stereotypes,
  WorkspaceTerms,
} from "../config/Variables";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import { getLabelOrBlank } from "../function/FunctionGetVars";
import { getName } from "../function/FunctionEditVars";
import * as _ from "lodash";

type Props = {
  modal: boolean;
  close: Function;
  configuration: PatternCreationConfiguration;
};

type newPatternParameter = {
  name: string;
  type?: string;
  optional: boolean;
  multiple: boolean;
  convolution: boolean;
  edit: boolean;
  connections: newPatternRelationship[];
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

export const PatternCreationModal: React.FC<Props> = (props: Props) => {
  const;
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const [newPatternParameterData, setNewPatternParameterData] = useState<
    newPatternParameter[]
  >([]);
  const [newPatternRelationshipData, setNewPatternRelationshipData] = useState<
    newPatternRelationship[]
  >([]);
  const [newPatternData, setNewPatternData] = useState<newPatternData>({
    name: "",
    author: "",
    description: "",
  });
  const modifyRelationshipData: (
    index: number,
    data: newPatternRelationship
  ) => void = (index, data) => {
    const copy = _.clone(newPatternRelationshipData);
    copy[index] = data;
    setNewPatternRelationshipData(copy);
  };
  const modifyPatternData: (
    index: number,
    data: newPatternParameter
  ) => void = (index, data) => {
    const copy = _.clone(newPatternParameterData);
    copy[index] = data;
    setNewPatternParameterData(copy);
  };
  return (
    <Modal
      centered
      scrollable
      show={props.modal}
      keyboard={true}
      size={"xl"}
      onEscapeKeyDown={() => props.close()}
      onHide={() => props.close}
      onEntering={() => {}}
    >
      <Modal.Header>
        <Modal.Title>Create or apply pattern</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs>
          <Tab title={"Create new pattern"}>
            <Container>
              <Row>
                <Col>
                  <h5>Terms</h5>
                  <Table size={"sm"} borderless={true} striped={true}>
                    <thead>
                      <tr>
                        <td>Name</td>
                      </tr>
                      <tr>
                        <td>Type(s)</td>
                      </tr>
                    </thead>
                    {AppSettings.selectedElements.map((elem) => (
                      <tr>
                        <td>
                          {getLabelOrBlank(
                            WorkspaceTerms[elem].labels,
                            AppSettings.canvasLanguage
                          )}
                        </td>
                        <td>
                          {WorkspaceTerms[elem].types
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
                  </Table>
                  <h5>Relationships</h5>
                  <Table size={"sm"} borderless={true} striped={true}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th colSpan={3}> Detail</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    {newPatternRelationshipData.map((data, index) => (
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
                          <Form.Control
                            as="select"
                            value={data.from}
                            onChange={(event) =>
                              modifyRelationshipData(index, {
                                ...data,
                                from: event.currentTarget.value,
                              })
                            }
                          >
                            {AppSettings.selectedElements.map((elem) => (
                              <option value={elem}>
                                {getLabelOrBlank(
                                  WorkspaceTerms[elem].labels,
                                  AppSettings.canvasLanguage
                                )}
                              </option>
                            ))}
                            {newPatternParameterData.map((param, i) => (
                              <option value={i.toString(10)}>
                                {param.name}
                              </option>
                            ))}
                          </Form.Control>
                          <Form.Control
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
                              <option key={i} value={i.toString(10)}>
                                {card.getString()}
                              </option>
                            ))}
                          </Form.Control>
                        </td>
                        <td className={"link"}>
                          <svg
                            width="100%"
                            height="25px"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <marker
                                id={index.toString(10)}
                                viewBox="0 0 10 10"
                                refX="10"
                                refY="5"
                                markerUnits="strokeWidth"
                                markerWidth="8"
                                markerHeight="10"
                                orient={"0"}
                              >
                                <path
                                  d="M 0 0 L 10 5 L 0 10 z"
                                  fill="#333333"
                                />
                              </marker>
                            </defs>
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
                          <Form.Control
                            as="select"
                            value={data.targetCardinality}
                            onChange={(event) =>
                              modifyRelationshipData(index, {
                                ...data,
                                targetCardinality: event.currentTarget.value,
                              })
                            }
                          >
                            {CardinalityPool.map((card, i) => (
                              <option key={i} value={i.toString(10)}>
                                {card.getString()}
                              </option>
                            ))}
                          </Form.Control>
                          <Form.Control
                            as="select"
                            value={data.to}
                            onChange={(event) =>
                              modifyRelationshipData(index, {
                                ...data,
                                to: event.currentTarget.value,
                              })
                            }
                          >
                            {AppSettings.selectedElements.map((elem) => (
                              <option value={elem}>
                                {getLabelOrBlank(
                                  WorkspaceTerms[elem].labels,
                                  AppSettings.canvasLanguage
                                )}
                              </option>
                            ))}
                            {newPatternParameterData.map((param, i) => (
                              <option value={i.toString(10)}>
                                {param.name}
                              </option>
                            ))}
                          </Form.Control>
                        </td>
                        <td>
                          <Button
                            onClick={() =>
                              modifyRelationshipData(index, {
                                ...data,
                                active: !data.active,
                              })
                            }
                            variant={data.active ? "danger" : "success"}
                          >
                            {data.active ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <Button
                          onClick={() => {
                            const copy = _.clone(newPatternRelationshipData);
                            copy.push({
                              active: true,
                              from: "",
                              name: "",
                              sourceCardinality: "",
                              targetCardinality: "",
                              to: "",
                            });
                            setNewPatternRelationshipData(copy);
                          }}
                        >
                          Add relationship
                        </Button>
                      </td>
                    </tr>
                  </Table>
                  <h5>Parameters</h5>
                  <Table size={"sm"} borderless={true} striped={true}>
                    <thead>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </thead>
                    {newPatternParameterData.map((data, index) => {
                      return (
                        <tr>
                          <td>
                            <Form.Control
                              type={"text"}
                              placeholder={"Parameter name"}
                              value={data.name}
                              onChange={(event) =>
                                modifyPatternData(index, {
                                  ...data,
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
                            <Form.Switch
                              onChange={(event) =>
                                modifyPatternData(index, {
                                  ...data,
                                  optional: event.currentTarget.checked,
                                })
                              }
                              checked={data.optional}
                            />
                          </td>
                          <td>
                            <Form.Switch
                              onChange={(event) =>
                                modifyPatternData(index, {
                                  ...data,
                                  multiple: event.currentTarget.checked,
                                })
                              }
                              checked={data.multiple}
                            />
                          </td>
                          <td>
                            <Form.Switch
                              onChange={(event) =>
                                modifyPatternData(index, {
                                  ...data,
                                  convolution: event.currentTarget.checked,
                                })
                              }
                              checked={data.convolution}
                            />
                            {data.convolution && (
                              <Form.Control size="sm" as="select">
                                {newPatternParameterData
                                  .filter(
                                    (d, i) =>
                                      (d.multiple || d.convolution) &&
                                      i !== index
                                  )
                                  .map((d, i) => (
                                    <option value={i}>{d.name}</option>
                                  ))}
                              </Form.Control>
                            )}
                          </td>
                          <td>
                            <Button
                              onClick={() =>
                                modifyPatternData(index, {
                                  ...data,
                                  edit: !data.edit,
                                })
                              }
                            >
                              {data.edit
                                ? "Show connections"
                                : "Hide connections"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td>
                        <Button
                          onClick={() => {
                            const copy = _.clone(newPatternParameterData);
                            copy.push({
                              name: "",
                              type: "",
                              optional: false,
                              multiple: false,
                              convolution: false,
                              edit: false,
                              connections: [],
                            });
                            setNewPatternParameterData(copy);
                          }}
                        >
                          Add parameter
                        </Button>
                      </td>
                    </tr>
                  </Table>
                  <h5>Pattern information</h5>
                  <Form.Group controlId="formTitle">
                    <Form.Label>Pattern title</Form.Label>
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
                </Col>
                <Col></Col>
              </Row>
            </Container>
          </Tab>
          <Tab title={"Apply existing pattern"}></Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button type={"submit"} disabled={submitDisabled} variant="primary">
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
