import AddIcon from "@mui/icons-material/Add";
import classNames from "classnames";
import React, { useState } from "react";
import { Representation } from "../../../config/Enum";
import { Locale } from "../../../config/Locale";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../../config/Variables";
import { addDiagram } from "../../../function/FunctionCreateVars";
import ModalRemoveDiagram from "../../../panels/modal/ModalRemoveDiagram";
import { updateCreateDiagram } from "../../../queries/update/UpdateDiagramQueries";
import { DiagramManagerListItem } from "./DiagramManagerListItem";

interface Props {
  diagrams: string[];
  performTransaction: (...queries: string[]) => void;
  projectLanguage: string;
  update: () => void;
  selectDiagram: (diagram: string) => void;
  selectedDiagram: string;
}

export const DiagramManagerDiagrams: React.FC<Props> = (props: Props) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const [modalRemoveDiagram, setModalRemoveDiagram] = useState<string>("");

  return (
    <div className="diagramList">
      {props.diagrams.map((diag) => (
        <DiagramManagerListItem
          key={diag}
          diagram={diag}
          selected={props.selectedDiagram === diag}
          performTransaction={props.performTransaction}
          update={props.update}
          selectDiagram={props.selectDiagram}
          openRemoveDiagram={() => setModalRemoveDiagram(diag)}
        />
      ))}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          const id = addDiagram(
            Locale[AppSettings.interfaceLanguage].untitled,
            true,
            Representation.COMPACT
          );
          Diagrams[id].saved = true;
          Object.keys(WorkspaceElements).forEach(
            (elem) => (WorkspaceElements[elem].hidden[id] = true)
          );
          Object.keys(WorkspaceLinks).forEach(
            (link) => (WorkspaceLinks[link].vertices[id] = [])
          );
          props.performTransaction(updateCreateDiagram(id));
          props.update();
        }}
        className={classNames("diagramListItem", "bottom", {
          hovered: hovered,
        })}
      >
        <div className="top">
          <span className="left">
            <span className="name">
              <i>{Locale[AppSettings.interfaceLanguage].createDiagram}</i>
            </span>
          </span>
          <span className="options">
            <AddIcon />
          </span>
        </div>
      </div>
      <ModalRemoveDiagram
        modal={modalRemoveDiagram.length > 0}
        diagram={modalRemoveDiagram}
        close={() => setModalRemoveDiagram("")}
        update={() => {
          setModalRemoveDiagram("");
          props.update();
        }}
        performTransaction={props.performTransaction}
      />
    </div>
  );
};
