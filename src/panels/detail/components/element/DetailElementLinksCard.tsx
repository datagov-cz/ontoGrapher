import React from "react";
import { Accordion } from "react-bootstrap";
import { Representation } from "../../../../config/Enum";
import { getExpressionByRepresentation } from "../../../../function/FunctionGetVars";
import ConnectionList from "../connections/ConnectionList";

type Props = {
  id: string;
  performTransaction: (...queries: string[]) => void;
  projectLanguage: string;
};

export const DetailElementLinksCard: React.FC<Props> = (props) => {
  return (
    <Accordion.Item eventKey="1">
      <Accordion.Header>
        {getExpressionByRepresentation({
          [Representation.FULL]: "links",
          [Representation.COMPACT]: "relationships",
        })}
      </Accordion.Header>
      <Accordion.Body>
        <ConnectionList
          id={props.id}
          projectLanguage={props.projectLanguage}
          performTransaction={props.performTransaction}
        />
      </Accordion.Body>
    </Accordion.Item>
  );
};
