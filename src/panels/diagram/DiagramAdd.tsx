import React from "react";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { addDiagram } from "../../function/FunctionCreateVars";
import { updateCreateDiagram } from "../../queries/update/UpdateDiagramQueries";

interface Props {
  update: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {}

export default class DiagramAdd extends React.Component<Props, State> {
  addDiagram() {
    const index =
      Diagrams.push(addDiagram(Locale[AppSettings.viewLanguage].untitled)) - 1;
    Object.keys(WorkspaceElements).forEach(
      (elem) => (WorkspaceElements[elem].hidden[index] = true)
    );
    Object.keys(WorkspaceLinks).forEach(
      (link) => (WorkspaceLinks[link].vertices[index] = [])
    );
    this.props.performTransaction(updateCreateDiagram(index));
    this.props.update();
  }

  render() {
    return (
      <div className={"diagramTab"}>
        <button
          className={"buttonlink nounderline"}
          onClick={() => {
            this.addDiagram();
          }}
        >
          <span role="img" aria-label={""}>
            ➕
          </span>
        </button>
      </div>
    );
  }
}
