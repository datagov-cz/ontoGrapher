import React from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import TableList from "../components/TableList";
import { Argument, Instances, Patterns } from "./PatternTypes";

type Props = {
  id: string;
};

//TODO: locale
//TODO: element map keys
export const DetailInstance: React.FC<Props> = (props: Props) => {
  const getListOfArgumentsAndParameters: () => {
    argument: Argument;
    parameter: string;
  }[] = () => {
    const args = Array.from(Patterns[Instances[props.id].iri].arguments);
    const parameters = Array.from(Instances[props.id].parameters);
    const ret: {
      argument: Argument;
      parameter: string;
    }[] = [];
    for (const num in parameters)
      ret.push({ argument: args[num], parameter: parameters[num] });
    return ret;
  };

  return (
    <div className={"accordions"}>
      <Accordion defaultActiveKey={"0"}>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
              Details
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"0"}>
            <Card.Body>
              <h3>{Patterns[props.id].title}</h3>
              <h5>by {Patterns[props.id].author}</h5>
              <Button>View internal structure</Button>
              <Button>Edit</Button>
              <br />
              <h4>Parameters</h4>
              <TableList headings={["argument", "value"]}>
                {Array.from(getListOfArgumentsAndParameters()).map((ret) => (
                  <tr>
                    <td>{ret.argument.name}</td>
                    <td>{ret.parameter}</td>
                  </tr>
                ))}
              </TableList>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant={"link"} eventKey={"1"}>
              Pattern Statistics
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"1"}>
            <Card.Body>
              <p />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </div>
  );
};
