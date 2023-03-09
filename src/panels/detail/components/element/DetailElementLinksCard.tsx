import React from "react";
import { Accordion } from "react-bootstrap";
import { Representation } from "../../../../config/Enum";
import { getExpressionByRepresentation } from "../../../../function/FunctionGetVars";
import ConnectionList from "../connections/ConnectionList";

type Props = {
  id: string;
  performTransaction: (...queries: string[]) => void;
  projectLanguage: string;
  infoFunction: (link: string) => void;
  freeze: boolean;
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
          freeze={props.freeze}
          id={props.id}
          projectLanguage={props.projectLanguage}
          performTransaction={props.performTransaction}
          infoFunction={(link: string) => props.infoFunction(link)}
        />
      </Accordion.Body>
    </Accordion.Item>
  );
};
