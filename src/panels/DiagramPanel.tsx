import React from "react";
import { StoreSettings } from "../config/Store";
import { AppSettings, Diagrams } from "../config/Variables";
import { changeDiagrams } from "../function/FunctionDiagram";
import { updateCreateDiagram } from "../queries/update/UpdateDiagramQueries";
import DiagramHome from "./diagram/DiagramHome";
import { DiagramTab } from "./diagram/DiagramTab";
import { ModalRenameDiagram } from "./diagram/ModalRenameDiagram";
import ModalRemoveDiagram from "./modal/ModalRemoveDiagram";

interface Props {
  performTransaction: (...queries: string[]) => void;
  freeze: boolean;
  update: Function;
}

interface State {
  modalRemoveDiagram: boolean;
  modalRenameDiagram: boolean;
  // For modals
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
    StoreSettings.subscribe(
      (s) => s.diagramPanelSelectedDiagram,
      () => this.forceUpdate()
    );
  }

  closeDiagram(diag: string) {
    Diagrams[diag].active = false;
    if (Diagrams[diag].saved) {
      const queries = [];
      queries.push(updateCreateDiagram(diag));
      this.props.performTransaction(...queries);
    }
    if (AppSettings.selectedDiagram === diag) {
      changeDiagrams();
    }
    this.props.update();
  }

  render() {
    return (
      <div className={"diagramPanel" + (this.props.freeze ? " disabled" : "")}>
        <DiagramHome
          update={() => {
            this.forceUpdate();
            this.props.update();
          }}
        />
        {Object.keys(Diagrams)
          .filter(
            (diag) => Diagrams[diag].active && !Diagrams[diag].toBeDeleted
          )
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
