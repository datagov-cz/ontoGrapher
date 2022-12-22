import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
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

var ExportFunction = {
  [ExportType.CSV]: exportTermsCSV,
  [ExportType.TEXT]: exportTermsText,
};

export const ExportModalTerms: React.FC<Props> = (props: Props) => {
  const [exportLanguage, setExportLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  const [exportType, setExportType] = useState<ExportType>(ExportType.CSV);

  const saveDiagram = () => {
    const source = ExportFunction[exportType](exportLanguage);
    // console.log(source);
    const linkElement = document.createElement("a");
    linkElement.href = source;
    linkElement.download = Diagrams[AppSettings.selectedDiagram].name;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
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
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => saveDiagram()}>
          {Locale[AppSettings.interfaceLanguage].downloadDiagramList}
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
