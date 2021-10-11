import React from "react";
import { ResizableBox } from "react-resizable";
import TableList from "../components/TableList";
import { Button, Spinner } from "react-bootstrap";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import { graph } from "../graph/Graph";
import IRIlabel from "../components/IRIlabel";
import { Locale } from "../config/Locale";
import { highlightCell } from "../function/FunctionDraw";
import { validateWorkspace } from "../interface/ValidationInterface";

interface Props {
  close: Function;
  projectLanguage: string;
}

interface State {
  results: { severity: string; message: string; focusNode: string }[];
  conforms: boolean;
  loading: boolean;
  error: boolean;
  height: number;
}

export default class ValidationPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      results: [],
      conforms: false,
      loading: false,
      error: false,
      height: 150,
    };
    this.validate = this.validate.bind(this);
  }

  getWidth() {
    let width = window.innerWidth;
    const items = document.querySelector(".elements") as HTMLElement;
    const elem = document.querySelector(".validation") as HTMLElement;
    const details = document.querySelector(".details") as HTMLElement;
    if (items) {
      if (elem) elem.style.left = items.getBoundingClientRect().width + "px";
      width -= items.getBoundingClientRect().width;
    }
    if (details) width -= details.getBoundingClientRect().width;
    return width;
  }

  async validate() {
    this.setState({ loading: true, error: false });
    const results = await validateWorkspace(
      AppSettings.contextIRI,
      AppSettings.selectedLanguage
    ).catch(() => {
      return false;
    });
    if (results) {
      this.setState(
        {
          conforms: results.conforms,
          results: results.results,
        },
        () => this.highlight()
      );
    } else {
      this.setState({ error: true });
    }
    this.setState({ loading: false });
  }

  focus(node: string) {
    const cellElem = graph
      .getElements()
      .find((element) => WorkspaceElements[element.id].iri === node);
    const cellLink = graph
      .getLinks()
      .find((element) => WorkspaceLinks[element.id].iri === node);
    if (cellElem)
      if (typeof cellElem.id === "string") {
        highlightCell(cellElem.id, "#FFFF00");
      }
    if (cellLink)
      if (typeof cellLink.id === "string") {
        highlightCell(cellLink.id, "#FFFF00");
      }
  }

  highlight() {
    const iriList = this.state.results.map((result) => result.focusNode);
    graph.getCells().forEach((cell) => {
      if (
        cell.id in WorkspaceElements &&
        iriList.includes(WorkspaceElements[cell.id].iri)
      ) {
        if (typeof cell.id === "string") {
          highlightCell(cell.id, "#FF0000");
        }
      } else if (
        cell.id in WorkspaceLinks &&
        iriList.includes(WorkspaceLinks[cell.id].iri)
      ) {
        if (typeof cell.id === "string") {
          highlightCell(cell.id, "#FF0000");
        }
      }
    });
  }

  getHeight() {
    const top = document.getElementById("top");
    if (top)
      this.setState({
        height: window.innerHeight - top.getBoundingClientRect().bottom,
      });
  }

  render() {
    return (
      <ResizableBox
        className={"validation"}
        width={this.getWidth()}
        height={200}
        axis={"y"}
        handleSize={[8, 8]}
        resizeHandles={["ne"]}
        onResizeStop={() => this.getHeight()}
      >
        <div>
          <div className={"top"} id={"top"}>
            <h4>{Locale[AppSettings.viewLanguage].validation}</h4>
            <span className="right">
              <Button
                onClick={() => {
                  this.validate();
                }}
              >
                {Locale[AppSettings.viewLanguage].validationReload}
              </Button>
              &nbsp;
              <Button variant={"secondary"} onClick={() => this.props.close()}>
                {Locale[AppSettings.viewLanguage].close}
              </Button>
            </span>
          </div>
          {this.state.conforms && (
            <div className={"centeredValidation"}>
              {"✅" + Locale[AppSettings.viewLanguage].conforms}
            </div>
          )}
          {this.state.error && (
            <div className={"centeredValidation"}>
              {Locale[AppSettings.viewLanguage].validationLoadingError}
            </div>
          )}
          {this.state.loading && (
            <div className={"centered"}>
              <Spinner animation={"border"} />
            </div>
          )}
          {!this.state.loading && !this.state.conforms && !this.state.error && (
            <div
              className={"list"}
              style={{ height: `${this.state.height}px` }}
            >
              <TableList
                headings={[
                  Locale[AppSettings.viewLanguage].validationNumber,
                  Locale[AppSettings.viewLanguage].validationSeverity,
                  Locale[AppSettings.viewLanguage].validationName,
                  Locale[AppSettings.viewLanguage].validationError,
                ]}
              >
                {this.state.results.map((result, i) => (
                  <tr>
                    <td>
                      <button
                        className={"buttonlink"}
                        onClick={() => this.focus(result.focusNode)}
                      >
                        {i + 1}
                      </button>
                    </td>
                    <td>
                      {result.severity.substring(
                        result.severity.lastIndexOf("#") + 1
                      )}
                    </td>
                    {result.focusNode in WorkspaceTerms ? (
                      <IRIlabel
                        label={
                          WorkspaceTerms[result.focusNode].labels[
                            this.props.projectLanguage
                          ]
                        }
                        iri={result.focusNode}
                      />
                    ) : (
                      <IRIlabel
                        label={result.focusNode}
                        iri={result.focusNode}
                      />
                    )}
                    <td>
                      {result.message.includes("@")
                        ? result.message.substring(
                            0,
                            result.message.lastIndexOf("@")
                          )
                        : result.message}
                    </td>
                  </tr>
                ))}
              </TableList>
            </div>
          )}
        </div>
      </ResizableBox>
    );
  }
}
