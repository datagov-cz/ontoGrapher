import React from "react";
import DiagramAdd from "./diagram/DiagramAdd";
import { Diagrams } from "../config/Variables";
import DiagramTab from "./diagram/DiagramTab";
import ModalRemoveDiagram from "./modal/ModalRemoveDiagram";

interface Props {
  performTransaction: (...queries: string[]) => void;
  freeze: boolean;
  update: Function;
}

interface State {
  modalRemoveDiagram: boolean;
  selectedDiagram: string;
}

export default class DiagramPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalRemoveDiagram: false,
      selectedDiagram: "",
    };
  }

  render() {
    return (
      <div className={"diagramPanel" + (this.props.freeze ? " disabled" : "")}>
        {Object.keys(Diagrams)
          .filter((diag) => Diagrams[diag].active)
          .sort((a, b) => Diagrams[a].index - Diagrams[b].index)
          .map((diag, i) => (
            <DiagramTab
              key={i}
              diagram={diag}
              update={() => {
                this.forceUpdate();
                this.props.update();
              }}
              performTransaction={this.props.performTransaction}
              deleteDiagram={(diag: string) => {
                this.setState({
                  selectedDiagram: diag,
                  modalRemoveDiagram: true,
                });
              }}
            />
          ))}
        <DiagramAdd
          update={() => {
            this.forceUpdate();
            this.props.update();
          }}
          performTransaction={this.props.performTransaction}
        />
        <ModalRemoveDiagram
          modal={this.state.modalRemoveDiagram}
          diagram={this.state.selectedDiagram}
          close={() => {
            this.setState({ modalRemoveDiagram: false });
          }}
          update={() => {
            this.forceUpdate();
            this.props.update();
          }}
          performTransaction={this.props.performTransaction}
        />
      </div>
    );
  }
}
