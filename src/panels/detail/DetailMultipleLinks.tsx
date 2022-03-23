import React from "react";
import {
  getExpressionByRepresentation,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getUnderlyingFullConnections,
  isTermReadOnly,
} from "../../function/FunctionGetVars";
import { DetailPanelMode, LinkType, Representation } from "../../config/Enum";
import { Accordion, Button, Card, Form } from "react-bootstrap";
import { Locale } from "../../config/Locale";
import {
  AppSettings,
  CardinalityPool,
  Links,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import TableList from "../../components/TableList";
import { graph } from "../../graph/Graph";
import { setLabels } from "../../function/FunctionGraph";
import { updateConnections } from "../../queries/update/UpdateConnectionQueries";
import { Cardinality } from "../../datatypes/Cardinality";
import { updateProjectLink } from "../../queries/update/UpdateLinkQueries";
import { getDisplayLabel } from "../../function/FunctionDraw";

type Props = {
  error: boolean;
  updateDetailPanel: (mode: DetailPanelMode, id?: string) => void;
  projectLanguage: string;
  save: (...ids: string[]) => void;
  performTransaction: (...queries: string[]) => void;
};

type State = {
  sourceCardinality: string;
  targetCardinality: string;
  changes: boolean;
  readOnly: boolean;
};

export default class DetailMultipleLinks extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sourceCardinality: "0",
      targetCardinality: "0",
      changes: false,
      readOnly: false,
    };
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
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
      <div className={"accordions"}>
        <Accordion defaultActiveKey={"0"}>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
                {Locale[AppSettings.interfaceLanguage].description}
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={"0"}>
              <Card.Body>
                <TableList>
                  <tr>
                    <td className={"first"}>
                      <span>
                        {
                          Locale[AppSettings.interfaceLanguage]
                            .sourceCardinality
                        }
                      </span>
                    </td>
                    <td className={"last"}>
                      {
                        <Form.Control
                          as="select"
                          disabled={this.state.readOnly}
                          value={this.state.sourceCardinality}
                          onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>
                          ) => {
                            this.setState({
                              sourceCardinality: event.currentTarget.value,
                              changes: true,
                            });
                          }}
                        >
                          {CardinalityPool.map((card, i) => (
                            <option key={i} value={i.toString(10)}>
                              {card.getString()}
                            </option>
                          ))}
                        </Form.Control>
                      }
                    </td>
                  </tr>
                  <tr>
                    <td className={"first"}>
                      <span>
                        {
                          Locale[AppSettings.interfaceLanguage]
                            .targetCardinality
                        }
                      </span>
                    </td>
                    <td className={"last"}>
                      {
                        <Form.Control
                          disabled={this.state.readOnly}
                          as="select"
                          value={this.state.targetCardinality}
                          onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>
                          ) => {
                            this.setState({
                              targetCardinality: event.currentTarget.value,
                              changes: true,
                            });
                          }}
                        >
                          {CardinalityPool.map((card, i) => (
                            <option key={i} value={i.toString(10)}>
                              {card.getString()}
                            </option>
                          ))}
                        </Form.Control>
                      }
                    </td>
                  </tr>
                </TableList>
                <p>
                  {this.state.readOnly
                    ? getExpressionByRepresentation({
                        [Representation.COMPACT]:
                          "detailPanelMultipleRelationshipsNotEditable",
                        [Representation.FULL]:
                          "detailPanelMultipleLinksNotEditable",
                      })
                    : getExpressionByRepresentation({
                        [Representation.COMPACT]:
                          "detailPanelMultipleRelationshipsEditable",
                        [Representation.FULL]:
                          "detailPanelMultipleLinksEditable",
                      })}
                </p>
                <TableList>
                  {this.getEditableLinks().map((link) => (
                    <tr key={link}>
                      <td>
                        {getLabelOrBlank(
                          getLinkOrVocabElem(WorkspaceLinks[link].iri).labels,
                          this.props.projectLanguage
                        )}
                      </td>
                    </tr>
                  ))}
                </TableList>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
    );
  }
}
