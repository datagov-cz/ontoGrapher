import React from "react";
import { AppSettings, Diagrams } from "../../config/Variables";
import { changeDiagrams } from "../../function/FunctionDiagram";
import InlineEdit, { InputType } from "riec";
import { updateDiagram } from "../../queries/update/UpdateDiagramQueries";

interface Props {
  diagram: number;
  update: Function;
  deleteDiagram: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {}

export default class DiagramTab extends React.Component<Props, State> {
  changeDiagram() {
    changeDiagrams(this.props.diagram);
    this.props.update();
    AppSettings.selectedLink = "";
  }

  handleChangeDiagramName(value: string) {
    if (value.length > 0) {
      Diagrams[this.props.diagram].name = value;
      this.props.performTransaction(updateDiagram(this.props.diagram));
      this.forceUpdate();
      this.props.update();
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
        {this.props.diagram === AppSettings.selectedDiagram ? (
          <InlineEdit
            viewClass={"rieinput"}
            value={
              Diagrams[this.props.diagram].name.length > 0
                ? Diagrams[this.props.diagram].name
                : "<blank>"
            }
            onChange={(value: string) => {
              this.handleChangeDiagramName(value);
            }}
            type={InputType.Text}
          />
        ) : (
          Diagrams[this.props.diagram].name
        )}
        {Diagrams.filter((diag) => diag.active).length > 1 && (
          <button
            className={"buttonlink"}
            onClick={(evt) => {
              evt.stopPropagation();
              this.props.deleteDiagram(this.props.diagram);
            }}
          >
            <span role="img" aria-label={""}>
              &nbsp;❌
            </span>
          </button>
        )}
      </div>
    );
  }
}
