import React from "react";
import { Accordion } from "react-bootstrap";
import { DetailPanelMode } from "../../config/Enum";
import { DetailElementDescriptionCard } from "./components/element/DetailElementDescriptionCard";
import { DetailElementDiagramCard } from "./components/element/DetailElementDiagramCard";
import { DetailElementLinksCard } from "./components/element/DetailElementLinksCard";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
  handleCreation: Function;
  updateDetailPanel: (mode: DetailPanelMode, id?: string) => void;
  updateDiagramCanvas: Function;
  id: string;
}

export default class DetailElement extends React.Component<Props> {
  render() {
    return (
      <div className={"accordions"}>
        <Accordion defaultActiveKey={"0"}>
          <DetailElementDescriptionCard
            id={this.props.id}
            projectLanguage={this.props.projectLanguage}
            performTransaction={this.props.performTransaction}
            handleCreation={this.props.handleCreation}
            save={this.props.save}
            updateDetailPanel={this.props.updateDetailPanel}
          />
          <DetailElementLinksCard
            id={this.props.id}
            projectLanguage={this.props.projectLanguage}
            performTransaction={this.props.performTransaction}
          />
          <DetailElementDiagramCard id={this.props.id} />
        </Accordion>
      </div>
    );
  }
}
