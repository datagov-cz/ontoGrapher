import React from "react";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import {
  highlightElement,
  unhighlightElement,
} from "../../function/FunctionDiagram";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
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

interface State {
  hover: boolean;
}

export default class VocabularyFolder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
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

  getTermCounter() {
    const vocabulary = this.props.vocabulary;
    if (!(vocabulary in CacheSearchVocabularies) || !this.props.readOnly)
      return;
    const workspaceCount =
      WorkspaceVocabularies[vocabulary].count[AppSettings.representation];
    const totalCount: number =
      CacheSearchVocabularies[vocabulary].count[AppSettings.representation];
    if (!(workspaceCount === totalCount)) {
      return (
        <span>
          &nbsp;
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="button-tooltip">
                {
                  Locale[AppSettings.interfaceLanguage]
                    .vocabularyNotFullyRepresented
                }
              </Tooltip>
            }
          >
            <button
              className={"buttonlink"}
              onClick={() => this.props.filter([vocabulary])}
            >
              <h6>
                <Badge variant={"secondary"}>
                  {`${workspaceCount}/${totalCount} ${
                    Locale[AppSettings.interfaceLanguage].termsCase
                  }`}
                </Badge>
              </h6>
            </button>
          </OverlayTrigger>
        </span>
      );
    }
  }

  render() {
    return (
      <div
        onMouseEnter={() => {
          this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          this.setState({ hover: false });
        }}
        onClick={(event) => this.handleClick(event)}
        className={
          "vocabularyFolder" +
          (this.props.open ? " open" : "") +
          (this.props.elements.every((elem) =>
            AppSettings.selectedElements.includes(elem)
          )
            ? " selected"
            : "")
        }
        style={{
          backgroundColor: WorkspaceVocabularies[this.props.vocabulary].color,
        }}
      >
        <span className={"vocabularyLabel"}>
          {(this.props.readOnly ? "📑" : "✏") +
            getLabelOrBlank(
              WorkspaceVocabularies[this.props.vocabulary].labels,
              this.props.projectLanguage
            )}
        </span>
        {this.getTermCounter()}
        {this.props.children}
      </div>
    );
  }
}
