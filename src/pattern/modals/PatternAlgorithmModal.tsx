import React, { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import * as _ from "lodash";
import { Pattern, Patterns } from "../function/PatternTypes";
import {
  AppSettings,
  CardinalityPool,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import * as joint from "jointjs";
import { graphElement } from "../../graph/GraphElement";
import { getNewLink } from "../../function/FunctionGetVars";
import { LinkType } from "../../config/Enum";
import { RepresentationConfig } from "../../config/logic/RepresentationConfig";
import NewPatternInternalView from "../structures/NewPatternInternalView";
import { v4 } from "uuid";

type Props = {
  open: boolean;
  close: Function;
  performPatternTransaction: (iri: string) => void;
};

type Algo2Results = {
  pattern: Pattern;
  use: boolean;
};

export const PatternAlgorithmModal: React.FC<Props> = (props: Props) => {
  const [algo2Detail, setAlgo2Detail] = useState<number>(-1);
  const [algo2Results, setAlgo2Results] = useState<Algo2Results[]>([]);

  const save = () => {
    algo2Results
      .filter((res) => res.use)
      .forEach((res) => {
        const pattern = res.pattern;
        const id = `${AppSettings.ontographerContext}/pattern/${v4()}`;
        Patterns[id] = pattern;
        props.performPatternTransaction(id);
        props.close();
      });
  };

  // @ts-ignore
  const k_combinations = (set: Array<string>, k: number) => {
    var i, j, combs, head, tailcombs;
    if (k > set.length || k <= 0) {
      return [];
    }
    if (k == set.length) {
      return [set];
    }
    if (k == 1) {
      combs = [];
      for (i = 0; i < set.length; i++) {
        combs.push([set[i]]);
      }
      return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
      head = set.slice(i, i + 1);
      tailcombs = k_combinations(set.slice(i + 1), k - 1);
      for (j = 0; j < tailcombs.length; j++) {
        combs.push(head.concat(tailcombs[j]));
      }
    }
    return combs;
  };

  const callAlgo2: () => Algo2Results[] = () => {
    const ret: Algo2Results[] = [];
    console.log("Creating graph");
    const graph: joint.dia.Graph = new joint.dia.Graph();
    for (const term of Object.keys(WorkspaceTerms)) {
      graph.addCell(new graphElement({ id: term }));
    }
    for (const link of Object.keys(WorkspaceLinks)) {
      if (
        WorkspaceLinks[link].active &&
        (WorkspaceLinks[link].type === LinkType.GENERALIZATION ||
          WorkspaceLinks[link].iri in WorkspaceTerms)
      ) {
        const l = getNewLink(WorkspaceLinks[link].type, link);
        l.source(WorkspaceLinks[link].source);
        l.target(WorkspaceLinks[link].target);
        graph.addCell(l);
      }
    }
    console.log("Creating combinations");
    const elements = graph.getElements().map((elem) => elem.id as string);
    const powerSet = [
      ...k_combinations(elements, 3),
      ...k_combinations(elements, 4),
      ...k_combinations(elements, 5),
      ...k_combinations(elements, 6),
    ];
    const connectedSets = [];
    const connectedConns = [];
    console.log("Filtering unconnected sets");
    for (const set of powerSet.filter((set) => set.length >= 2)) {
      const links = [];
      const matrix = Array(set.length)
        .fill(999999)
        .map(() => Array(set.length).fill(999999));
      for (let i = 0; i < set.length; i++) {
        for (let j = 0; j < set.length; j++) {
          if (i === j) matrix[i][j] = 0;
          else {
            const link = graph
              .getLinks()
              .find(
                (link) =>
                  link.source().id === set[i] && link.target().id === set[j]
              );
            if (link) {
              matrix[i][j] = 1;
              links.push(link.id as string);
            }
          }
        }
      }
      for (let k = 0; k < set.length; k++) {
        for (let i = 0; i < set.length; i++) {
          for (let j = 0; j < set.length; j++) {
            if (matrix[i][j] > matrix[i][k] + matrix[k][j])
              matrix[i][j] = matrix[i][k] + matrix[k][j];
          }
        }
      }
      let add = true;
      for (let i = 0; i < set.length; i++) {
        for (let j = 0; j < set.length; j++) {
          if (i !== j && matrix[i][j] === 999999 && matrix[j][i] === 999999) {
            add = false;
          }
        }
      }
      if (add) {
        connectedSets.push(set);
        connectedConns.push(links);
      }
    }
    console.log("Creating signatures");
    const signatures: {
      count: number;
      elems: { [key: string]: { id: string; type: string } };
      conns: { [key: string]: { from: string; to: string } };
    }[] = [];
    for (const set of connectedSets) {
      const index = connectedSets.indexOf(set);
      // key = index
      const elems: { [key: string]: { id: string; type: string } } = {};
      // key = id
      const conns: { [key: string]: { from: string; to: string } } = {};
      for (const elem of set) {
        const indexElem = set.indexOf(elem);
        elems[indexElem.toString()] = {
          type: WorkspaceTerms[elem].types.find((type) =>
            RepresentationConfig[
              AppSettings.representation
            ].visibleStereotypes.includes(type)
          )!,
          id: elem,
        };
      }
      for (const links of connectedConns[index]) {
        conns[links] = {
          from: Object.keys(elems).find(
            (e) => elems[e].id === WorkspaceLinks[links].source
          )!,
          to: Object.keys(elems).find(
            (e) => elems[e].id === WorkspaceLinks[links].target
          )!,
        };
      }
      signatures.push({ elems, conns, count: 1 });
    }
    console.log("Counting occurences");
    const remove: number[] = [];
    for (const signature of signatures) {
      const index = signatures.indexOf(signature);
      for (const otherSignature of signatures) {
        const otherIndex = signatures.indexOf(otherSignature);
        if (
          otherIndex > index &&
          !remove.includes(otherIndex) &&
          _.isEqual(
            Object.values(signature.elems).map((elem) => elem.type),
            Object.values(otherSignature.elems).map((elem) => elem.type)
          ) &&
          _.isEqual(signature.conns, otherSignature.conns)
        ) {
          signature.count++;
          remove.push(otherIndex);
        }
      }
    }
    for (const num of remove.sort().reverse()) {
      signatures.splice(num, 1);
    }
    console.log("Creating patterns");
    signatures.sort((a, b) => b.count - a.count);
    for (const signature of signatures) {
      const pattern: Pattern = {
        title: `${signature.count}x repeated pattern with ${signature.elems}`,
        author: "Robot",
        description: "",
        date: new Date().toJSON(),
        terms: {},
        conns: {},
      };
      for (const term of Object.keys(signature.elems)) {
        pattern.terms[term] = {
          name: signature.elems[term].id,
          types: [signature.elems[term].type],
          parameter: true,
          optional: false,
          multiple: false,
        };
      }
      for (const conn of Object.keys(signature.conns)) {
        pattern.conns[conn] = {
          name: conn,
          to: signature.conns[conn].to,
          from: signature.conns[conn].from,
          sourceCardinality: CardinalityPool.indexOf(
            WorkspaceLinks[conn].sourceCardinality
          ).toString(10),
          targetCardinality: CardinalityPool.indexOf(
            WorkspaceLinks[conn].targetCardinality
          ).toString(10),
          linkType: WorkspaceLinks[conn].type,
        };
      }
      ret.push({
        pattern: pattern,
        use: false,
      });
    }
    return ret;
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
      show={props.open}
      onEntering={() => {
        setAlgo2Results([]);
        setAlgo2Detail(-1);
      }}
    >
      <Modal.Header>
        <Modal.Title>Generate patterns automatically</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {algo2Results.length === 0 && (
          <div>
            <p>
              This algorithm attempts to find new patterns that could be
              applied.
            </p>
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
                    <NewPatternInternalView
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
                        value={algo2Results[algo2Detail].pattern.description}
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
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setAlgo2Results(callAlgo2())}>Refresh</Button>
        <Button
          disabled={algo2Results.filter((res) => res.use).length === 0}
          onClick={() => save()}
        >
          Save patterns
        </Button>
        <Button onClick={() => props.close()}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
