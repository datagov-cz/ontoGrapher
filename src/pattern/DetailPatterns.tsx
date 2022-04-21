import React from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import TableList from "../components/TableList";
import { searchPatterns } from "./PatternQueries";
import { Patterns } from "./PatternTypes";

type Props = {
  iri: string;
};

//TODO: locale
//TODO: map keys
export const DetailPatterns: React.FC<Props> = (props: Props) => {
  return (
    <div className={"accordions"}>
      <Accordion defaultActiveKey={props.iri in Patterns ? "0" : "1"}>
        {props.iri in Patterns && (
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
                Pattern Detail
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={"0"}>
              <Card.Body>
                <h3>{Patterns[props.iri].title}</h3>
                <h5>by {Patterns[props.iri].author}</h5>
                <br />
                <h4>Arguments</h4>
                <TableList>
                  {Array.from(Patterns[props.iri].arguments).map((arg) => (
                    <tr>
                      <td>{arg.name}</td>
                      <td>{arg.type}</td>
                    </tr>
                  ))}
                </TableList>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        )}
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
