import AddIcon from "@mui/icons-material/Add";
import DeselectIcon from "@mui/icons-material/Deselect";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import classNames from "classnames";
import React from "react";
import { Button, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import _ from "underscore";
import { Representation } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Links,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { ElementFilter } from "../../../../datatypes/ElementFilter";
import { getCacheConnections } from "../../../../function/FunctionCache";
import { isElementHidden } from "../../../../function/FunctionElem";
import {
  getElementVocabulary,
  getLabelOrBlank,
} from "../../../../function/FunctionGetVars";
import { spreadConnections } from "../../../../function/FunctionGraph";
import { getOtherConnectionElementID } from "../../../../function/FunctionLink";
import { CacheConnection } from "../../../../types/CacheConnection";
import ConnectionCache from "./ConnectionCache";
import ConnectionFilter from "./ConnectionFilter";
import ConnectionWorkspace from "./ConnectionWorkspace";

interface Props {
  //Element ID from DetailElement
  id: string;
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  infoFunction: (link: string) => void;
}

interface State {
  filter: ElementFilter;
  selected: string[];
  shownConnections: string[];
  showFilter: boolean;
  showLucene: boolean;
  shownLucene: CacheConnection[];
  loadingLucene: boolean;
}

export default class ConnectionList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filter: {
        hidden: false,
        search: "",
        direction: "",
        connection: "",
        scheme: "",
      },
      selected: [],
      shownConnections: [],
      showFilter: false,
      showLucene: true,
      shownLucene: [],
      loadingLucene: false,
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

  getVocabularyOptions() {
    return _.uniq(
      [getElementVocabulary(this.props.id)]
        .concat(
          Object.keys(WorkspaceLinks)
            .filter((link) => {
              if (!WorkspaceLinks[link].active) return false;
              if (
                this.props.id !== WorkspaceLinks[link].source &&
                this.props.id !== WorkspaceLinks[link].target
              )
                return false;
              return AppSettings.representation === Representation.FULL
                ? WorkspaceLinks[link].iri in Links
                : !(WorkspaceLinks[link].iri in Links) ||
                    (WorkspaceLinks[link].iri in Links &&
                      Links[WorkspaceLinks[link].iri].inScheme.startsWith(
                        AppSettings.ontographerContext
                      ));
            })
            .map((conn) => getElementVocabulary(WorkspaceLinks[conn].target))
        )
        .concat(this.state.shownLucene.map((conn) => conn.target.vocabulary))
    ).sort();
  }
  getConnectionsFromOtherVocabularies() {
    this.setState({ loadingLucene: true });
    getCacheConnections(this.props.id).then((connections) =>
      this.setState(
        {
          shownLucene: connections,
          loadingLucene: false,
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
          getElementVocabulary(otherElement) !== this.state.filter.scheme
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
    this.getConnectionsFromOtherVocabularies();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.id !== this.props.id && this.props.id) {
      this.setState({ shownConnections: this.filter() });
    }
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
        <div className="buttons">
          <OverlayTrigger
            placement="top"
            delay={1000}
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
              variant="light"
              className={classNames("plainButton", {
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
              <AddIcon />
              {this.state.selected.length > 0 && (
                <span>&nbsp;{this.state.selected.length}</span>
              )}
            </Button>
          </OverlayTrigger>

          <OverlayTrigger
            delay={1000}
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
              variant="light"
              className={"plainButton"}
              onClick={() => this.setState({ selected: [] })}
            >
              <DeselectIcon />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            delay={1000}
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
              variant="light"
              className={"plainButton"}
              onClick={() =>
                this.setState((prevState) => ({
                  selected: _.uniq(
                    prevState.selected.concat(this.state.shownConnections)
                  ),
                }))
              }
            >
              <SelectAllIcon />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            delay={1000}
            placement="top"
            overlay={
              <Tooltip id="tooltipD">
                {Locale[AppSettings.interfaceLanguage].connectionListShowFilter}
              </Tooltip>
            }
          >
            <Button
              variant="light"
              className={"plainButton"}
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
              <FilterAltIcon />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            delay={1000}
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
              variant="light"
              className={"plainButton"}
              onClick={() =>
                this.setState(
                  {
                    filter: {
                      hidden: false,
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
              <FilterAltOffIcon />
            </Button>
          </OverlayTrigger>
        </div>
        {this.state.showFilter && (
          <ConnectionFilter
            projectLanguage={this.props.projectLanguage}
            updateFilter={this.updateFilter}
            filter={this.state.filter}
            showFilter={this.state.showFilter}
            vocabularies={this.getVocabularyOptions()}
          />
        )}
        <div>
          {this.state.shownConnections.map((linkID) => (
            <ConnectionWorkspace
              key={linkID}
              selected={this.state.selected.includes(linkID)}
              linkID={linkID}
              elemID={this.props.id}
              projectLanguage={this.props.projectLanguage}
              updateSelection={this.updateSelection}
              selection={this.state.selected}
              infoFunction={(link: string) => this.props.infoFunction(link)}
              performTransaction={this.props.performTransaction}
              update={() => this.setState({ shownConnections: this.filter() })}
            />
          ))}
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
                performTransaction={this.props.performTransaction}
              />
            ))}
          {this.state.loadingLucene && (
            <div className="spinnerFlex">
              <Spinner animation="border" variant="dark" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
