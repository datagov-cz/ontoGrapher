import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import { Accordion, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../config/Locale";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import {
  highlightElement,
  unhighlightElement,
} from "../../function/FunctionDiagram";
import { getLabelOrBlank } from "../../function/FunctionGetVars";

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
        AppSettings.selectedElements
          .filter((elem) => this.props.elements.includes(elem))
          .forEach((elem) => unhighlightElement(elem));
      else this.props.elements.forEach((elem) => highlightElement(elem));
    } else {
      this.props.setOpen(this.props.vocabulary);
    }
    this.props.update();
  }

  render() {
    return (
      <Accordion.Item
        eventKey={this.props.vocabulary}
        onClick={(event) => this.handleClick(event)}
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
          style={{
            backgroundColor: WorkspaceVocabularies[this.props.vocabulary].color,
          }}
        >
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip>
                {Locale[AppSettings.interfaceLanguage].workspaceReady}
              </Tooltip>
            }
          >
            {this.props.readOnly ? <DescriptionIcon /> : <EditIcon />}
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
