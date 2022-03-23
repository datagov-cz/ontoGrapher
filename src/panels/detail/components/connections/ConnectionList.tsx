import React from "react";
import ConnectionFilter from "./ConnectionFilter";
import ConnectionWorkspace from "./ConnectionWorkspace";
import {
  AppSettings,
  Links,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { Representation } from "../../../../config/Enum";
import { getLabelOrBlank } from "../../../../function/FunctionGetVars";
import TableList from "../../../../components/TableList";
import { getOtherConnectionElementID } from "../../../../function/FunctionLink";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { spreadConnections } from "../../../../function/FunctionGraph";
import classNames from "classnames";
import _ from "underscore";
import { isElementHidden } from "../../../../function/FunctionElem";
import { ElementFilter } from "../../../../datatypes/ElementFilter";
import { Locale } from "../../../../config/Locale";
import ConnectionCache from "./ConnectionCache";
import { CacheConnection } from "../../../../types/CacheConnection";
import { getCacheConnections } from "../../../../function/FunctionCache";

interface Props {
  //Element ID from DetailElement
  id: string;
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
}

interface State {
  filter: ElementFilter;
  selected: string[];
  shownConnections: string[];
  showFilter: boolean;
  showLucene: boolean;
  shownLucene: CacheConnection[];
}

export default class ConnectionList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filter: {
        hidden: "",
        ontoType: "",
        typeType: "",
        search: "",
        direction: "",
        connection: "",
        scheme: "",
      },
      selected: [],
      shownConnections: [],
      showFilter: false,
      showLucene: false,
      shownLucene: [],
    };
    this.updateFilter = this.updateFilter.bind(this);
    this.updateSelection = this.updateSelection.bind(this);
  }

  search(id: string): boolean {
    const search = this.state.filter.search.normalize().trim().toLowerCase();
    const name = getLabelOrBlank(
      WorkspaceTerms[id].labels,
      this.props.projectLanguage
    );
    return (
      name.normalize().trim().toLowerCase().includes(search) ||
      WorkspaceTerms[id].altLabels.find(
        (alt) =>
          alt.language === this.props.projectLanguage &&
          alt.label.normalize().trim().toLowerCase().includes(search)
      ) !== undefined
    );
  }

  getConnectionsFromOtherVocabularies() {
    getCacheConnections(this.props.id).then((connections) =>
      this.setState(
        {
          shownLucene: connections,
        },
        () => this.setState({ shownConnections: this.filter() })
      )
    );
  }

  sort(a: string, b: string): number {
    const aLabel =
      WorkspaceTerms[getOtherConnectionElementID(a, this.props.id)].labels[
        this.props.projectLanguage
      ];
    const bLabel =
      WorkspaceTerms[getOtherConnectionElementID(b, this.props.id)].labels[
        this.props.projectLanguage
      ];
    return aLabel.localeCompare(bLabel);
  }

  filter(): string[] {
    return Object.keys(WorkspaceLinks)
      .filter((link) => {
        const otherElement = getOtherConnectionElementID(link, this.props.id);
        if (!WorkspaceLinks[link].active) return false;
        if (
          this.props.id !== WorkspaceLinks[link].source &&
          this.props.id !== WorkspaceLinks[link].target
        )
          return false;
        if (
          this.state.filter.scheme &&
          WorkspaceTerms[otherElement].inScheme !== this.state.filter.scheme
        )
          return false;
        if (
          this.state.filter.direction &&
          WorkspaceLinks[link][this.state.filter.direction] !== this.props.id
        )
          return false;
        if (
          this.state.filter.connection &&
          WorkspaceLinks[link].iri !== this.state.filter.connection
        )
          return false;
        if (
          this.state.filter.hidden &&
          !isElementHidden(otherElement, AppSettings.selectedDiagram)
        )
          return false;
        if (
          this.state.filter.ontoType &&
          !WorkspaceTerms[otherElement].types.includes(
            this.state.filter.ontoType
          )
        )
          return false;
        if (
          this.state.filter.typeType &&
          !WorkspaceTerms[otherElement].types.includes(
            this.state.filter.typeType
          )
        )
          return false;
        if (this.state.filter.search && !this.search(otherElement))
          return false;
        return AppSettings.representation === Representation.FULL
          ? WorkspaceLinks[link].iri in Links
          : !(WorkspaceLinks[link].iri in Links) ||
              (WorkspaceLinks[link].iri in Links &&
                Links[WorkspaceLinks[link].iri].inScheme.startsWith(
                  AppSettings.ontographerContext
                ));
      })
      .sort((a, b) => this.sort(a, b));
  }

  updateFilter(key: keyof ElementFilter, value: string) {
    this.setState(
      (prevState) => ({
        filter: {
          ...prevState.filter,
          [key]: value,
        },
      }),
      () => this.setState({ shownConnections: this.filter() })
    );
  }

  componentDidMount() {
    this.setState({ shownConnections: this.filter() });
  }

  updateSelection(ids: string[], remove?: boolean) {
    const iter = this.state.selected;
    if (remove || ids.every((id) => iter.includes(id)))
      ids.forEach((id) => {
        const idx = iter.indexOf(id);
        if (idx !== -1) iter.splice(idx, 1);
      });
    else if (ids.every((id) => !iter.includes(id))) iter.push(...ids);
    this.setState({ selected: iter });
  }

  getElements(): string[] {
    return this.state.selected.map((link) =>
      getOtherConnectionElementID(link, this.props.id)
    );
  }

  render() {
    return (
      <div className={"connectionList"}>
        <div className={classNames("buttons")}>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltipA">
                {
                  Locale[AppSettings.interfaceLanguage]
                    .connectionListAddSelection
                }
              </Tooltip>
            }
          >
            <Button
              className={classNames("buttonlink", {
                selected: this.state.selected.length > 0,
              })}
              onClick={() => {
                spreadConnections(this.props.id, this.state.selected).then(
                  (queries) => {
                    this.props.performTransaction(...queries);
                    this.getConnectionsFromOtherVocabularies();
                    this.setState({ selected: [] });
                  }
                );
              }}
            >
              {"➕" +
                (this.state.selected.length > 0
                  ? ` ${this.state.selected.length}`
                  : "")}
            </Button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltipB">
                {
                  Locale[AppSettings.interfaceLanguage]
                    .connectionListEmptySelection
                }
              </Tooltip>
            }
          >
            <Button
              className={"buttonlink"}
              onClick={() => this.setState({ selected: [] })}
            >
              {"🚮"}
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltipC">
                {
                  Locale[AppSettings.interfaceLanguage]
                    .connectionListShowSelection
                }
              </Tooltip>
            }
          >
            <Button
              className={"buttonlink"}
              onClick={() =>
                this.setState((prevState) => ({
                  selected: _.uniq(
                    prevState.selected.concat(this.state.shownConnections)
                  ),
                }))
              }
            >
              {"✅"}
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltipD">
                {Locale[AppSettings.interfaceLanguage].connectionListShowFilter}
              </Tooltip>
            }
          >
            <Button
              className={"buttonlink"}
              onClick={() =>
                this.setState((prevState) => {
                  return {
                    showFilter: !this.state.showFilter,
                    filter: {
                      ...prevState.filter,
                      ...(AppSettings.representation ===
                        Representation.COMPACT && { connection: "" }),
                    },
                  };
                })
              }
            >
              {"🔍"}
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltipE">
                {
                  Locale[AppSettings.interfaceLanguage]
                    .connectionListEmptyFilter
                }
              </Tooltip>
            }
          >
            <Button
              className={"buttonlink"}
              onClick={() =>
                this.setState(
                  {
                    filter: {
                      hidden: "",
                      ontoType: "",
                      typeType: "",
                      search: "",
                      direction: "",
                      connection: "",
                      scheme: "",
                    },
                  },
                  () => this.setState({ shownConnections: this.filter() })
                )
              }
            >
              {"❌"}
            </Button>
          </OverlayTrigger>
        </div>
        {this.state.showFilter && (
          <ConnectionFilter
            projectLanguage={this.props.projectLanguage}
            updateFilter={this.updateFilter}
            filter={this.state.filter}
            showFilter={this.state.showFilter}
          />
        )}
        <TableList>
          {this.state.shownConnections.map((linkID) => (
            <ConnectionWorkspace
              key={linkID}
              selected={this.state.selected.includes(linkID)}
              linkID={linkID}
              elemID={this.props.id}
              projectLanguage={this.props.projectLanguage}
              updateSelection={this.updateSelection}
              selection={this.state.selected}
            />
          ))}
        </TableList>
        <div className={"lucene"}>
          <button
            onClick={() => {
              this.setState({ showLucene: !this.state.showLucene }, () => {
                if (this.state.showLucene)
                  this.getConnectionsFromOtherVocabularies();
              });
            }}
            className="buttonlink"
          >
            {(this.state.showLucene ? "ᐯ " : "ᐱ ") +
              Locale[AppSettings.interfaceLanguage].termsFromOtherLanguages}
          </button>
        </div>
        {this.state.showLucene && (
          <TableList>
            {this.state.shownLucene
              .filter((connection) =>
                getLabelOrBlank(
                  connection.target.labels,
                  this.props.projectLanguage
                )
                  .toLowerCase()
                  .trim()
                  .includes(this.state.filter.search)
              )
              .map((connection) => (
                <ConnectionCache
                  key={`${connection.link}->${connection.target.iri}`}
                  connection={connection}
                  projectLanguage={this.props.projectLanguage}
                  update={() => {
                    this.getConnectionsFromOtherVocabularies();
                    this.setState({ selected: [] });
                  }}
                  elemID={this.props.id}
                  selected={this.state.selected.includes(connection.target.iri)}
                  selection={this.state.selected}
                  updateSelection={this.updateSelection}
                />
              ))}
          </TableList>
        )}
      </div>
    );
  }
}
