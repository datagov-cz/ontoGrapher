import React from "react";
import { Nav } from "react-bootstrap";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
} from "../../config/Variables";
import { Instances } from "../function/PatternTypes";
import { togglePatternView } from "../function/FunctionPattern";
import { graph } from "../../graph/Graph";
import { isElementHidden } from "../../function/FunctionElem";
import { graphElement } from "../../graph/GraphElement";
import { drawGraphElement } from "../../function/FunctionDraw";
import { Representation } from "../../config/Enum";
import {
  restoreHiddenElem,
  setRepresentation,
} from "../../function/FunctionGraph";

interface Props {
  update: Function;
  close: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {
  alert: boolean;
}

export default class MenuPanelTogglePatternView extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      alert: false,
    };
  }

  switch() {
    AppSettings.patternView = !AppSettings.patternView;
    if (!AppSettings.patternView) {
      graph.removeCells(
        graph.getCells().filter((cell) => cell.id in Instances)
      );
      for (const id in WorkspaceElements) {
        if (
          !isElementHidden(id, AppSettings.selectedDiagram) &&
          WorkspaceElements[id].position[AppSettings.selectedDiagram] &&
          WorkspaceElements[id].active &&
          !graph.getElements().find((elem) => elem.id === id)
        ) {
          const cls = new graphElement({ id: id });
          cls.position(
            WorkspaceElements[id].position[AppSettings.selectedDiagram].x,
            WorkspaceElements[id].position[AppSettings.selectedDiagram].y
          );
          cls.addTo(graph);
          drawGraphElement(
            cls,
            AppSettings.canvasLanguage,
            Representation.FULL
          );
          restoreHiddenElem(id, cls, true, false, false);
        }
      }
      setRepresentation(
        Diagrams[AppSettings.selectedDiagram].representation,
        false
      );
    } else {
      togglePatternView();
    }
    this.props.close();
    this.props.update();
    this.forceUpdate();
  }

  render() {
    return (
      <div className={"inert"}>
        <Nav.Link onClick={() => this.switch()}>
          {AppSettings.patternView
            ? "Vypnout reprezentace instancí"
            : "Zapnout reprezentace instancí"}
        </Nav.Link>
      </div>
    );
  }
}
