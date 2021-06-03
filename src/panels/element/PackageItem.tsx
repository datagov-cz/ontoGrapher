import React from "react";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../../config/Variables";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import {
  highlightElement,
  resetDiagramSelection,
  unhighlightElement,
  updateDiagramPosition,
} from "../../function/FunctionDiagram";
import { graph } from "../../graph/Graph";
import { paper } from "../../main/DiagramCanvas";
import { ReactComponent as HiddenElementSVG } from "../../svg/hiddenElement.svg";
import { isElementHidden } from "../../function/FunctionElem";
import classNames from "classnames";

interface Props {
  id: string;
  openRemoveItem: (id: string) => void;
  openRemoveReadOnlyItem: (id: string) => void;
  showDetails: Function;
  readOnly: boolean;
  projectLanguage: string;
  visible: boolean;
  update: () => void;
}

interface State {
  hover: boolean;
}

export default class PackageItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  getLabel(): JSX.Element {
    return (
      <span className={"label"}>
        {getLabelOrBlank(
          WorkspaceTerms[WorkspaceElements[this.props.id].iri].labels,
          this.props.projectLanguage
        )}
        {WorkspaceTerms[WorkspaceElements[this.props.id].iri].altLabels.filter(
          (alt) => alt.language === this.props.projectLanguage
        ).length > 0 && (
          <span className={"altLabel"}>
            &nbsp;
            {"(" +
              WorkspaceTerms[WorkspaceElements[this.props.id].iri].altLabels
                .filter((alt) => alt.language === this.props.projectLanguage)
                .map((alt) => alt.label)
                .join(", ") +
              ")"}
          </span>
        )}
      </span>
    );
  }

  handleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (AppSettings.selectedElements.includes(this.props.id))
        unhighlightElement(this.props.id);
      else highlightElement(this.props.id);
    } else resetDiagramSelection();
    highlightElement(this.props.id);
    let elem = graph.getElements().find((elem) => elem.id === this.props.id);
    if (elem) {
      const scale = paper.scale().sx;
      paper.translate(0, 0);
      paper.translate(
        -elem.position().x * scale +
          paper.getComputedSize().width / 2 -
          elem.getBBox().width,
        -elem.position().y * scale +
          paper.getComputedSize().height / 2 -
          elem.getBBox().height
      );
      updateDiagramPosition(AppSettings.selectedDiagram);
    }
    this.props.update();
    this.props.showDetails(this.props.id);
  }

  render() {
    return (
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData(
            "newClass",
            JSON.stringify({
              id:
                AppSettings.selectedElements.length > 0
                  ? AppSettings.selectedElements.filter(
                      (elem) => elem in WorkspaceElements
                    )
                  : [this.props.id],
              iri:
                AppSettings.selectedElements.length > 0
                  ? AppSettings.selectedElements.filter(
                      (elem) => !(elem in WorkspaceElements)
                    )
                  : [],
            })
          );
        }}
        onDragEnd={() => {
          resetDiagramSelection();
          this.props.update();
        }}
        onClick={(event) => this.handleClick(event)}
        onMouseOver={() => {
          this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          this.setState({ hover: false });
        }}
        id={this.props.id}
        className={classNames("stereotypeElementItem", {
          hidden: isElementHidden(this.props.id, AppSettings.selectedDiagram),
          closed: !this.props.visible,
          selected: AppSettings.selectedElements.includes(this.props.id),
        })}
      >
        {this.getLabel()}
        {isElementHidden(this.props.id, AppSettings.selectedDiagram) && (
          <HiddenElementSVG />
        )}
        {this.state.hover && !this.props.readOnly && (
          <span className={"packageOptions right"}>
            <button
              className={"buttonlink"}
              onClick={(event) => {
                event.stopPropagation();
                this.props.openRemoveItem(this.props.id);
              }}
            >
              <span role="img" aria-label={""}>
                ❌
              </span>
            </button>
          </span>
        )}
        {this.state.hover && this.props.readOnly && (
          <span className={"packageOptions right"}>
            <button
              className={"buttonlink"}
              onClick={(event) => {
                event.stopPropagation();
                this.props.openRemoveReadOnlyItem(this.props.id);
              }}
            >
              <span role="img" aria-label={""}>
                ➖
              </span>
            </button>
          </span>
        )}
      </div>
    );
  }
}
