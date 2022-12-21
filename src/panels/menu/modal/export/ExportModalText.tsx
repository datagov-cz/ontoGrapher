import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Representation } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Diagrams,
  Languages,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import { isElementVisible } from "../../../../function/FunctionElem";
import {
  getActiveToConnections,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
} from "../../../../function/FunctionGetVars";

interface Props {
  close: () => void;
}

export const ExportModalText: React.FC<Props> = (props: Props) => {
  const [exportLanguage, setExportLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  const saveDiagram = () => {
    const fileID = "data:text/csv;charset=utf-8,";
    const carriageReturn = "\r\n";
    const diagramTerms = Object.keys(WorkspaceElements)
      .filter(
        (iri) =>
          WorkspaceElements[iri].active &&
          !WorkspaceElements[iri].hidden[AppSettings.selectedDiagram] &&
          isElementVisible(WorkspaceTerms[iri].types, Representation.COMPACT)
      )
      .sort();
    const rowDescriptionRow =
      ["subjekt/objekt", "údaj", "typ údaje", "popis"].join(",") +
      carriageReturn;
    const source =
      fileID +
      rowDescriptionRow +
      diagramTerms
        .map((term) => {
          const termRow =
            [
              getLabelOrBlank(WorkspaceTerms[term].labels, exportLanguage),
              "",
              "",
              WorkspaceTerms[term].definitions[exportLanguage],
            ].join(",") + carriageReturn;

          const tropeRows = getIntrinsicTropeTypeIDs(term)
            .map((trope) =>
              [
                "",
                getLabelOrBlank(WorkspaceTerms[trope].labels, exportLanguage),
                getLabelOrBlank(
                  Stereotypes[parsePrefix("z-sgov-pojem", "typ-vlastnosti")]
                    .labels,
                  exportLanguage
                ),
                WorkspaceTerms[trope].definitions[exportLanguage],
              ].join(",")
            )
            .join(carriageReturn);

          const relationshipRows = getActiveToConnections(term)
            .filter((link) => WorkspaceLinks[link].iri in WorkspaceTerms)
            .map(
              (link) =>
                [
                  "",
                  getLabelOrBlank(
                    WorkspaceTerms[WorkspaceLinks[link].iri].labels,
                    exportLanguage
                  ),
                  getLabelOrBlank(
                    Stereotypes[parsePrefix("z-sgov-pojem", "typ-vztahu")]
                      .labels,
                    exportLanguage
                  ),
                  WorkspaceTerms[WorkspaceLinks[link].iri].definitions[
                    exportLanguage
                  ],
                ].join(",") +
                carriageReturn +
                [
                  "",
                  "",
                  "",
                  getLabelOrBlank(
                    WorkspaceTerms[WorkspaceLinks[link].target].labels,
                    exportLanguage
                  ),
                ].join(",")
            )
            .join(carriageReturn);

          return (
            termRow +
            tropeRows +
            relationshipRows +
            (tropeRows !== relationshipRows ? carriageReturn : "")
          );
        })
        .join(carriageReturn);
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => saveDiagram()}>
          {Locale[AppSettings.interfaceLanguage].downloadDiagramText}
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
