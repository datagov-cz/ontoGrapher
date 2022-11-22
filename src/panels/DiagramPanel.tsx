import React from "react";
import DiagramAdd from "./diagram/DiagramAdd";
import { Diagrams } from "../config/Variables";
import DiagramTab from "./diagram/DiagramTab";
import ModalRemoveDiagram from "./modal/ModalRemoveDiagram";
import { ModalRenameDiagram } from "./diagram/ModalRenameDiagram";
import { updateCreateDiagram } from "../queries/update/UpdateDiagramQueries";
import DiagramHome from "./diagram/DiagramHome";

interface Props {
  performTransaction: (...queries: string[]) => void;
  freeze: boolean;
  update: Function;
}

interface State {
  modalRemoveDiagram: boolean;
  modalRenameDiagram: boolean;
  selectedDiagram: string;
}

export default class DiagramPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalRenameDiagram: false,
      modalRemoveDiagram: false,
      selectedDiagram: "",
    };
  }

  closeDiagram(diag: string) {
    Diagrams[diag].active = false;
    if (Diagrams[diag].saved) {
      const queries = [];
      queries.push(updateCreateDiagram(diag));
      this.props.performTransaction(...queries);
    }
    this.props.update();
  }

  render() {
    return (
      <div className={"diagramPanel" + (this.props.freeze ? " disabled" : "")}>
        <DiagramHome />
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
              closeDiagram={(diag: string) => {
                this.closeDiagram(diag);
              }}
              renameDiagram={(diag: string) => {
                this.setState({
                  selectedDiagram: diag,
                  modalRenameDiagram: true,
                });
              }}
            />
          ))}
        {/* TODO: Change DiagramAdd to DiagramHome when the diagram manager is ready */}
        {/* <DiagramAdd
          update={() => {
            this.forceUpdate();
            this.props.update();
          }}
          performTransaction={this.props.performTransaction}
        /> */}
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
        <ModalRenameDiagram
          modal={this.state.modalRenameDiagram}
          diagram={this.state.selectedDiagram}
          close={() => {
            this.setState({ modalRenameDiagram: false });
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
