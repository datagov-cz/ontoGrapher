import React from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
} from "../../../../config/Variables";
import { isElementHidden } from "../../../../function/FunctionElem";
import TableList from "../../../../components/TableList";

type Props = {
  id: string;
};

export const DetailElementDiagramCard: React.FC<Props> = (props) => {
  return (
    <Card>
      <Card.Header>
        <Accordion.Toggle as={Button} variant={"link"} eventKey={"2"}>
          {Locale[AppSettings.interfaceLanguage].diagramTab}
        </Accordion.Toggle>
      </Card.Header>
      <Accordion.Collapse eventKey={"2"}>
        <Card.Body>
          <TableList>
            {Object.keys(WorkspaceElements[props.id].hidden)
              .filter(
                (diag) =>
                  Diagrams[diag] &&
                  Diagrams[diag].active &&
                  !isElementHidden(props.id, diag)
              )
              .map((diag, i) => (
                <tr key={i}>
                  <td>{Diagrams[diag].name}</td>
                </tr>
              ))}
          </TableList>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};
