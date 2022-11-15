import { Close, Delete, Edit } from "@mui/icons-material";
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
    changeDiagrams(this.props.diagram);
    this.props.update();
    AppSettings.selectedLinks = [];
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
        {Diagrams[this.props.diagram].name}
        {/* TODO: i18n */}
        <Dropdown bsPrefix="displayInline">
          <Dropdown.Toggle bsPrefix="plainButton" id="diagram-dropdown">
            <MoreVertIcon />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            //TODO: i18n this
            <Dropdown.Item
              onClick={() => this.props.closeDiagram(this.props.diagram)}
            >
              <IconText text="Zavřít" icon={Close} />
            </Dropdown.Item>
            //TODO: add rename dialogue
            <Dropdown.Item
              onClick={() => this.props.renameDiagram(this.props.diagram)}
            >
              <IconText text="Přejmenovat" icon={Edit} />
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => this.props.deleteDiagram(this.props.diagram)}
            >
              <IconText text="Smazat" icon={Delete} />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
