import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React from "react";
import { Dropdown } from "react-bootstrap";
import { IconText } from "../../components/IconText";
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

export default class DiagramTab extends React.Component<Props> {
  changeDiagram() {
    if (this.props.diagram !== AppSettings.selectedDiagram) {
      changeDiagrams(this.props.diagram);
      this.props.update();
      AppSettings.selectedLinks = [];
    }
  }

  render() {
    return (
      <div
        className={
          "diagramTab" +
          (this.props.diagram === AppSettings.selectedDiagram
            ? " selected"
            : "")
        }
        onClick={() => this.changeDiagram()}
      >
        <span className="diagramText">
          {Diagrams[this.props.diagram].name}&nbsp;
        </span>
        {/* TODO: i18n */}
        <Dropdown className="displayInline">
          <Dropdown.Toggle className="plainButton" variant="secondary">
            <MoreVertIcon />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => this.props.closeDiagram(this.props.diagram)}
            >
              <IconText text="Zavřít" icon={CloseIcon} />
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => this.props.renameDiagram(this.props.diagram)}
            >
              <IconText text="Přejmenovat" icon={EditIcon} />
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => this.props.deleteDiagram(this.props.diagram)}
            >
              <IconText text="Smazat" icon={DeleteIcon} />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
