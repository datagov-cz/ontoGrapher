import React from "react";
import { Alert, Dropdown, ListGroup } from "react-bootstrap";
import { LanguageSelector } from "../../components/LanguageSelector";
import { LinkType, Representation } from "../../config/Enum";
import { Locale } from "../../config/Locale";
import {
  AppSettings,
  CardinalityPool,
  Links,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import { Cardinality } from "../../datatypes/Cardinality";
import { getDisplayLabel } from "../../function/FunctionDraw";
import {
  getExpressionByRepresentation,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getUnderlyingFullConnections,
  isTermReadOnly,
} from "../../function/FunctionGetVars";
import { setLabels } from "../../function/FunctionGraph";
import { graph } from "../../graph/Graph";
import { updateConnections } from "../../queries/update/UpdateConnectionQueries";
import { updateProjectLink } from "../../queries/update/UpdateLinkQueries";

type Props = {
  error: boolean;
  projectLanguage: string;
  save: (...ids: string[]) => void;
  performTransaction: (...queries: string[]) => void;
};

type State = {
  sourceCardinality: string;
  targetCardinality: string;
  changes: boolean;
  readOnly: boolean;
  selectedLanguage: string;
};

export default class DetailMultipleLinks extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sourceCardinality: "0",
      targetCardinality: "0",
      changes: false,
      readOnly: false,
      selectedLanguage: AppSettings.canvasLanguage,
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (prevState.changes !== this.state.changes && this.state.changes) {
      if (
        prevState.sourceCardinality !== this.state.sourceCardinality &&
        this.state.sourceCardinality
      )
        this.save("sourceCardinality");
      if (
        prevState.targetCardinality !== this.state.targetCardinality &&
        this.state.targetCardinality
      )
        this.save("targetCardinality");
    }
  }

  componentDidMount() {
    this.prepareDetails();
  }

  prepareDetails() {
    this.setState({
      sourceCardinality: "0",
      targetCardinality: "0",
      readOnly: this.isReadOnly(),
    });
  }

  prepareCardinality(cardinality: string): Cardinality {
    return (
      CardinalityPool[parseInt(cardinality, 10)] || new Cardinality("", "")
    );
  }

  getEditableLinks(): string[] {
    return AppSettings.selectedLinks.filter(
      (link) =>
        link in WorkspaceLinks &&
        WorkspaceLinks[link].type === LinkType.DEFAULT &&
        !isTermReadOnly(WorkspaceLinks[link].source)
    );
  }

  setSourceCardinality(linkID: string, sourceCardinality: Cardinality) {
    WorkspaceLinks[linkID].sourceCardinality = sourceCardinality;
  }

  setTargetCardinality(linkID: string, targetCardinality: Cardinality) {
    WorkspaceLinks[linkID].targetCardinality = targetCardinality;
  }

  save(cardinality: "sourceCardinality" | "targetCardinality") {
    const queries: string[] = [];
    const sourceCardinality = this.prepareCardinality(
      this.state.sourceCardinality
    );
    const targetCardinality = this.prepareCardinality(
      this.state.targetCardinality
    );
    for (const id of AppSettings.selectedLinks) {
      const iri = WorkspaceLinks[id].iri;
      if (cardinality === "sourceCardinality")
        this.setSourceCardinality(id, sourceCardinality);
      if (cardinality === "targetCardinality")
        this.setTargetCardinality(id, targetCardinality);
      const link = graph.getLinks().find((link) => link.id === id);
      if (link) {
        let label = "";
        if (iri in Links)
          label = getLabelOrBlank(
            Links[iri].labels,
            this.props.projectLanguage
          );
        if (iri in WorkspaceTerms)
          label = getDisplayLabel(iri, this.props.projectLanguage);
        setLabels(link, label);
      }
      if (AppSettings.representation === Representation.COMPACT) {
        const underlyingConnections = getUnderlyingFullConnections(id);
        if (underlyingConnections) {
          const sourceLinkSourceCardinality = new Cardinality(
            targetCardinality.getFirstCardinality(),
            targetCardinality.getSecondCardinality(),
            true
          );
          const sourceLinkTargetCardinality = new Cardinality(
            sourceCardinality.getFirstCardinality(),
            sourceCardinality.getSecondCardinality(),
            true
          );
          const targetLinkSourceCardinality = new Cardinality(
            sourceCardinality.getFirstCardinality(),
            sourceCardinality.getSecondCardinality(),
            true
          );
          const targetLinkTargetCardinality = new Cardinality(
            targetCardinality.getFirstCardinality(),
            targetCardinality.getSecondCardinality(),
            true
          );
          this.setSourceCardinality(
            underlyingConnections.src,
            sourceLinkSourceCardinality
          );
          this.setTargetCardinality(
            underlyingConnections.src,
            sourceLinkTargetCardinality
          );
          this.setSourceCardinality(
            underlyingConnections.tgt,
            targetLinkSourceCardinality
          );
          this.setTargetCardinality(
            underlyingConnections.tgt,
            targetLinkTargetCardinality
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
      queries.push(updateProjectLink(true, ...AppSettings.selectedLinks));
      this.setState({ changes: false });
      this.props.save(...AppSettings.selectedLinks);
      this.props.performTransaction(...queries);
    }
  }

  isReadOnly(): boolean {
    return this.getEditableLinks().length === 0;
  }

  render() {
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
                  {getExpressionByRepresentation({
                    [Representation.COMPACT]:
                      "detailPanelMultipleRelationships",
                    [Representation.FULL]: "detailPanelMultipleLinks",
                  })}
                </i>
              </span>
            </div>
          </div>
          <h5>{Locale[AppSettings.interfaceLanguage].cardinalities}</h5>
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

            <span className="plainButton">
              {getExpressionByRepresentation({
                [Representation.COMPACT]: "detailPanelMultipleRelationships",
                [Representation.FULL]: "detailPanelMultipleLinks",
              })}
            </span>

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
          <br />
          <Alert variant={this.state.readOnly ? "danger" : "primary"}>
            {this.state.readOnly
              ? getExpressionByRepresentation({
                  [Representation.COMPACT]:
                    "detailPanelMultipleRelationshipsNotEditable",
                  [Representation.FULL]: "detailPanelMultipleLinksNotEditable",
                })
              : getExpressionByRepresentation({
                  [Representation.COMPACT]:
                    "detailPanelMultipleRelationshipsEditable",
                  [Representation.FULL]: "detailPanelMultipleLinksEditable",
                })}
          </Alert>
          <ListGroup>
            {this.getEditableLinks().map((link) => (
              <ListGroup.Item className="diagramEntry form-control form-control-sm">
                {getLabelOrBlank(
                  getLinkOrVocabElem(WorkspaceLinks[link].iri).labels,
                  this.props.projectLanguage
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>
    );
  }
}
