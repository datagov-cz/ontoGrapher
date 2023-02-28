import React from "react";
import { Accordion, Button, Card, Form } from "react-bootstrap";
import IRILabel from "../../components/IRILabel";
import IRILink from "../../components/IRILink";
import TableList from "../../components/TableList";
import { DetailPanelMode, LinkType, Representation } from "../../config/Enum";
import { Languages } from "../../config/Languages";
import { Locale } from "../../config/Locale";
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
interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
  updateDetailPanel: (mode: DetailPanelMode, id?: string) => void;
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

  render() {
    return (
      <div className={"accordions"}>
        <Accordion defaultActiveKey={"0"}>
          <Card>
            <Card.Header>
              <Accordion.Header as={Button} variant={"link"} eventKey={"0"}>
                {Locale[AppSettings.interfaceLanguage].description}
              </Accordion.Header>
            </Card.Header>
            <Accordion.Collapse eventKey={"0"}>
              <Card.Body>
                {WorkspaceLinks[this.props.id].type === LinkType.DEFAULT && (
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
                        {!this.state.readOnly ? (
                          <Form.Control
                            as="select"
                            value={this.state.sourceCardinality}
                            onChange={(event) => {
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
                        ) : (
                          CardinalityPool[
                            parseInt(this.state.sourceCardinality, 10)
                          ].getString()
                        )}
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
                        {!this.state.readOnly ? (
                          <Form.Control
                            as="select"
                            value={this.state.targetCardinality}
                            onChange={(event) => {
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
                        ) : (
                          CardinalityPool[
                            parseInt(this.state.targetCardinality, 10)
                          ].getString()
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className={"first"}>
                        <span>
                          {Locale[AppSettings.interfaceLanguage].linkType}
                        </span>
                      </td>
                      {AppSettings.representation === Representation.FULL &&
                      !this.state.readOnly ? (
                        <td className={"last"}>
                          <Form.Control
                            as="select"
                            value={this.state.iri}
                            onChange={(event) => {
                              this.setState({
                                iri: event.currentTarget.value,
                                changes: true,
                              });
                            }}
                          >
                            {this.prepareLinkOptions()}
                          </Form.Control>
                        </td>
                      ) : (
                        <IRILabel
                          label={getLabelOrBlank(
                            getLinkOrVocabElem(this.state.iri).labels,
                            this.props.projectLanguage
                          )}
                          iri={this.state.iri}
                        />
                      )}
                    </tr>
                  </TableList>
                )}
                <h5>
                  {
                    <IRILink
                      label={
                        Locale[AppSettings.interfaceLanguage]
                          .detailPanelInScheme
                      }
                      iri={"http://www.w3.org/2004/02/skos/core#inScheme"}
                    />
                  }
                </h5>
                <TableList>
                  {Object.keys(
                    WorkspaceVocabularies[
                      getVocabularyFromScheme(
                        getLinkOrVocabElem(this.state.iri).inScheme
                      )
                    ].labels
                  ).map((lang) => (
                    <tr key={lang}>
                      <IRILabel
                        label={
                          WorkspaceVocabularies[
                            getVocabularyFromScheme(
                              getLinkOrVocabElem(this.state.iri).inScheme
                            )
                          ].labels[lang]
                        }
                        iri={getVocabularyFromScheme(
                          getLinkOrVocabElem(this.state.iri).inScheme
                        )}
                      />
                      <td>{Languages[lang]}</td>
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
