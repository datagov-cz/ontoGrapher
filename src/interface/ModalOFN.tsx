import { Button, Form, ListGroup, Modal } from "react-bootstrap";
import { Locale } from "../config/Locale";
import { AppSettings, WorkspaceVocabularies } from "../config/Variables";
import { getLabelOrBlank } from "../function/FunctionGetVars";
import { loadOFNVocabulary, saveOFNVocabulary } from "./OFNInterface";
import { useState } from "react";

interface Props {
  open: boolean;
  close: () => void;
  selectedLanguage: string;
}
// TODO: localization
export const ModalOFN: React.FC<Props> = (props: Props) => {
  const [files, setFiles] = useState<FileList | null>(null);
  return (
    <Modal
      centered
      scrollable
      show={props.open}
      onHide={props.close}
      keyboard
      onEscapeKeyDown={props.close}
    >
      <Modal.Header>
        <Modal.Title>Nabídka OFN slovníky</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formFileMultiple" className="mb-3">
          <Form.Label>Načtení OFN slovníků</Form.Label>
          <Form.Control
            type="file"
            id="multipleFileInput"
            multiple
            onChange={(event) =>
              setFiles((event.target as HTMLInputElement).files)
            }
          />
        </Form.Group>
        <Button
          onClick={() => {
            if (files) {
              for (const file of files) {
                loadOFNVocabulary(file);
              }
            }
          }}
          variant="primary"
        >
          {Locale[AppSettings.interfaceLanguage].confirm}
        </Button>
        <hr />
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Stažení OFN slovníků</Form.Label>
          <ListGroup>
            {Object.keys(WorkspaceVocabularies)
              .filter((t) => !!!WorkspaceVocabularies[t].readOnly)
              .sort()
              .map((t) => (
                <ListGroup.Item
                  action
                  variant="light"
                  key={t}
                  onClick={(event) => {
                    event.preventDefault();
                    const blob = saveOFNVocabulary(t);
                    const linkElement = document.createElement("a");
                    linkElement.href = window.URL.createObjectURL(blob);
                    linkElement.download =
                      getLabelOrBlank(
                        WorkspaceVocabularies[t].labels,
                        props.selectedLanguage
                      ) + `.ttl`;
                    document.body.appendChild(linkElement);
                    linkElement.click();
                    document.body.removeChild(linkElement);
                  }}
                >
                  {getLabelOrBlank(
                    WorkspaceVocabularies[t].labels,
                    props.selectedLanguage
                  )}
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.close} variant="secondary">
          {Locale[AppSettings.interfaceLanguage].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
