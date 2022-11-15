import React, { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { Button, InputGroup } from "react-bootstrap";
import { IconText } from "../../components/IconText";
import { Diagrams } from "../../config/Variables";
import { Edit, Close } from "@mui/icons-material";
import {
  updateCreateDiagram,
  updateDiagram,
} from "../../queries/update/UpdateDiagramQueries";

type Props = {
  diagram: string;
  modal: boolean;
  close: () => void;
  update: () => void;
  performTransaction: (...queries: string[]) => void;
};

const formInputID = "modalRenameDiagramInput";

export const ModalRenameDiagram: React.FC<Props> = (props: Props) => {
  const [diagramName, setDiagramName] = useState<string>("");

  const renameDiagram: () => void = () => {
    if (diagramName.length > 0) {
      const queries = [];
      Diagrams[props.diagram].name = diagramName;
      if (!Diagrams[props.diagram].saved) {
        Diagrams[props.diagram].saved = true;
        queries.push(updateCreateDiagram(props.diagram));
      }
      queries.push(updateDiagram(props.diagram));
      props.performTransaction(...queries);
      props.update();
    } else
      console.warn(
        `Attemted to rename diagram ${props.diagram} to an empty string.`
      );
  };

  return (
    <Modal
      centered
      show={props.modal}
      keyboard
      onEscapeKeyDown={() => props.close()}
      onEntering={() => {
        setDiagramName(Diagrams[props.diagram].name);
        const elem = document.getElementById(formInputID);
        if (elem) elem.focus();
      }}
    >
      {/* TODO: i18n */}
      <Modal.Header>
        <Modal.Title>
          Přejmenovat diagram{" "}
          {props.diagram in Diagrams && Diagrams[props.diagram].name}
        </Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <InputGroup hasValidation>
            <Form.Control
              required
              type="text"
              value={diagramName}
              onChange={(evt) => setDiagramName(evt.currentTarget.value)}
            />
            <Form.Control.Feedback type="invalid">
              Prosíme, vyberte název.
            </Form.Control.Feedback>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            bsPrefix="iconButton"
            onClick={() => {
              renameDiagram();
              props.close();
            }}
          >
            <IconText text="Přejmenovat" icon={Edit} />
          </Button>
          <Button
            bsPrefix="iconButton"
            onClick={() => {
              props.close();
            }}
          >
            <IconText text="Zavřít" icon={Close} />
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
