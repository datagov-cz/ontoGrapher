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
import IRIlabel from "../../components/IRIlabel";
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
import { parsePrefix } from "../../function/FunctionEditVars";
import { Cardinality } from "../../datatypes/Cardinality";
import { LinkType, Representation } from "../../config/Enum";
import { Locale } from "../../config/Locale";
import { unHighlightCell } from "../../function/FunctionDraw";
import { updateProjectLink } from "../../queries/update/UpdateLinkQueries";
import { updateConnections } from "../../queries/update/UpdateConnectionQueries";
import AltLabelTable from "./components/AltLabelTable";
import App from "../../main/App";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  handleWidth: Function;
  error: boolean;
  updateDetailPanel: Function;
}

interface State {
  id: string;
  iri: string;
  sourceCardinality: string;
  targetCardinality: string;
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
      inputAltLabels: [],
      selectedLabel: {},
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

  prepareDetails(id?: string) {
    if (id) {
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
        iri: WorkspaceLinks[id].iri,
        inputAltLabels:
          WorkspaceLinks[id].iri in WorkspaceTerms
            ? WorkspaceTerms[WorkspaceLinks[id].iri].altLabels
            : [],
        changes: false,
        readOnly:
          WorkspaceVocabularies[
            getVocabularyFromScheme(
              WorkspaceTerms[WorkspaceElements[WorkspaceLinks[id].source].iri]
                .inScheme
            )
          ].readOnly,
      });
    } else this.setState({ id: "" });
  }

  save() {
    if (this.state.id in WorkspaceLinks) {
      const queries: string[] = [];
      if (AppSettings.representation === Representation.FULL) {
        WorkspaceLinks[this.state.id].sourceCardinality =
          CardinalityPool[parseInt(this.state.sourceCardinality, 10)] ||
          new Cardinality("", "");
        WorkspaceLinks[this.state.id].targetCardinality =
          CardinalityPool[parseInt(this.state.targetCardinality, 10)] ||
          new Cardinality("", "");
        WorkspaceLinks[this.state.id].iri = this.state.iri;
        const link = graph.getLinks().find((link) => link.id === this.state.id);
        if (link) {
          setLabels(
            link,
            getLinkOrVocabElem(this.state.iri).labels[
              this.props.projectLanguage
            ]
          );
        }
        this.setState({ changes: false });
        this.props.save(this.state.id);
        queries.push(
          updateProjectLink(true, this.state.id),
          updateConnections(this.state.id)
        );
      } else {
        WorkspaceLinks[this.state.id].sourceCardinality =
          CardinalityPool[parseInt(this.state.sourceCardinality, 10)];
        WorkspaceLinks[this.state.id].targetCardinality =
          CardinalityPool[parseInt(this.state.targetCardinality, 10)];
        const link = graph.getLinks().find((link) => link.id === this.state.id);
        if (link) {
          setLabels(
            link,
            getLinkOrVocabElem(this.state.iri).labels[
              this.props.projectLanguage
            ]
          );
          const underlyingConnections = getUnderlyingFullConnections(link);
          if (underlyingConnections) {
            const sourceCard =
              CardinalityPool[parseInt(this.state.sourceCardinality, 10)];
            const targetCard =
              CardinalityPool[parseInt(this.state.targetCardinality, 10)];
            WorkspaceLinks[underlyingConnections.src].sourceCardinality =
              new Cardinality(
                sourceCard.getFirstCardinality(),
                sourceCard.getFirstCardinality()
              );
            WorkspaceLinks[underlyingConnections.src].targetCardinality =
              new Cardinality(
                sourceCard.getSecondCardinality(),
                sourceCard.getSecondCardinality()
              );
            WorkspaceLinks[underlyingConnections.tgt].sourceCardinality =
              new Cardinality(
                targetCard.getFirstCardinality(),
                targetCard.getFirstCardinality()
              );
            WorkspaceLinks[underlyingConnections.tgt].targetCardinality =
              new Cardinality(
                targetCard.getSecondCardinality(),
                targetCard.getSecondCardinality()
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
          queries.push(updateProjectLink(true, this.state.id));
        }
        this.setState({ changes: false });
        this.props.save(this.state.id);
      }
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
          onResizeStop={() => {
            const elem = document.querySelector(".details");
            if (elem)
              this.props.handleWidth(elem.getBoundingClientRect().width);
          }}
          className={"details" + (this.props.error ? " disabled" : "")}
        >
          <div className={this.props.error ? " disabled" : ""}>
            <button
              className={"buttonlink close nounderline"}
              onClick={() => {
                unHighlightCell(this.state.id);
                this.props.updateDetailPanel();
              }}
            >
              <span role="img" aria-label={""}>
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
            <Accordion defaultActiveKey={"0"}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
                    {Locale[AppSettings.viewLanguage].description}
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
                                Locale[AppSettings.viewLanguage]
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
                                Locale[AppSettings.viewLanguage]
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
                              {Locale[AppSettings.viewLanguage].linkType}
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
                            <IRIlabel
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
                            Locale[AppSettings.viewLanguage]
                              .detailPanelPrefLabel
                          }
                          iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}
                        />
                      }
                    </h5>
                    <TableList>
                      {Object.keys(
                        getLinkOrVocabElem(this.state.iri).labels
                      ).map((lang) => (
                        <tr key={lang}>
                          <td>
                            {getLinkOrVocabElem(this.state.iri).labels[lang]}
                          </td>
                          <td>{Languages[lang]}</td>
                        </tr>
                      ))}
                    </TableList>
                    {AppSettings.representation === Representation.COMPACT && (
                      <div>
                        <h5>
                          {
                            <IRILink
                              label={
                                Locale[AppSettings.viewLanguage]
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
                          readOnly={
                            true
                            // WorkspaceVocabularies[
                            //   getVocabularyFromScheme(
                            //     WorkspaceTerms[
                            //       WorkspaceElements[this.state.id].iri
                            //     ].inScheme
                            //   )
                            // ].readOnly
                          }
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
                                    WorkspaceElements[this.state.id].iri
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
                            this.state.selectedLabel[this.props.projectLanguage]
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
                            Locale[AppSettings.viewLanguage].detailPanelInScheme
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
                          <IRIlabel
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

                    {Object.keys(getLinkOrVocabElem(this.state.iri).definitions)
                      .length > 0 && (
                      <div>
                        <h5>
                          {
                            <IRILink
                              label={
                                Locale[AppSettings.viewLanguage]
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
        </ResizableBox>
      )
    );
  }
}
