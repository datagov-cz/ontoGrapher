import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import classNames from "classnames";
import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../config/Locale";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../../config/Variables";
import { CellColors } from "../../config/visual/CellColors";
import { resetDiagramSelection } from "../../function/FunctionDiagram";
import { highlightCells, unHighlightCells } from "../../function/FunctionDraw";
import { isElementHidden } from "../../function/FunctionElem";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { centerElementInView } from "../../function/FunctionGraph";
import { ReactComponent as HiddenElementSVG } from "../../svg/hiddenElement.svg";

interface Props {
  id: string;
  openRemoveItem: (id: string) => void;
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
        unHighlightCells(this.props.id);
        return;
      } else highlightCells(CellColors.detail, this.props.id);
    } else resetDiagramSelection();
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
              id: AppSettings.selectedElements
                .concat([this.props.id])
                .filter((elem) => elem in WorkspaceElements),
              iri: AppSettings.selectedElements
                .concat([this.props.id])
                .filter((elem) => !(elem in WorkspaceElements)),
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
                highlightCells(CellColors.detail, this.props.id);
                centerElementInView(this.props.id);
                this.props.showDetails(this.props.id);
              }}
            />
          </Button>
          {!this.props.readOnly && (
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 0 }}
              overlay={
                <Tooltip>
                  {Locale[AppSettings.interfaceLanguage].removeConcept}
                </Tooltip>
              }
            >
              <Button
                variant="light"
                className="plainButton"
                onClick={(event) => {
                  event.stopPropagation();
                  this.props.openRemoveItem(this.props.id);
                }}
              >
                <DeleteIcon />
              </Button>
            </OverlayTrigger>
          )}
        </span>
      </div>
    );
  }
}
