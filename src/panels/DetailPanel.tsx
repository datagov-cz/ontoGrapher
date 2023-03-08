import React from "react";
import { ResizableBox } from "react-resizable";
import { DetailPanelMode, MainViewMode } from "../config/Enum";
import { StoreSettings } from "../config/Store";
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
    StoreSettings.subscribe(
      (s) => ({
        mode: s.detailPanelMode,
        id: s.detailPanelSelectedID,
        view: s.mainViewMode,
      }),
      (s) => {
        if (s.view === MainViewMode.CANVAS)
          this.setState({ mode: s.mode, id: s.id ? s.id : "" });
        else if (s.view === MainViewMode.MANAGER) {
          this.setState({ mode: DetailPanelMode.HIDDEN, id: "" });
        }
      }
    );
  }

  save(id: string) {
    this.props.update(id in WorkspaceElements && id);
  }

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
              {this.state.mode === DetailPanelMode.TERM && (
                <DetailElement
                  id={this.state.id}
                  projectLanguage={this.props.projectLanguage}
                  save={this.save}
                  performTransaction={this.props.performTransaction}
                  error={this.props.freeze}
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
                />
              )}
              {this.state.mode === DetailPanelMode.MULTIPLE_LINKS && (
                <DetailMultipleLinks
                  error={this.props.freeze}
                  projectLanguage={this.props.projectLanguage}
                  performTransaction={this.props.performTransaction}
                  save={this.save}
                />
              )}
            </div>
          </ResizableBox>
        )}
      </div>
    );
  }
}
