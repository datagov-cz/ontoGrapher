import React, { useState } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import TableList from "../components/TableList";
import { Patterns } from "./PatternTypes";
import { InstanceStructureModal } from "./InstanceStructureModal";

type Props = {
  id: string;
};

export const DetailInstance: React.FC<Props> = (props: Props) => {
  const [internalViewModal, setInternalViewModal] = useState<boolean>(false);
  const getParametersAndArguments = () => {};
  return (
    <div className={"accordions"}>
      <h3>{Patterns[props.id].title}</h3>
      <h5>by {Patterns[props.id].author}</h5>
      <Accordion defaultActiveKey={"0"}>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
              Details
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"0"}>
            <Card.Body>
              <Button onClick={() => setInternalViewModal(true)}>
                View internal structure
              </Button>
              <br />
              <h4>Parameters</h4>
              <TableList headings={["argument", "value"]}></TableList>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <InstanceStructureModal
        open={internalViewModal}
        close={() => setInternalViewModal(false)}
        instanceID={props.id}
      />
    </div>
  );
};
