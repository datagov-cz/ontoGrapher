import React, { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import {
  AppSettings,
  Diagrams,
  Languages,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../../config/Variables";
import { graph } from "../../../graph/Graph";
import * as joint from "jointjs";
import {
  getLinkOrVocabElem,
  getNewLink,
} from "../../../function/FunctionGetVars";
import { ColorPool } from "../../../config/visual/ColorPool";
import { drawGraphElement } from "../../../function/FunctionDraw";
import {
  nameGraphLink,
  setRepresentation,
} from "../../../function/FunctionGraph";
import { Representation } from "../../../config/Enum";

interface Props {
  modal: boolean;
  close: () => void;
}

enum saveBehaviourEnum {
  PREVIEW,
  DOWNLOAD,
}

const saveBehaviour: { [key: number]: (source: string) => void } = {
  [saveBehaviourEnum.PREVIEW]: (source) => {
    const imageElement = document.getElementById(
      "imagePreview"
    ) as HTMLImageElement;
    imageElement!.src = source;
    imageElement!.alt = "Diagram " + Diagrams[AppSettings.selectedDiagram].name;
  },
  [saveBehaviourEnum.DOWNLOAD]: (source) => {
    const linkElement = document.createElement("a");
    linkElement.href = source;
    linkElement.download = Diagrams[AppSettings.selectedDiagram].name;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  },
};

const changeLanguage: (language: string) => void = (language) => {
  graph.getElements().forEach((cell) => {
    if (WorkspaceElements[cell.id]) {
      drawGraphElement(cell, language, AppSettings.representation);
    }
  });
  graph.getLinks().forEach((cell) => {
    if (WorkspaceLinks[cell.id]) {
      nameGraphLink(
        cell,
        getLinkOrVocabElem(WorkspaceLinks[cell.id].iri).labels,
        language
      );
    }
  });
};

export const SaveDiagramsModal: React.FC<Props> = (props) => {
  const [blackWhiteSwitch, setBlackWhiteSwitch] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>(
    AppSettings.selectedLanguage
  );
  const [diagramRepresentation, setDiagramRepresentation] = useState<number>(
    AppSettings.representation
  );
  const [format, setFormat] = useState<string>("PNG");

  const saveDiagram: (behaviour: saveBehaviourEnum) => void = (
    behaviour: saveBehaviourEnum
  ) => {
    // A Paper is to a Graph what a View is to a Model.
    // This function creates a new Paper, sets its size to the contents inside, and pulls the SVG of the paper.

    // The paper object requires a <div> to put it in, and the div additionally needs to be rendered in order to prevent
    // any visual discrepancies in the resulting SVG.
    const paperElement = document.createElement("div");
    document.body.appendChild(paperElement);
    const paper = new joint.dia.Paper({
      el: paperElement,
      model: graph,
      gridSize: 1,
      linkPinning: false,
      clickThreshold: 0,
      async: false,
      background: { color: "#FFFFFF" },
      sorting: joint.dia.Paper.sorting.APPROX,
      connectionStrategy: joint.connectionStrategies.pinAbsolute,
      defaultConnectionPoint: {
        name: "boundary",
        args: { sticky: true, selector: "bodyBox" },
      },
      defaultLink: function () {
        return getNewLink();
      },
    });
    if (language !== AppSettings.selectedLanguage) {
      changeLanguage(language);
    }
    if (diagramRepresentation !== AppSettings.representation) {
      setRepresentation(diagramRepresentation, true, false);
    }
    // The paper is resized to the area of the content within.
    const area = paper.getContentArea({ useModelGeometry: false });
    paper.fitToContent({
      padding: 0,
      allowNewOrigin: "any",
      allowNegativeBottomRight: true,
      contentArea: area,
    });
    const serializer = new XMLSerializer();
    const svg = paper.svg.cloneNode(true) as Element;
    // The original SVG has width and height as 100%, which is unsuitable for our use case.
    svg.setAttribute("width", String(area.width));
    svg.setAttribute("height", String(area.height));
    svg.setAttribute("viewbox", `0 0 ${area.width} ${area.height}`);
    let svgText = serializer.serializeToString(svg);
    if (blackWhiteSwitch) {
      svgText = svgText.replaceAll(
        new RegExp(
          `(${ColorPool[AppSettings.viewColorPool].colors.join(")|(")})`,
          "ig"
        ),
        "#FFFFFF"
      );
    }
    const blob = new Blob([svgText], {
      type: "image/svg+xml;utf-8,",
    });
    const url = URL.createObjectURL(blob);
    let image = new Image();
    image.width = area.width;
    image.height = area.height;
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = area.width;
      canvas.height = area.height;
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0);
      let data = "";
      if (format === "PNG") data += canvas.toDataURL();
      if (format === "SVG")
        data += `data:image/svg+xml;base64,${btoa(
          unescape(encodeURIComponent(svgText))
        )}`;
      saveBehaviour[behaviour](data);
      if (language !== AppSettings.selectedLanguage) {
        changeLanguage(AppSettings.selectedLanguage);
      }
      if (diagramRepresentation !== AppSettings.representation) {
        setRepresentation(AppSettings.representation, true, false);
      }
    };
    image.src = url;
    document.body.removeChild(paperElement);
  };
  return (
    <Modal
      size={"lg"}
      centered
      show={props.modal}
      keyboard
      scrollable
      onEscapeKeyDown={() => props.close()}
      onEntering={() => {
        setLanguage(AppSettings.selectedLanguage);
        setDiagramRepresentation(AppSettings.representation);
      }}
    >
      <Modal.Header>
        <Modal.Title>
          {Locale[AppSettings.viewLanguage].generateDiagramImageModalTitle +
            Diagrams[AppSettings.selectedDiagram].name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>{Locale[AppSettings.viewLanguage].settings}</h5>
        <Form>
          <Form.Group as={Row} className="mb-3" controlId="formLanguage">
            <Form.Label column sm="2">
              {Locale[AppSettings.viewLanguage].language}
            </Form.Label>
            <Col sm="10">
              <Form.Control
                as="select"
                size={"sm"}
                value={language}
                onChange={(event) => setLanguage(event.currentTarget.value)}
              >
                {Object.keys(Languages).map((languageCode) => (
                  <option key={languageCode} value={languageCode}>
                    {Languages[languageCode]}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formRepresentation">
            <Form.Label column sm="2">
              {Locale[AppSettings.viewLanguage].representation}
            </Form.Label>
            <Col sm="10">
              <Form.Control
                as="select"
                size={"sm"}
                value={diagramRepresentation}
                onChange={(event) =>
                  setDiagramRepresentation(
                    parseInt(event.currentTarget.value, 10)
                  )
                }
              >
                <option key={1} value={Representation.FULL}>
                  {Locale[AppSettings.viewLanguage].representationFull}
                </option>
                <option key={2} value={Representation.COMPACT}>
                  {Locale[AppSettings.viewLanguage].representationCompact}
                </option>
              </Form.Control>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formFormat">
            <Form.Label column sm="2">
              {Locale[AppSettings.viewLanguage].format}
            </Form.Label>
            <Col sm="10">
              <Form.Control
                as="select"
                size={"sm"}
                value={format}
                onChange={(event) => setFormat(event.currentTarget.value)}
              >
                <option key={1} value={"PNG"}>
                  {"PNG"}
                </option>
                <option key={2} value={"SVG"}>
                  {"SVG"}
                </option>
              </Form.Control>
            </Col>
          </Form.Group>
          <Form.Check
            type={"checkbox"}
            label={
              Locale[AppSettings.viewLanguage]
                .generateDiagramImageInBlackAndWhite
            }
            checked={blackWhiteSwitch}
            id={"blackWhiteCheckbox"}
            onChange={(event) =>
              setBlackWhiteSwitch(event.currentTarget.checked)
            }
          />
        </Form>
        <br />
        <h5>{Locale[AppSettings.viewLanguage].preview}</h5>
        <img id={"imagePreview"} alt={""} />
        {graph.getElements().length === 0 && (
          <Alert variant="danger">
            {Locale[AppSettings.viewLanguage].generateDiagramNoElementsError}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={graph.getElements().length === 0}
          onClick={() => saveDiagram(saveBehaviourEnum.PREVIEW)}
        >
          {Locale[AppSettings.viewLanguage].previewDiagramImage}
        </Button>
        <Button
          disabled={graph.getElements().length === 0}
          onClick={() => saveDiagram(saveBehaviourEnum.DOWNLOAD)}
        >
          {Locale[AppSettings.viewLanguage].downloadDiagramImage}
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => {
            props.close();
          }}
        >
          {Locale[AppSettings.viewLanguage].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
