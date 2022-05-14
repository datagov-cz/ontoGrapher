import React, { useState } from "react";
import {
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
import * as _ from "lodash";
import { Instance, Pattern, Patterns } from "../function/PatternTypes";
import { callRefactorAlgorithm } from "../function/PatternQueries";
import EditingPatternInternalView from "../structures/EditingPatternInternalView";
import { Diagrams } from "../../config/Variables";

type Props = { open: boolean; close: Function };

type Algo1Results = {
  instance: Instance;
  use: boolean;
};

type Algo2Results = {
  pattern: Pattern;
  instances: Instance[];
  use: boolean;
};

//TODO: implement algo1 modal
//TODO: implement algo2 modal
export const PatternAlgorithmModal: React.FC<Props> = (props: Props) => {
  const [algo1Loading, setAlgo1Loading] = useState<boolean>(false);
  const [algo2Loading, setAlgo2Loading] = useState<boolean>(false);
  const [algo1Where, setAlgo1Where] = useState<string>("");
  const [algo2Where, setAlgo2Where] = useState<string>("");
  const [algo1Detail, setAlgo1Detail] = useState<number>(-1);
  const [algo2Detail, setAlgo2Detail] = useState<number>(-1);
  const [algo1Results, setAlgo1Results] = useState<Algo1Results[]>([]);
  const [algo2Results, setAlgo2Results] = useState<Algo2Results[]>([]);

  const callAlgo1 = async () => {
    setAlgo1Loading(true);
    await callRefactorAlgorithm();
  };

  const callAlgo2 = async () => {
    setAlgo2Loading(true);
    await callRefactorAlgorithm();
  };

  const modifyAlgo1Results = (data: Algo1Results, index: number) => {
    const copy = _.clone(algo1Results);
    copy[index] = data;
    setAlgo1Results(copy);
  };

  const modifyAlgo2Results = (data: Algo2Results, index: number) => {
    const copy = _.clone(algo2Results);
    copy[index] = data;
    setAlgo2Results(copy);
  };

  return (
    <Modal
      size={"xl"}
      dialogClassName={"patternModal"}
      centered
      onEntering={() => {
        setAlgo1Results([]);
        setAlgo2Results([]);
      }}
    >
      <Modal.Header>
        <Modal.Title>Call pattern algorithms</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey={"create"}>
          <Tab
            disabled={algo2Loading}
            eventKey={"refactor"}
            title={"Refactor existing model"}
          >
            {algo1Results.length === 0 && (
              <div>
                <p>
                  This algorithm attempts to refactor the model using already
                  existing patterns.
                </p>
                <Button disabled={algo1Loading}>Refactor</Button> terms in{" "}
                <Form.Control
                  as={"select"}
                  value={algo1Where}
                  onChange={(event) => setAlgo1Where(event.currentTarget.value)}
                >
                  <option key={""} value={""}>
                    all diagrams
                  </option>
                  {Object.keys(Diagrams).map((diag) => (
                    <option key={diag} value={diag}>
                      {Diagrams[diag].name}
                    </option>
                  ))}
                </Form.Control>
              </div>
            )}
            {algo1Results.length > 0 && (
              <div>
                <Table>
                  <thead>
                    <th>Newly created instance</th>
                    <th>Actions</th>
                  </thead>
                  <tbody>
                    {algo1Results.map((res, index) => (
                      <tr>
                        <td>Instance of {Patterns[res.instance.iri].title}</td>
                        <td>
                          <Button
                            size={"sm"}
                            onClick={() => setAlgo1Detail(index)}
                          >
                            View details
                          </Button>
                          <Button
                            size={"sm"}
                            onClick={() =>
                              modifyAlgo1Results(
                                { ...res, use: !res.use },
                                index
                              )
                            }
                          >
                            {res.use ? "Do not apply" : "Apply instance"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab>
          <Tab
            disabled={algo1Loading}
            key={"create"}
            title={"Create patterns automatically"}
          >
            {algo2Results.length === 0 && (
              <div>
                <p>
                  This algorithm attempts to find new patterns that could be
                  applied.
                </p>
                <Button disabled={algo2Loading}>Create</Button> patterns in{" "}
                <Form.Control
                  as={"select"}
                  onChange={(event) => setAlgo2Where(event.currentTarget.value)}
                  value={algo2Where}
                >
                  <option key={""} value={""}>
                    all diagrams
                  </option>
                  {Object.keys(Diagrams).map((diag) => (
                    <option key={diag} value={diag}>
                      {Diagrams[diag].name}
                    </option>
                  ))}
                </Form.Control>
              </div>
            )}
            {algo2Results.length > 0 && (
              <Container>
                <Row>
                  <Col>
                    <div>
                      <Table>
                        <thead>
                          <td>Newly created instance</td>
                          <th>Actions</th>
                        </thead>
                        <tbody>
                          {algo2Results.map((res, index) => (
                            <tr>
                              <td>{res.pattern.title}</td>
                              <td>
                                <Button
                                  size={"sm"}
                                  onClick={() => setAlgo2Detail(index)}
                                >
                                  View details
                                </Button>
                                <Button
                                  size={"sm"}
                                  onClick={() =>
                                    modifyAlgo2Results(
                                      { ...res, use: !res.use },
                                      index
                                    )
                                  }
                                >
                                  {res.use ? "Do not use" : "Use pattern"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                  <Col>
                    {algo2Detail !== 1 && (
                      <div>
                        <EditingPatternInternalView
                          width={"100%"}
                          height={"500px"}
                          fitContent={true}
                          terms={algo2Results[algo2Detail].pattern.terms}
                          conns={algo2Results[algo2Detail].pattern.conns}
                        />
                        <br />
                        <Form.Group controlId="formTitle">
                          <Form.Label>Title</Form.Label>
                          <Form.Control
                            value={algo2Results[algo2Detail].pattern.title}
                            disabled
                            type="text"
                          />
                        </Form.Group>
                        <Form.Group controlId="formAuthor">
                          <Form.Label>Author</Form.Label>
                          <Form.Control
                            value={algo2Results[algo2Detail].pattern.author}
                            disabled
                            type="text"
                          />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            value={
                              algo2Results[algo2Detail].pattern.description
                            }
                            disabled
                            as={"textarea"}
                            rows={3}
                          />
                        </Form.Group>
                      </div>
                    )}
                  </Col>
                </Row>
              </Container>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => props.close()}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
