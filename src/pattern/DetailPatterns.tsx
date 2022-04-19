import React from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import TableList from "../components/TableList";
import { searchPatterns } from "./PatternQueries";

type Props = {};

export const DetailPatterns: React.FC = (props: Props) => {
  return (
    <div className={"accordions"}>
      <Accordion defaultActiveKey={"0"}>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
              Pattern Detail
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"0"}>
            <Card.Body>
              <h3></h3>
              <TableList></TableList>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant={"link"} eventKey={"1"}>
              Pattern Finder
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"1"}>
            <Card.Body>
              <div>
                <Button onClick={() => searchPatterns()}>Refresh list</Button>
              </div>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant={"link"} eventKey={"2"}>
              Pattern Algorithms
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"2"}>
            <Card.Body>
              <p />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </div>
  );
};
