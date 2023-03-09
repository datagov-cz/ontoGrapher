import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import classNames from "classnames";
import React from "react";
import { Button } from "react-bootstrap";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../../config/Variables";
import {
  highlightElement,
  resetDiagramSelection,
  unhighlightElement,
} from "../../function/FunctionDiagram";
import { isElementHidden } from "../../function/FunctionElem";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { centerElementInView } from "../../function/FunctionGraph";
import { ReactComponent as HiddenElementSVG } from "../../svg/hiddenElement.svg";

interface Props {
  id: string;
  openRemoveItem: (id: string) => void;
  openRemoveReadOnlyItem: (id: string) => void;
  showDetails: Function;
  readOnly: boolean;
  projectLanguage: string;
  update: () => void;
}

interface State {
  hover: boolean;
}

export default class VocabularyConcept extends React.Component<Props, State> {
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
          WorkspaceTerms[this.props.id].labels,
          this.props.projectLanguage
        )}
        {WorkspaceTerms[this.props.id].altLabels.filter(
          (alt) => alt.language === this.props.projectLanguage
        ).length > 0 && (
          <span className={"altLabel"}>
            &nbsp;
            {"(" +
              WorkspaceTerms[this.props.id].altLabels
                .filter((alt) => alt.language === this.props.projectLanguage)
                .map((alt) => alt.label)
                .join(", ") +
              ")"}
          </span>
        )}
        &nbsp;
        {isElementHidden(this.props.id, AppSettings.selectedDiagram) &&
          AppSettings.selectedDiagram && (
            <HiddenElementSVG width="25px" height="25px" />
          )}
      </span>
    );
  }

  handleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (AppSettings.selectedElements.includes(this.props.id)) {
        unhighlightElement(this.props.id);
        return;
      } else highlightElement(this.props.id);
    } else resetDiagramSelection();
    highlightElement(this.props.id);
    this.props.update();
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
          selected: AppSettings.selectedElements.includes(this.props.id),
        })}
      >
        {this.getLabel()}
        <span
          className={classNames("conceptOptions right", {
            hover: this.state.hover,
          })}
        >
          <Button variant="light" className="plainButton">
            <InfoIcon
              onClick={() => {
                centerElementInView(this.props.id);
                this.props.showDetails(this.props.id);
              }}
            />
          </Button>
          <Button variant="light" className="plainButton">
            <DeleteIcon
              onClick={(evt) => {
                evt.stopPropagation();
                if (!this.props.readOnly) {
                  this.props.openRemoveItem(this.props.id);
                } else if (this.props.readOnly) {
                  this.props.openRemoveReadOnlyItem(this.props.id);
                }
              }}
            />
          </Button>
        </span>
      </div>
    );
  }
}
