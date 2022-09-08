import React from "react";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { addDiagram } from "../../function/FunctionCreateVars";
import { Representation } from "../../config/Enum";

interface Props {
  update: Function;
  performTransaction: (parallelize: boolean, ...queries: string[]) => void;
}

interface State {}

export default class DiagramAdd extends React.Component<Props, State> {
  addDiagram() {
    const id = addDiagram(
      Locale[AppSettings.interfaceLanguage].untitled,
      true,
      Representation.COMPACT
    );
    Object.keys(WorkspaceElements).forEach(
      (elem) => (WorkspaceElements[elem].hidden[id] = true)
    );
    Object.keys(WorkspaceLinks).forEach(
      (link) => (WorkspaceLinks[link].vertices[id] = [])
    );
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
