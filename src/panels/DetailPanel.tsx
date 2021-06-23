import React from "react";
import DetailLink from "./detail/DetailLink";
import { graph } from "../graph/Graph";
import DetailElement from "./detail/DetailElement";
import { setDisplayLabel } from "../function/FunctionDraw";
import { WorkspaceElements, WorkspaceLinks } from "../config/Variables";
import { resizeElem } from "../function/FunctionElem";

interface Props {
  projectLanguage: string;
  update: Function;
  handleWidth: Function;
  performTransaction: (...queries: string[]) => void;
  freeze: boolean;
  updateDetailPanel: Function;
  updateDiagramCanvas: Function;
}

interface State {
  hidden: boolean;
  type: string;
}

export default class DetailPanel extends React.Component<Props, State> {
  private readonly detailElem: React.RefObject<DetailElement>;
  private readonly detailLink: React.RefObject<DetailLink>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hidden: true,
      type: "",
    };
    this.detailElem = React.createRef();
    this.detailLink = React.createRef();
    this.hide = this.hide.bind(this);
    this.save = this.save.bind(this);
  }

  hide() {
    this.detailElem.current?.prepareDetails();
    this.detailLink.current?.prepareDetails();
  }

  prepareDetails(id: string) {
    this.detailElem.current?.prepareDetails();
    this.detailLink.current?.prepareDetails();
    if (id in WorkspaceElements) {
      setDisplayLabel(id, this.props.projectLanguage);
      this.detailElem.current?.prepareDetails(id);
    } else if (id in WorkspaceLinks) {
      this.detailLink.current?.prepareDetails(id);
    }
  }

  save(id: string) {
    let cell = graph.getCell(id);
    if (cell && cell.isElement()) resizeElem(id);
    this.props.update(id in WorkspaceElements && id);
  }

  update(id: string) {
    if (id) {
      this.prepareDetails(id);
    }
  }

  retry() {
    this.detailElem.current?.save();
  }

  render() {
    return (
      <div>
        <DetailElement
          projectLanguage={this.props.projectLanguage}
          save={this.save}
          ref={this.detailElem}
          handleWidth={this.props.handleWidth}
          performTransaction={this.props.performTransaction}
          error={this.props.freeze}
          updateDetailPanel={this.props.updateDetailPanel}
          updateDiagramCanvas={this.props.updateDiagramCanvas}
        />
        <DetailLink
          error={this.props.freeze}
          handleWidth={this.props.handleWidth}
          projectLanguage={this.props.projectLanguage}
          performTransaction={this.props.performTransaction}
          save={this.save}
          ref={this.detailLink}
          updateDetailPanel={this.props.updateDetailPanel}
        />
      </div>
    );
  }
}
