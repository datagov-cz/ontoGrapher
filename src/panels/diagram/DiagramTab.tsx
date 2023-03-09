import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React from "react";
import { Dropdown } from "react-bootstrap";
import { IconText } from "../../components/IconText";
import { MainViewMode } from "../../config/Enum";
import { StoreSettings } from "../../config/Store";
import { AppSettings, Diagrams } from "../../config/Variables";
import { changeDiagrams } from "../../function/FunctionDiagram";

interface Props {
  diagram: string;
  update: Function;
  deleteDiagram: Function;
  renameDiagram: Function;
  closeDiagram: Function;
  performTransaction: (...queries: string[]) => void;
}

export const DiagramTab: React.FC<Props> = (props: Props) => {
  const changeDiagram = () => {
    if (props.diagram !== AppSettings.selectedDiagram) {
      StoreSettings.update((s) => {
        s.mainViewMode = MainViewMode.CANVAS;
      });
      changeDiagrams(props.diagram);
      props.update();
      AppSettings.selectedLinks = [];
    }
  };

  return (
    <div
      className={
        "diagramTab" +
        (props.diagram === AppSettings.selectedDiagram ? " selected" : "")
      }
      onClick={() => changeDiagram()}
    >
      <span className="diagramText">{Diagrams[props.diagram].name}&nbsp;</span>
      <Dropdown
        className="displayInline"
        onClick={(evt) => evt.stopPropagation()}
      >
        <Dropdown.Toggle className="plainButton" variant="secondary">
          <MoreVertIcon />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => props.closeDiagram(props.diagram)}>
            <IconText text="Zavřít" icon={CloseIcon} />
          </Dropdown.Item>
          <Dropdown.Item onClick={() => props.renameDiagram(props.diagram)}>
            <IconText text="Přejmenovat" icon={EditIcon} />
          </Dropdown.Item>
          <Dropdown.Item onClick={() => props.deleteDiagram(props.diagram)}>
            <IconText text="Smazat" icon={DeleteIcon} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
