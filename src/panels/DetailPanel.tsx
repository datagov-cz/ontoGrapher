import React from "react";
import { ResizableBox } from "react-resizable";
import { DetailPanelMode } from "../config/Enum";
import { WorkspaceElements } from "../config/Variables";
import { DetailElement } from "./detail/DetailElement";
import DetailLink from "./detail/DetailLink";
import DetailMultipleLinks from "./detail/DetailMultipleLinks";

interface Props {
  projectLanguage: string;
  update: Function;
  performTransaction: (...queries: string[]) => void;
  freeze: boolean;
  handleCreation: Function;
}

interface State {
  mode: DetailPanelMode;
  id: string;
}

export default class DetailPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: DetailPanelMode.HIDDEN,
      id: "",
    };
    this.save = this.save.bind(this);
  }

  prepareDetails(mode: DetailPanelMode, id?: string) {
    this.setState({ mode: mode, id: id ? id : "" });
  }

  save(id: string) {
    this.props.update(id in WorkspaceElements && id);
  }

  // getDetailPanelLabel(): JSX.Element {
  //   switch (this.state.mode) {
  //     case DetailPanelMode.LINK:
  //       const iri = WorkspaceLinks[this.state.id].iri;
  //       return (
  //         <IRILink
  //           label={getLinkOrVocabElem(iri).labels[this.props.projectLanguage]}
  //           iri={iri}
  //         />
  //       );
  //     case DetailPanelMode.TERM:
  //       return (
  //         <IRILink
  //           label={
  //             this.state.id
  //               ? getLabelOrBlank(
  //                   WorkspaceTerms[this.state.id].labels,
  //                   this.props.projectLanguage
  //                 )
  //               : ""
  //           }
  //           iri={this.state.id}
  //         />
  //       );
  //     case DetailPanelMode.MULTIPLE_LINKS:
  //       const content = getExpressionByRepresentation({
  //         [Representation.COMPACT]: "detailPanelMultipleRelationships",
  //         [Representation.FULL]: "detailPanelMultipleLinks",
  //       });
  //       return <span>{content}</span>;
  //     default:
  //       return <span />;
  //   }
  // }

  render() {
    return (
      <div>
        {this.state.mode !== DetailPanelMode.HIDDEN && (
          <ResizableBox
            width={350}
            height={1000}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={["sw"]}
            className={"details" + (this.props.freeze ? " disabled" : "")}
          >
            <div className={"detailsFlex"}>
              {/* <div className={"detailTitle"}>
                <h3>{this.getDetailPanelLabel()}</h3>
              </div> */}
              {this.state.mode === DetailPanelMode.TERM && (
                <DetailElement
                  id={this.state.id}
                  projectLanguage={this.props.projectLanguage}
                  save={this.save}
                  performTransaction={this.props.performTransaction}
                  error={this.props.freeze}
                  updateDetailPanel={this.prepareDetails}
                  handleCreation={this.props.handleCreation}
                />
              )}
              {this.state.mode === DetailPanelMode.LINK && (
                <DetailLink
                  id={this.state.id}
                  error={this.props.freeze}
                  projectLanguage={this.props.projectLanguage}
                  performTransaction={this.props.performTransaction}
                  save={this.save}
                  updateDetailPanel={this.prepareDetails}
                />
              )}
              {this.state.mode === DetailPanelMode.MULTIPLE_LINKS && (
                <DetailMultipleLinks
                  error={this.props.freeze}
                  projectLanguage={this.props.projectLanguage}
                  performTransaction={this.props.performTransaction}
                  save={this.save}
                  updateDetailPanel={this.prepareDetails}
                />
              )}
            </div>
          </ResizableBox>
        )}
      </div>
    );
  }
}
