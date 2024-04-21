import React from "react";
import { ResizableBox } from "react-resizable";
import { DetailPanelMode, MainViewMode } from "../config/Enum";
import { StoreSettings } from "../config/Store";
import { WorkspaceElements } from "../config/Variables";
import { DetailElement } from "./detail/DetailElement";
import DetailLink from "./detail/DetailLink";
import DetailMultipleLinks from "./detail/DetailMultipleLinks";
import { TropeOverlay } from "./detail/components/element/TropeOverlay";

interface Props {
  projectLanguage: string;
  update: Function;
  performTransaction: (...queries: string[]) => void;
  freeze: boolean;
}

interface State {
  mode: DetailPanelMode;
  id: string;
}

export default class DetailPanel extends React.Component<Props, State> {
  private timer: NodeJS.Timeout;

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
    this.timer = setTimeout(this.getStyle, 200);
    window.addEventListener("resize", () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(this.getStyle, 200);
    });
  }

  save(id: string) {
    this.props.update(id in WorkspaceElements && id);
  }

  getStyle() {
    const diagramPanel = document.getElementById("diagramPanel");
    const menuPanel = document.getElementById("menuPanel");
    const subtract =
      (diagramPanel ? diagramPanel.offsetHeight : 81) +
      (menuPanel ? menuPanel.offsetHeight : 31);
    return {
      height: `calc(100vh - ${subtract}px)`,
    };
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
            <div className={"detailsFlex"} style={this.getStyle()}>
              {this.state.mode === DetailPanelMode.TERM && (
                <DetailElement
                  freeze={this.props.freeze}
                  id={this.state.id}
                  projectLanguage={this.props.projectLanguage}
                  save={this.save}
                  performTransaction={this.props.performTransaction}
                  error={this.props.freeze}
                />
              )}
              {this.state.mode === DetailPanelMode.LINK && (
                <DetailLink
                  id={this.state.id}
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
            <TropeOverlay
              projectLanguage={this.props.projectLanguage}
              performTransaction={this.props.performTransaction}
              save={this.save}
            />
          </ResizableBox>
        )}
      </div>
    );
  }
}
