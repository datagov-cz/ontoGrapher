import React from "react";
import {
  AppSettings,
  CardinalityPool,
  Languages,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Accordion, Button, Card, Form } from "react-bootstrap";
import TableList from "../../components/TableList";
import IRILink from "../../components/IRILink";
import { ResizableBox } from "react-resizable";
import { graph } from "../../graph/Graph";
import DescriptionTabs from "./components/DescriptionTabs";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getUnderlyingFullConnections,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import { setLabels } from "../../function/FunctionGraph";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { Cardinality } from "../../datatypes/Cardinality";
import { LinkType, Representation } from "../../config/Enum";
import { Locale } from "../../config/Locale";
import { unHighlightCell } from "../../function/FunctionDraw";
import { updateProjectLink } from "../../queries/update/UpdateLinkQueries";
import { updateConnections } from "../../queries/update/UpdateConnectionQueries";
import AltLabelTable from "./components/AltLabelTable";
import { updateProjectElement } from "../../queries/update/UpdateElementQueries";
import LabelTable from "./components/LabelTable";
import IRILabel from "../../components/IRILabel";
import { setFullLinksCardinalitiesFromCompactLink } from "../../function/FunctionLink";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
  updateDetailPanel: Function;
}

interface State {
  id: string;
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
      id: "",
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

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    if (prevState !== this.state && this.state.changes) {
      this.save();
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
        id: id,
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
    } else this.setState({ id: "" });
  }

  save() {
    if (this.state.id in WorkspaceLinks) {
      const queries: string[] = [];
      const sourceCardinality = this.prepareCardinality(
        this.state.sourceCardinality
      );
      const targetCardinality = this.prepareCardinality(
        this.state.targetCardinality
      );
      this.setCardinality(this.state.id, sourceCardinality, targetCardinality);
      const link = graph.getLinks().find((link) => link.id === this.state.id);
      if (link) {
        setLabels(
          link,
          getLinkOrVocabElem(this.state.iri).labels[this.props.projectLanguage]
        );
      }
      if (AppSettings.representation === Representation.FULL) {
        WorkspaceLinks[this.state.id].iri = this.state.iri;
        queries.push(updateConnections(this.state.id));
      } else {
        const link = graph.getLinks().find((link) => link.id === this.state.id);
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
            this.state.id
          );
          if (underlyingConnections) {
            setFullLinksCardinalitiesFromCompactLink(
              this.state.id,
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
      queries.push(updateProjectLink(true, this.state.id));
      this.setState({ changes: false });
      this.props.save(this.state.id);
      this.props.performTransaction(...queries);
    }
  }

  render() {
    return (
      this.state.id !== "" &&
      this.state.id in WorkspaceLinks && (
        <ResizableBox
          width={300}
          height={1000}
          axis={"x"}
          handleSize={[8, 8]}
          resizeHandles={["sw"]}
          className={"details" + (this.props.error ? " disabled" : "")}
        >
          <div className={"detailsFlex"}>
            <div className={"detailTitle"}>
              <button
                className={"buttonlink close nounderline"}
                onClick={() => {
                  unHighlightCell(this.state.id);
                  this.props.updateDetailPanel();
                }}
              >
                <span
                  role="img"
                  aria-label={"Remove read-only term from workspace"}
                >
                  ➖
                </span>
              </button>
              <h3>
                <IRILink
                  label={
                    getLinkOrVocabElem(this.state.iri).labels[
                      this.props.projectLanguage
                    ]
                  }
                  iri={this.state.iri}
                />
              </h3>
            </div>
            <div className={"accordions"}>
              <Accordion defaultActiveKey={"0"}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      variant={"link"}
                      eventKey={"0"}
                    >
                      {Locale[AppSettings.interfaceLanguage].description}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey={"0"}>
                    <Card.Body>
                      {WorkspaceLinks[this.state.id].type ===
                        LinkType.DEFAULT && (
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
                                  onChange={(
                                    event: React.ChangeEvent<HTMLSelectElement>
                                  ) => {
                                    this.setState({
                                      sourceCardinality:
                                        event.currentTarget.value,
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
                                  onChange={(
                                    event: React.ChangeEvent<HTMLSelectElement>
                                  ) => {
                                    this.setState({
                                      targetCardinality:
                                        event.currentTarget.value,
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
                            {AppSettings.representation ===
                              Representation.FULL && !this.state.readOnly ? (
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
                                .detailPanelPrefLabel
                            }
                            iri={
                              "http://www.w3.org/2004/02/skos/core#prefLabel"
                            }
                          />
                        }
                      </h5>
                      <LabelTable
                        iri={this.state.iri}
                        labels={this.state.inputLabels}
                        default={
                          this.state.selectedLabel[this.props.projectLanguage]
                        }
                        selectAsDefault={(label: string) => {
                          let res = this.state.selectedLabel;
                          res[this.props.projectLanguage] = label;
                          this.setState({ selectedLabel: res, changes: true });
                        }}
                        onEdit={(label: string, lang: string) =>
                          this.setState((prevState) => ({
                            inputLabels: {
                              ...prevState.inputLabels,
                              [lang]: label,
                            },
                            changes: true,
                          }))
                        }
                      />
                      {AppSettings.representation ===
                        Representation.COMPACT && (
                        <div>
                          <h5>
                            {
                              <IRILink
                                label={
                                  Locale[AppSettings.interfaceLanguage]
                                    .detailPanelAltLabel
                                }
                                iri={
                                  "http://www.w3.org/2004/02/skos/core#altLabel"
                                }
                              />
                            }
                          </h5>
                          <AltLabelTable
                            labels={this.state.inputAltLabels}
                            readOnly={this.state.readOnly}
                            onEdit={(
                              textarea: string,
                              lang: string,
                              i: number
                            ) => {
                              let res = this.state.inputAltLabels;
                              let resL = this.state.selectedLabel;
                              if (textarea === "") {
                                if (
                                  res[i].label ===
                                  this.state.selectedLabel[
                                    this.props.projectLanguage
                                  ]
                                ) {
                                  resL[this.props.projectLanguage] =
                                    WorkspaceTerms[
                                      WorkspaceLinks[this.state.id].iri
                                    ].labels[this.props.projectLanguage];
                                }
                                res.splice(i, 1);
                              } else {
                                if (
                                  res[i].label ===
                                  this.state.selectedLabel[
                                    this.props.projectLanguage
                                  ]
                                ) {
                                  resL[this.props.projectLanguage] =
                                    lang === this.props.projectLanguage
                                      ? textarea
                                      : "";
                                }
                                res[i] = { label: textarea, language: lang };
                              }
                              this.setState({
                                inputAltLabels: res,
                                selectedLabel: resL,
                                changes: true,
                              });
                            }}
                            default={
                              this.state.selectedLabel[
                                this.props.projectLanguage
                              ]
                            }
                            selectAsDefault={(lang: string, i: number) => {
                              let res = this.state.selectedLabel;
                              res[this.props.projectLanguage] =
                                this.state.inputAltLabels[i].label;
                              this.setState({
                                selectedLabel: res,
                                changes: true,
                              });
                            }}
                            addAltLabel={(label: string) => {
                              if (
                                label !== "" ||
                                this.state.inputAltLabels.find(
                                  (alt) => alt.label === label
                                )
                              ) {
                                let res = this.state.inputAltLabels;
                                res.push({
                                  label: label,
                                  language: this.props.projectLanguage,
                                });
                                this.setState({
                                  inputAltLabels: res,
                                  changes: true,
                                });
                              }
                            }}
                          />
                        </div>
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

                      {Object.keys(
                        getLinkOrVocabElem(this.state.iri).definitions
                      ).length > 0 && (
                        <div>
                          <h5>
                            {
                              <IRILink
                                label={
                                  Locale[AppSettings.interfaceLanguage]
                                    .detailPanelDefinition
                                }
                                iri={
                                  "http://www.w3.org/2004/02/skos/core#definition"
                                }
                              />
                            }
                          </h5>
                          <DescriptionTabs
                            descriptions={
                              getLinkOrVocabElem(this.state.iri).definitions
                            }
                            readOnly={true}
                          />
                        </div>
                      )}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </div>
          </div>
        </ResizableBox>
      )
    );
  }
}
