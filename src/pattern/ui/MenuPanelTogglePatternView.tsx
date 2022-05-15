import React from "react";
import { Nav } from "react-bootstrap";
import { AppSettings } from "../../config/Variables";
import { Instances } from "../function/PatternTypes";
import { putInstanceOnCanvas } from "../function/FunctionPattern";
import { graph } from "../../graph/Graph";

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
    } else {
      for (const instance of Object.keys(Instances))
        putInstanceOnCanvas(instance);
    }
    this.props.close();
    this.props.update();
    this.forceUpdate();
  }

  render() {
    return (
      <div className={"inert"}>
        <Nav.Link onClick={() => this.switch()}>
          {AppSettings.patternView ? "Turn off" : "Turn on"}
        </Nav.Link>
      </div>
    );
  }
}
