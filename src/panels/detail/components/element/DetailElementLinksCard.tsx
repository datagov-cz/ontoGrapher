import React from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import ConnectionList from "../connections/ConnectionList";
import { getExpressionByRepresentation } from "../../../../function/FunctionGetVars";
import { Representation } from "../../../../config/Enum";

type Props = {
  id: string;
  performTransaction: (...queries: string[]) => void;
  projectLanguage: string;
};

export const DetailElementLinksCard: React.FC<Props> = (props) => {
  return (
    <Card>
      <Card.Header>
        <Accordion.Header as={Button} variant={"link"} eventKey={"1"}>
          {getExpressionByRepresentation({
            [Representation.FULL]: "links",
            [Representation.COMPACT]: "relationships",
          })}
        </Accordion.Header>
      </Card.Header>
      <Accordion.Collapse eventKey={"1"}>
        <Card.Body>
          <ConnectionList
            id={props.id}
            projectLanguage={props.projectLanguage}
            performTransaction={props.performTransaction}
          />
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};
