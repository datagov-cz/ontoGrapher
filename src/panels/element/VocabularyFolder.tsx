import React from "react";
import { VocabularyNode } from "../../datatypes/VocabularyNode";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import {
  highlightElement,
  unhighlightElement,
} from "../../function/FunctionDiagram";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { Locale } from "../../config/Locale";

interface Props {
  node: VocabularyNode;
  update: Function;
  projectLanguage: string;
  readOnly: boolean;
  filter: Function;
}

interface State {
  open: boolean;
  hover: boolean;
}

export default class VocabularyFolder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      hover: false,
    };
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    if (prevProps !== this.props && this.state.open !== this.props.node.open) {
      this.setState({ open: this.props.node.open });
    }
  }

  handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (
        this.props.node.elements.every((id) =>
          AppSettings.selectedElements.includes(id)
        )
      )
        AppSettings.selectedElements
          .filter((elem) => this.props.node.elements.includes(elem))
          .forEach((elem) => unhighlightElement(elem));
      else this.props.node.elements.forEach((elem) => highlightElement(elem));
    } else {
      this.setState({ open: !this.state.open });
      this.props.node.open = !this.props.node.open;
    }
    this.props.update();
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
          (this.state.open ? " open" : "") +
          (this.props.node.elements.every((elem) =>
            AppSettings.selectedElements.includes(elem)
          )
            ? " selected"
            : "")
        }
        style={{
          backgroundColor: this.props.node.scheme
            ? WorkspaceVocabularies[
                getVocabularyFromScheme(this.props.node.scheme)
              ].color
            : "#FFF",
        }}
      >
        <span className={"vocabularyLabel"}>
          {(this.props.readOnly ? "📑" : "✏") +
            getLabelOrBlank(this.props.node.labels, this.props.projectLanguage)}
        </span>
        {this.props.readOnly &&
          getVocabularyFromScheme(this.props.node.scheme) in
            CacheSearchVocabularies &&
          CacheSearchVocabularies[
            getVocabularyFromScheme(this.props.node.scheme)
          ].count !==
            WorkspaceVocabularies[
              getVocabularyFromScheme(this.props.node.scheme)
            ].count && (
            <span>
              &nbsp;
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="button-tooltip">
                    {
                      Locale[AppSettings.viewLanguage]
                        .vocabularyNotFullyRepresented
                    }
                  </Tooltip>
                }
              >
                <button
                  className={"buttonlink"}
                  onClick={() =>
                    this.props.filter([
                      getVocabularyFromScheme(this.props.node.scheme),
                    ])
                  }
                >
                  <h6>
                    <Badge variant={"secondary"}>
                      {this.props.readOnly &&
                      getVocabularyFromScheme(this.props.node.scheme) in
                        CacheSearchVocabularies &&
                      CacheSearchVocabularies[
                        getVocabularyFromScheme(this.props.node.scheme)
                      ].count !==
                        WorkspaceVocabularies[
                          getVocabularyFromScheme(this.props.node.scheme)
                        ].count
                        ? `${
                            WorkspaceVocabularies[
                              getVocabularyFromScheme(this.props.node.scheme)
                            ].count
                          }/${
                            CacheSearchVocabularies[
                              getVocabularyFromScheme(this.props.node.scheme)
                            ].count
                          } ${Locale[AppSettings.viewLanguage].termsCase}`
                        : ""}
                    </Badge>
                  </h6>
                </button>
              </OverlayTrigger>
            </span>
          )}
        {this.props.children}
      </div>
    );
  }
}
