import React, { useState } from "react";
import { Button, Form, Modal, Tab, Table, Tabs } from "react-bootstrap";
import { callRefactorAlgorithm } from "./PatternQueries";
import { Diagrams } from "../config/Variables";
import { Instance, Patterns } from "./PatternTypes";
import { Quad } from "n3";

type Props = { open: boolean; close: Function };

type Results = {
  instance: Instance;
  replacing: Quad[];
  details: boolean;
}[];

export const PatternAlgorithmModal: React.FC<Props> = (props: Props) => {
  const [algo1Loading, setAlgo1Loading] = useState<boolean>(false);
  const [algo2Loading, setAlgo2Loading] = useState<boolean>(false);
  const [algo1Where, setAlgo1Where] = useState<string>("");
  const [algo2Where, setAlgo2Where] = useState<string>("");
  const [algo1Results, setAlgo1Results] = useState<Results>([]);
  const [algo2Results, setAlgo2Results] = useState<Results>([]);

  const callAlgo1 = async () => {
    setAlgo1Loading(true);
    await callRefactorAlgorithm();
  };
  return (
    <Modal
      size={"xl"}
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
        <Tabs>
          <Tab disabled={algo2Loading} title={"Refactor existing model"}>
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
                  <option value={""}>all diagrams</option>
                  {Object.keys(Diagrams).map((diag) => (
                    <option value={diag}>{Diagrams[diag].name}</option>
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
                          <Button>View details</Button>
                          <Button>Do not use</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab>
          <Tab disabled={algo1Loading} title={"Create patterns automatically"}>
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
                  <option value={""}>all diagrams</option>
                  {Object.keys(Diagrams).map((diag) => (
                    <option value={diag}>{Diagrams[diag].name}</option>
                  ))}
                </Form.Control>
              </div>
            )}
            {algo2Results.length > 0 && (
              <div>
                <Table>
                  <thead>
                    <td>Newly created instance</td>
                    <th>Actions</th>
                  </thead>
                  <tbody>
                    {algo1Results.map((res, index) => (
                      <tr>
                        <td>{Patterns[res.instance.iri].title}</td>
                        <td>
                          <Button>View details</Button>
                          <Button>Do not use</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
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
