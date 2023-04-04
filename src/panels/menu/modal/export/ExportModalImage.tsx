import * as joint from "jointjs";
import React, { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Representation } from "../../../../config/Enum";
import { Languages } from "../../../../config/Languages";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../../../config/Variables";
import { ColorPool } from "../../../../config/visual/ColorPool";
import { drawGraphElement } from "../../../../function/FunctionDraw";
import {
  getLinkOrVocabElem,
  getNewLink,
} from "../../../../function/FunctionGetVars";
import {
  nameGraphLink,
  setRepresentation,
} from "../../../../function/FunctionGraph";
import { graph } from "../../../../graph/Graph";

interface Props {
  close: () => void;
}

enum saveBehaviorEnum {
  PREVIEW,
  DOWNLOAD,
}

const saveBehavior: { [key: number]: (source: string) => void } = {
  [saveBehaviorEnum.PREVIEW]: (source) => {
    const imageElement = document.getElementById(
      "imagePreview"
    ) as HTMLImageElement;
    imageElement!.src = source;
    imageElement!.alt = "Diagram " + Diagrams[AppSettings.selectedDiagram].name;
  },
  [saveBehaviorEnum.DOWNLOAD]: (source) => {
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

export const ExportModalImage: React.FC<Props> = (props: Props) => {
  const [blackWhiteSwitch, setBlackWhiteSwitch] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>(AppSettings.canvasLanguage);
  const [diagramRepresentation, setDiagramRepresentation] = useState<number>(
    AppSettings.representation
  );
  const [iriData, setIRIData] = useState<boolean>(false);
  const [format, setFormat] = useState<string>("PNG");

  const saveDiagram: (behavior: saveBehaviorEnum) => void = (
    behavior: saveBehaviorEnum
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
    if (language !== AppSettings.canvasLanguage) {
      changeLanguage(language);
    }
    if (diagramRepresentation !== AppSettings.representation) {
      setRepresentation(
        diagramRepresentation,
        AppSettings.selectedDiagram,
        true,
        false
      );
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
    if (format === "SVG" && iriData) {
      svg.setAttribute(
        "data-ontographer-view",
        Representation[diagramRepresentation].toLowerCase()
      );
      const termElements = svg.getElementsByClassName("joint-element");
      for (const index in graph.getElements()) {
        const element = termElements[index];
        const id = element.getAttribute("model-id");
        if (element && id) {
          termElements[index].setAttribute("data-ontographer-iri", id);
        }
      }
      const linkElements = svg.getElementsByClassName("joint-link");
      for (const index in graph.getLinks()) {
        const element = linkElements[index];
        const id = element.getAttribute("model-id");
        if (element && id) {
          linkElements[index].setAttribute("data-ontographer-iri", id);
        }
      }
    }
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
      saveBehavior[behavior](data);
      if (language !== AppSettings.canvasLanguage) {
        changeLanguage(AppSettings.canvasLanguage);
      }
      if (diagramRepresentation !== AppSettings.representation) {
        setRepresentation(
          AppSettings.representation,
          AppSettings.selectedDiagram,
          true,
          false
        );
      }
    };
    image.src = url;
    document.body.removeChild(paperElement);
  };

  return (
    <div>
      <Modal.Body>
        <h5>{Locale[AppSettings.interfaceLanguage].settings}</h5>
        <Form>
          <Form.Group as={Row} className="mb-3" controlId="formLanguage">
            <Form.Label column sm="2">
              {Locale[AppSettings.interfaceLanguage].language}
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
              {Locale[AppSettings.interfaceLanguage].representation}
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
                  {Locale[AppSettings.interfaceLanguage].representationFull}
                </option>
                <option key={2} value={Representation.COMPACT}>
                  {Locale[AppSettings.interfaceLanguage].representationCompact}
                </option>
              </Form.Control>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formFormat">
            <Form.Label column sm="2">
              {Locale[AppSettings.interfaceLanguage].format}
            </Form.Label>
            <Col sm="10">
              <Form.Control
                as="select"
                size={"sm"}
                value={format}
                onChange={(event) => {
                  setFormat(event.currentTarget.value);
                  if (event.currentTarget.value === "PNG") setIRIData(false);
                }}
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
              Locale[AppSettings.interfaceLanguage]
                .generateDiagramImageInBlackAndWhite
            }
            checked={blackWhiteSwitch}
            id={"blackWhiteCheckbox"}
            onChange={(event) =>
              setBlackWhiteSwitch(event.currentTarget.checked)
            }
          />
          <Form.Check
            disabled={format !== "SVG"}
            type={"checkbox"}
            label={
              Locale[AppSettings.interfaceLanguage]
                .generateDiagramImageWithIRIData
            }
            checked={iriData}
            id={"setIRIcheckbox"}
            onChange={(event) => setIRIData(event.currentTarget.checked)}
          />
        </Form>
        <br />
        <h5>{Locale[AppSettings.interfaceLanguage].preview}</h5>
        <img id={"imagePreview"} alt={""} />
        {graph.getElements().length === 0 && (
          <Alert variant="danger">
            {
              Locale[AppSettings.interfaceLanguage]
                .generateDiagramNoElementsError
            }
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={graph.getElements().length === 0}
          onClick={() => saveDiagram(saveBehaviorEnum.PREVIEW)}
        >
          {Locale[AppSettings.interfaceLanguage].previewDiagramImage}
        </Button>
        <Button
          disabled={graph.getElements().length === 0}
          onClick={() => saveDiagram(saveBehaviorEnum.DOWNLOAD)}
        >
          {Locale[AppSettings.interfaceLanguage].downloadDiagramImage}
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
