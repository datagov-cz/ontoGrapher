import React from "react";
import { Accordion } from "react-bootstrap";
import TableList from "../../../../components/TableList";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
} from "../../../../config/Variables";
import { isElementHidden } from "../../../../function/FunctionElem";

type Props = {
  id: string;
};

export const DetailElementDiagramCard: React.FC<Props> = (props) => {
  return (
    <Accordion.Item eventKey="2">
      <Accordion.Header>
        {Locale[AppSettings.interfaceLanguage].diagramTab}
      </Accordion.Header>
      <Accordion.Body>
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
      </Accordion.Body>
    </Accordion.Item>
  );
};
