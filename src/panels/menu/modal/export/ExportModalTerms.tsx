import React, { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { Locale } from "../../../../config/Locale";
import { AppSettings, Diagrams, Languages } from "../../../../config/Variables";
import { exportTermsCSV } from "./ExportTermsCSV";
import { exportTermsText } from "./ExportTermsText";

interface Props {
  close: () => void;
}

enum ExportType {
  CSV,
  TEXT,
}

enum Status {
  IDLE,
  LOADING,
  ERROR,
}

var ExportFunction: {
  [key: number]: (language: string) => Promise<[source: string, error: string]>;
} = {
  [ExportType.CSV]: exportTermsCSV,
  [ExportType.TEXT]: exportTermsText,
};

export const ExportModalTerms: React.FC<Props> = (props: Props) => {
  const [exportLanguage, setExportLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );
  const [exportType, setExportType] = useState<ExportType>(ExportType.CSV);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<string>("");

  const saveDiagram = async () => {
    setStatus(Status.LOADING);
    setError("");
    const [source, err] = await ExportFunction[exportType](exportLanguage);
    if (err) {
      setStatus(Status.ERROR);
      setError(err);
      return;
    }
    const linkElement = document.createElement("a");
    linkElement.href = source;
    linkElement.download = Diagrams[AppSettings.selectedDiagram].name;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    setStatus(Status.IDLE);
  };

  return (
    <div>
      <Modal.Body>
        <Form>
          <Form.Group as={Row} className="mb-3" controlId="formLanguage">
            <Form.Label column sm="2">
              {Locale[AppSettings.interfaceLanguage].language}
            </Form.Label>
            <Col sm="10">
              <Form.Control
                as="select"
                size={"sm"}
                value={exportLanguage}
                onChange={(event) =>
                  setExportLanguage(event.currentTarget.value)
                }
              >
                {Object.keys(Languages).map((languageCode) => (
                  <option key={languageCode} value={languageCode}>
                    {Languages[languageCode]}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formType">
            <Form.Label column sm="2">
              {Locale[AppSettings.interfaceLanguage].generateDiagramListType}
            </Form.Label>
            <Col sm="10">
              <Form.Control
                as="select"
                size={"sm"}
                value={exportType}
                onChange={(event) =>
                  setExportType(parseInt(event.currentTarget.value, 10))
                }
              >
                <option key={0} value={ExportType.CSV}>
                  CSV
                </option>
                <option key={1} value={ExportType.TEXT}>
                  Text
                </option>
              </Form.Control>
            </Col>
          </Form.Group>
        </Form>
        {exportType === ExportType.CSV && (
          <Alert variant="warning">
            Tento typ exportu vynechává pojmy, které nemají typový stereotyp.
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={status === Status.LOADING}
          onClick={() => saveDiagram()}
        >
          {status !== Status.LOADING &&
            Locale[AppSettings.interfaceLanguage].downloadDiagramList}
          {status === Status.LOADING && (
            <span>
              <Spinner
                as="span"
                size="sm"
                variant="light"
                animation={"border"}
              />{" "}
              {Locale[AppSettings.interfaceLanguage].loading}
            </span>
          )}
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => {
            props.close();
          }}
        >
          {Locale[AppSettings.interfaceLanguage].close}
        </Button>
      </Modal.Footer>
    </div>
  );
};
