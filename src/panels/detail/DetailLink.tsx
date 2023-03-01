import LabelIcon from "@mui/icons-material/Label";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import classNames from "classnames";
import React from "react";
import { Button, Dropdown, Form } from "react-bootstrap";
import { LanguageSelector } from "../../components/LanguageSelector";
import { LinkType, Representation } from "../../config/Enum";
import {
  AppSettings,
  CardinalityPool,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Cardinality } from "../../datatypes/Cardinality";
import {
  getDisplayLabel,
  getListClassNamesObject,
} from "../../function/FunctionDraw";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getUnderlyingFullConnections,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import { setLabels } from "../../function/FunctionGraph";
import { setFullLinksCardinalitiesFromCompactLink } from "../../function/FunctionLink";
import { graph } from "../../graph/Graph";
import { updateConnections } from "../../queries/update/UpdateConnectionQueries";
import { updateProjectElement } from "../../queries/update/UpdateElementQueries";
import { updateProjectLink } from "../../queries/update/UpdateLinkQueries";
import { ListItemControls } from "./components/items/ListItemControls";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
  id: string;
}

interface State {
  iri: string;
  sourceCardinality: string;
  targetCardinality: string;
  inputLabels: { [key: string]: string };
  inputAltLabels: { label: string; language: string }[];
  selectedLabel: { [key: string]: string };
  newAltInput: string;
  changes: boolean;
  readOnly: boolean;
  selectedLanguage: string;
}

