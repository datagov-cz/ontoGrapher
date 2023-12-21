import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import { Accordion, OverlayTrigger, Tooltip } from "react-bootstrap";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { CellColors } from "../../config/visual/CellColors";
import { unHighlightCells, highlightCells } from "../../function/FunctionDraw";
import { Locale } from "../../config/Locale";

interface Props {
  open: boolean;
  vocabulary: string;
  update: Function;
  projectLanguage: string;
  readOnly: boolean;
  filter: Function;
  elements: string[];
  setOpen: (vocabulary: string) => void;
}

export default class VocabularyFolder extends React.Component<Props> {
  handleClick(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (
        this.props.elements.every((id) =>
          AppSettings.selectedElements.includes(id)
        )
      )
        unHighlightCells(
          ...AppSettings.selectedElements.filter((elem) =>
            this.props.elements.includes(elem)
          )
        );
      else highlightCells(CellColors.details, ...this.props.elements);
    } else {
      this.props.setOpen(this.props.vocabulary);
    }
    this.props.update();
  }

  render() {
    return (
      <Accordion.Item
        eventKey={this.props.vocabulary}
        className={
          "vocabularyFolder" +
          (this.props.elements.every((elem) =>
            AppSettings.selectedElements.includes(elem)
          )
            ? " selected"
            : "")
        }
      >
        <Accordion.Header
          onClick={(event) => this.handleClick(event)}
          style={{
            backgroundColor: WorkspaceVocabularies[this.props.vocabulary].color,
          }}
        >
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 0 }}
            overlay={
              <Tooltip>
                {this.props.readOnly
                  ? Locale[AppSettings.interfaceLanguage].readOnlyVocabulary
                  : Locale[AppSettings.interfaceLanguage]
                      .writeEnabledVocabulary}
              </Tooltip>
            }
          >
            <span className="vocabularyFolderIcon">
              {this.props.readOnly ? <DescriptionIcon /> : <EditIcon />}
            </span>
          </OverlayTrigger>
          {getLabelOrBlank(
            WorkspaceVocabularies[this.props.vocabulary].labels,
            this.props.projectLanguage
          )}
        </Accordion.Header>
        <Accordion.Body>{this.props.children}</Accordion.Body>
      </Accordion.Item>
    );
  }
}
