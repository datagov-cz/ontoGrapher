import React, { useState } from "react";
import { Modal, Tab, Tabs } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings, Diagrams } from "../../../config/Variables";
import { ExportModalImage } from "./export/ExportModalImage";
import { ExportModalText } from "./export/ExportModalText";

interface Props {
  modal: boolean;
  close: () => void;
}

export const ExportModal: React.FC<Props> = (props) => {
  const [key, setKey] = useState<string>("0");

  return (
    <Modal
      size={"lg"}
      centered
      show={props.modal}
      keyboard
      scrollable
      onEscapeKeyDown={() => props.close()}
      onEntering={() => {
        // setLanguage(AppSettings.canvasLanguage);
        // setDiagramRepresentation(AppSettings.representation);
      }}
    >
      <Modal.Header>
        <Modal.Title>
          {Locale[AppSettings.interfaceLanguage]
            .generateDiagramImageModalTitle +
            (AppSettings.selectedDiagram in Diagrams
              ? Diagrams[AppSettings.selectedDiagram].name
              : "")}
        </Modal.Title>
      </Modal.Header>
      <Tabs activeKey={key} onSelect={(k) => setKey(k!)}>
        <Tab
          eventKey="0"
          title={Locale[AppSettings.interfaceLanguage].generateDiagramImage}
        >
          <ExportModalImage close={props.close} />
        </Tab>
        <Tab
          eventKey="1"
          title={Locale[AppSettings.interfaceLanguage].generateDiagramText}
        >
          <ExportModalText close={props.close} />
        </Tab>
      </Tabs>
    </Modal>
  );
};