export default class DetailLink extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      iri: Object.keys(Links)[0],
      sourceCardinality: "0",
      targetCardinality: "0",
      inputLabels: {},
      inputAltLabels: [],
      selectedLabel: initLanguageObject(""),
      newAltInput: "",
      changes: false,
      readOnly: false,
      selectedLanguage: AppSettings.canvasLanguage,
    };
  }

  componentDidMount() {
    this.prepareDetails(this.props.id);
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    if (prevState.changes !== this.state.changes && this.state.changes) {
      this.save();
    }
    if (prevProps.id !== this.props.id && this.props.id) {
      this.prepareDetails(this.props.id);
    }
  }

  isReadOnly(id: string): boolean {
    const iri =
      id in WorkspaceElements
        ? WorkspaceLinks[id].iri
        : WorkspaceLinks[id].source;
    return WorkspaceVocabularies[
      getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)
    ].readOnly;
  }

  prepareLinkOptions() {
    const result: JSX.Element[] = [];
    if (AppSettings.representation === Representation.FULL) {
      for (const iri in Links) {
        if (Links[iri].type === LinkType.DEFAULT)
          result.push(
            <option key={iri} value={iri}>
              {getLabelOrBlank(Links[iri].labels, this.props.projectLanguage)}
            </option>
          );
      }
    } else if (AppSettings.representation === Representation.COMPACT) {
      for (const iri in WorkspaceTerms) {
        if (
          WorkspaceTerms[iri].types.includes(
            parsePrefix("z-sgov-pojem", "typ-vztahu")
          )
        )
          result.push(
            <option value={iri}>
              {getLabelOrBlank(Links[iri].labels, this.props.projectLanguage)}
            </option>
          );
      }
    }
    return result;
  }

  prepareCardinality(cardinality: string): Cardinality {
    return (
      CardinalityPool[parseInt(cardinality, 10)] || new Cardinality("", "")
    );
  }

  setCardinality(
    linkID: string,
    sourceCardinality: Cardinality,
    targetCardinality: Cardinality
  ) {
    WorkspaceLinks[linkID].sourceCardinality = sourceCardinality;
    WorkspaceLinks[linkID].targetCardinality = targetCardinality;
  }

  prepareDetails(id?: string) {
    if (id) {
      const iri = WorkspaceLinks[id].iri;
      const sourceCardinality = CardinalityPool.findIndex(
        (card) =>
          card.getString() === WorkspaceLinks[id].sourceCardinality.getString()
      );
      const targetCardinality = CardinalityPool.findIndex(
        (card) =>
          card.getString() === WorkspaceLinks[id].targetCardinality.getString()
      );
      this.setState({
        sourceCardinality:
          sourceCardinality === -1 ? "0" : sourceCardinality.toString(10),
        targetCardinality:
          targetCardinality === -1 ? "0" : targetCardinality.toString(10),
        iri: iri,
        inputAltLabels:
          iri in WorkspaceTerms ? WorkspaceTerms[iri].altLabels : [],
        changes: false,
        selectedLabel:
          iri in WorkspaceElements
            ? WorkspaceElements[iri].selectedLabel
            : initLanguageObject(""),
        newAltInput: "",
        inputLabels: getLinkOrVocabElem(iri).labels,
        readOnly: this.isReadOnly(id),
      });
    }
  }

  save() {
    if (this.props.id in WorkspaceLinks) {
      const queries: string[] = [];
      const sourceCardinality = this.prepareCardinality(
        this.state.sourceCardinality
      );
      const targetCardinality = this.prepareCardinality(
        this.state.targetCardinality
      );
      this.setCardinality(this.props.id, sourceCardinality, targetCardinality);
      const link = graph.getLinks().find((link) => link.id === this.props.id);
      if (link) {
        setLabels(
          link,
          getLinkOrVocabElem(this.state.iri).labels[this.props.projectLanguage]
        );
      }
      if (AppSettings.representation === Representation.FULL) {
        WorkspaceLinks[this.props.id].iri = this.state.iri;
        queries.push(updateConnections(this.props.id));
      } else {
        const link = graph.getLinks().find((link) => link.id === this.props.id);
        if (link) {
          if (this.state.iri) {
            WorkspaceElements[this.state.iri].selectedLabel =
              this.state.selectedLabel;
            WorkspaceTerms[this.state.iri].altLabels =
              this.state.inputAltLabels;
            setLabels(
              link,
              WorkspaceElements[this.state.iri].selectedLabel[
                this.props.projectLanguage
              ]
            );
            WorkspaceTerms[this.state.iri].labels = this.state.inputLabels;
            queries.push(updateProjectElement(true, this.state.iri));
          }
          const underlyingConnections = getUnderlyingFullConnections(
            this.props.id
          );
          if (underlyingConnections) {
            setFullLinksCardinalitiesFromCompactLink(
              this.props.id,
              underlyingConnections.src,
              underlyingConnections.tgt
            );
            queries.push(
              updateProjectLink(
                true,
                underlyingConnections.src,
                underlyingConnections.tgt
              ),
              updateConnections(underlyingConnections.src),
              updateConnections(underlyingConnections.tgt)
            );
          }
        }
      }
      queries.push(updateProjectLink(true, this.props.id));
      this.setState({ changes: false });
      this.props.save(this.props.id);
      this.props.performTransaction(...queries);
    }
  }

  isAltLabelSelectedLabel(alt: { label: string; language: string }): boolean {
    return (
      this.state.selectedLabel[this.props.projectLanguage] === alt.label &&
      this.props.projectLanguage === alt.language
    );
  }

  render() {
    const altLabels = this.state.inputAltLabels.filter(
      (alt) => alt.language === this.props.projectLanguage
    );
    return (
      <div className="detailElement">
        <div className={"accordions"}>
          <div className={"detailTitle"}>
            <div className="top">
              <span className="languageSelect">
                <LanguageSelector
                  language={this.state.selectedLanguage}
                  setLanguage={(lang: string) =>
                    this.setState({ selectedLanguage: lang })
                  }
                />
              </span>
              <span className="title link">
                <i>
                  {getDisplayLabel(
                    WorkspaceLinks[this.props.id].source,
                    this.state.selectedLanguage
                  )}
                </i>
                &nbsp;
                <b>
                  {getLabelOrBlank(
                    getLinkOrVocabElem(WorkspaceLinks[this.props.id].iri)
                      .labels,
                    this.state.selectedLanguage
                  )}
                </b>
                &nbsp;
                <i>
                  {getDisplayLabel(
                    WorkspaceLinks[this.props.id].target,
                    this.state.selectedLanguage
                  )}
                </i>
              </span>
            </div>
          </div>

          <h5>Kardinality</h5>
          <div className="linkCardinalities">
            <svg
              width="100%"
              height="24px"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id={"link"}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerUnits="strokeWidth"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
                </marker>
              </defs>
              <line
                x1="2%"
                y1="50%"
                x2="100%"
                y2="50%"
                strokeWidth="2"
                stroke="#000"
                markerEnd={"url(#link)"}
              />
            </svg>
            <Dropdown>
              <Dropdown.Toggle
                className="plainButton"
                variant="light"
                disabled={this.state.readOnly}
              >
                {CardinalityPool[
                  parseInt(this.state.sourceCardinality, 10)
                ].getString()}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {CardinalityPool.map((card, i) => (
                  <Dropdown.Item
                    disabled={i.toString(10) === this.state.sourceCardinality}
                  >
                    {card.getString()}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {this.props.id in WorkspaceLinks && (
              <span className="plainButton">
                {getLabelOrBlank(
                  getLinkOrVocabElem(WorkspaceLinks[this.props.id].iri).labels,
                  this.state.selectedLanguage
                )}
              </span>
            )}
            <Dropdown>
              <Dropdown.Toggle
                disabled={this.state.readOnly}
                className="plainButton"
                variant="light"
              >
                {CardinalityPool[
                  parseInt(this.state.targetCardinality, 10)
                ].getString()}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {CardinalityPool.map((card, i) => (
                  <Dropdown.Item
                    disabled={i.toString(10) === this.state.targetCardinality}
                  >
                    {card.getString()}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <h5>Synonyma</h5>
          {altLabels.map((alt, i) => (
            <div
              className={classNames(
                "detailInput",
                "form-control",
                "form-control-sm",
                getListClassNamesObject(altLabels, i)
              )}
            >
              <span
                className={classNames({
                  bold: this.isAltLabelSelectedLabel(alt),
                })}
              >
                {alt.label}
              </span>
              <span className="right">
                <Button variant="light" className={classNames("plainButton")}>
                  {this.isAltLabelSelectedLabel(alt) ? (
                    <LabelOffIcon />
                  ) : (
                    false && <LabelIcon />
                  )}
                </Button>
              </span>
            </div>
          ))}
          {altLabels.length === 0 && (
            <Form.Control
              className="detailInput noInput"
              disabled
              value=""
              size="sm"
            />
          )}
          <ListItemControls
            addAction={(label: string) => {
              if (
                label !== "" ||
                this.state.inputAltLabels.find((alt) => alt.label === label)
              ) {
                this.setState((prev) => ({
                  ...prev,
                  inputAltLabels: [
                    ...prev.inputAltLabels,
                    {
                      label: label,
                      language: this.props.projectLanguage,
                    },
                  ],
                  changes: true,
                }));
              }
            }}
            popover={true}
            tooltipText={"Vytvořit nový synonym"}
            disableAddControl={this.state.readOnly}
          />
        </div>
      </div>
    );
  }
}
