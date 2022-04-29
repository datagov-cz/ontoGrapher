import React from "react";
import { Nav } from "react-bootstrap";
import { AppSettings } from "../config/Variables";
import { graph } from "../graph/Graph";
import { Instances } from "./PatternTypes";
import { graphElement } from "../graph/GraphElement";

interface Props {
  update: Function;
  close: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {
  alert: boolean;
}

export default class MenuPanelToggleView extends React.Component<Props, State> {
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
        graph.getElements().filter((elem) => elem.id in Instances)
      );
    } else {
      for (const instance of Object.keys(Instances)) {
        graph.removeCells(
          graph
            .getElements()
            .filter((elem) =>
              Instances[instance].terms
                .map((t) => t.iri)
                .includes(elem.id as string)
            )
        );
        const instanceElem = new graphElement({ id: instance });
        instanceElem.addTo(graph);
      }
    }
    this.props.close();
    this.props.update();
    this.forceUpdate();
  }

  render() {
    return (
      <div className={"inert"}>
        <Nav.Link onClick={() => this.switch()}>
          {AppSettings.patternView ? "Off" : "On"}
        </Nav.Link>
      </div>
    );
  }
}
