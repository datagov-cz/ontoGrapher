import React from "react";
import { ResizableBox } from "react-resizable";
import {
  AppSettings,
  Diagrams,
  Languages,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import {
  getExpressionByRepresentation,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
  getNewLink,
  getParentOfIntrinsicTropeType,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import { Accordion, Button, Card } from "react-bootstrap";
import TableList from "../../components/TableList";
import IRILink from "../../components/IRILink";
import LabelTable from "./components/LabelTable";
import DescriptionTabs from "./components/DescriptionTabs";
import { graph } from "../../graph/Graph";
import StereotypeOptions from "./components/StereotypeOptions";
import { Shapes } from "../../config/visual/Shapes";
import { Locale } from "../../config/Locale";
import {
  drawGraphElement,
  redrawElement,
  unHighlightCell,
} from "../../function/FunctionDraw";
import AltLabelTable from "./components/AltLabelTable";
import ConnectionList from "./components/connections/ConnectionList";
import { updateProjectElement } from "../../queries/update/UpdateElementQueries";
import { LinkType, Representation } from "../../config/Enum";
import { IntrinsicTropeTable } from "./components/IntrinsicTropeTable";
import { parsePrefix } from "../../function/FunctionEditVars";
import {
  deleteConnections,
  updateConnection,
} from "../../function/FunctionLink";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
  handleCreation: Function;
  updateDetailPanel: Function;
  updateDiagramCanvas: Function;
}

interface State {
  id: string;
  inputTypeType: string;
  inputTypeData: string;
  inputLabels: { [key: string]: string };
  inputAltLabels: { label: string; language: string }[];
  inputDefinitions: { [key: string]: string };
  selectedLabel: { [key: string]: string };
  newAltInput: string;
  readOnly: boolean;
  changes: boolean;
}

export default class DetailElement extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      id: "",
      inputTypeType: "",
      inputTypeData: "",
      inputLabels: {},
      inputAltLabels: [],
      inputDefinitions: {},
      selectedLabel: {},
      newAltInput: "",
      readOnly: true,
      changes: false,
    };
    this.updateStereotype = this.updateStereotype.bind(this);
    this.prepareDetails = this.prepareDetails.bind(this);
  }

  prepareDetails(id?: string) {
    id
      ? this.setState({
          id: id,
          selectedLabel: WorkspaceElements[id].selectedLabel,
          inputTypeType:
            WorkspaceTerms[WorkspaceElements[id].iri].types.find(
              (type) => type in Stereotypes && type in Shapes
            ) || "",
          inputTypeData:
            WorkspaceTerms[WorkspaceElements[id].iri].types.find(
              (type) => type in Stereotypes && !(type in Shapes)
            ) || "",
          inputLabels: WorkspaceTerms[WorkspaceElements[id].iri].labels,
          inputAltLabels: WorkspaceTerms[WorkspaceElements[id].iri].altLabels,
          inputDefinitions:
            WorkspaceTerms[WorkspaceElements[id].iri].definitions,
          newAltInput: "",
          changes: false,
          readOnly:
            WorkspaceVocabularies[
              getVocabularyFromScheme(
                WorkspaceTerms[WorkspaceElements[id].iri].inScheme
              )
            ].readOnly,
        })
      : this.setState({ id: "" });
  }

  save() {
    const elem = graph.getElements().find((elem) => elem.id === this.state.id);
    if (this.state.id in WorkspaceElements) {
      WorkspaceTerms[WorkspaceElements[this.state.id].iri].altLabels =
        this.state.inputAltLabels;
      WorkspaceTerms[WorkspaceElements[this.state.id].iri].definitions =
        this.state.inputDefinitions;
      WorkspaceElements[this.state.id].selectedLabel = this.state.selectedLabel;
      WorkspaceTerms[WorkspaceElements[this.state.id].iri].labels =
        this.state.inputLabels;
      if (elem) {
        drawGraphElement(
          elem,
          this.props.projectLanguage,
          AppSettings.representation
        );
      }

      if (
        this.state.inputTypeType ===
        parsePrefix("z-sgov-pojem", "typ-vlastnosti")
      ) {
        getParentOfIntrinsicTropeType(this.state.id).forEach((id) => {
          const elem = graph.getElements().find((elem) => elem.id === id);
          if (elem)
            drawGraphElement(
              elem,
              this.props.projectLanguage,
              AppSettings.representation
            );
        });
      }
      this.props.save(this.state.id);
      this.setState({ changes: false });
      this.prepareDetails(this.state.id);
      this.props.performTransaction(updateProjectElement(true, this.state.id));
    }
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    if (prevState.changes !== this.state.changes && this.state.changes) {
      this.save();
    }
  }

  updateStereotype(newStereotype: string, type: boolean) {
    const otherStereotype = type
      ? this.state.inputTypeData
      : this.state.inputTypeType;
    const stereotypes = WorkspaceTerms[
      WorkspaceElements[this.state.id].iri
    ].types.filter((stereotype) => !(stereotype in Stereotypes));
    if (newStereotype !== "") stereotypes.push(newStereotype);
    if (otherStereotype !== "")
      type
        ? stereotypes.push(otherStereotype)
        : stereotypes.unshift(otherStereotype);
    WorkspaceTerms[WorkspaceElements[this.state.id].iri].types = stereotypes;
    this.setState({
      changes: true,
    });
    type
      ? this.setState({ inputTypeType: newStereotype })
      : this.setState({ inputTypeData: newStereotype });
  }

  render() {
    return (
      this.state.id !== "" &&
      this.state.id in WorkspaceElements && (
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
                <span role="img" aria-label={""}>
                  ➖
                </span>
              </button>
              <h3>
                <IRILink
                  label={
                    this.state.id
                      ? getLabelOrBlank(
                          WorkspaceTerms[WorkspaceElements[this.state.id].iri]
                            .labels,
                          this.props.projectLanguage
                        )
                      : ""
                  }
                  iri={WorkspaceElements[this.state.id].iri}
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
                        iri={WorkspaceElements[this.state.id].iri}
                        labels={
                          WorkspaceTerms[WorkspaceElements[this.state.id].iri]
                            .labels
                        }
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
                      <h5>
                        {
                          <IRILink
                            label={
                              Locale[AppSettings.interfaceLanguage]
                                .detailPanelAltLabel
                            }
                            iri={"http://www.w3.org/2004/02/skos/core#altLabel"}
                          />
                        }
                      </h5>
                      <AltLabelTable
                        labels={this.state.inputAltLabels}
                        readOnly={this.state.readOnly}
                        onEdit={(textarea: string, lang: string, i: number) => {
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
                          this.setState({ selectedLabel: res, changes: true });
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
                      <h5>
                        {
                          <IRILink
                            label={
                              Locale[AppSettings.interfaceLanguage]
                                .detailPanelStereotype
                            }
                            iri={"http://www.w3.org/2000/01/rdf-schema#type"}
                          />
                        }
                      </h5>
                      <TableList>
                        <StereotypeOptions
                          readonly={this.state.readOnly}
                          content={true}
                          projectLanguage={this.props.projectLanguage}
                          onChange={(value: string) =>
                            this.updateStereotype(value, true)
                          }
                          value={this.state.inputTypeType}
                        />
                        <StereotypeOptions
                          readonly={this.state.readOnly}
                          content={false}
                          projectLanguage={this.props.projectLanguage}
                          onChange={(value: string) =>
                            this.updateStereotype(value, false)
                          }
                          value={this.state.inputTypeData}
                        />
                      </TableList>
                      {AppSettings.representation ===
                        Representation.COMPACT && (
                        <div>
                          <h5>
                            {
                              Locale[AppSettings.interfaceLanguage]
                                .intrinsicTropes
                            }
                          </h5>
                          <IntrinsicTropeTable
                            iri={WorkspaceElements[this.state.id].iri}
                            tropes={getIntrinsicTropeTypeIDs(this.state.id).map(
                              (id) => WorkspaceElements[id].iri
                            )}
                            onEdit={(id: string) =>
                              this.props.updateDetailPanel(id)
                            }
                            onRemove={(id: string) => {
                              const connections = getIntrinsicTropeTypeIDs(
                                this.state.id,
                                true
                              );
                              for (const conn of connections.filter(
                                (link) =>
                                  WorkspaceLinks[link].target === id ||
                                  WorkspaceLinks[link].source === id
                              )) {
                                this.props.performTransaction(
                                  ...deleteConnections(conn)
                                );
                              }
                              redrawElement(
                                this.state.id,
                                this.props.projectLanguage
                              );
                            }}
                            onAdd={(id: string) => {
                              const link = getNewLink(LinkType.DEFAULT);
                              this.props.performTransaction(
                                ...updateConnection(
                                  this.state.id,
                                  id,
                                  link.id as string,
                                  LinkType.DEFAULT,
                                  parsePrefix("z-sgov-pojem", "má-vlastnost"),
                                  true
                                )
                              );
                              redrawElement(
                                this.state.id,
                                this.props.projectLanguage
                              );
                            }}
                            onCreate={() => {
                              this.props.handleCreation(this.state.id);
                            }}
                            readOnly={this.state.readOnly}
                            projectLanguage={this.props.projectLanguage}
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
                      <LabelTable
                        showCopyIRI={true}
                        labels={
                          WorkspaceVocabularies[
                            getVocabularyFromScheme(
                              WorkspaceTerms[
                                WorkspaceElements[this.state.id].iri
                              ].inScheme
                            )
                          ].labels
                        }
                        iri={getVocabularyFromScheme(
                          WorkspaceTerms[WorkspaceElements[this.state.id].iri]
                            .inScheme
                        )}
                      />
                      {Object.keys(Languages).length > 0 ? (
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
                      ) : (
                        ""
                      )}
                      <DescriptionTabs
                        descriptions={this.state.inputDefinitions}
                        readOnly={this.state.readOnly}
                        onEdit={(
                          event: React.ChangeEvent<HTMLSelectElement>,
                          language: string
                        ) => {
                          let res = this.state.inputDefinitions;
                          res[language] = event.currentTarget.value;
                          this.setState({ inputDefinitions: res });
                        }}
                        onFocusOut={() => {
                          this.setState({ changes: true });
                        }}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      variant={"link"}
                      eventKey={"1"}
                    >
                      {getExpressionByRepresentation({
                        [Representation.FULL]: "links",
                        [Representation.COMPACT]: "relationships",
                      })}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey={"1"}>
                    <Card.Body>
                      <ConnectionList
                        id={this.state.id}
                        projectLanguage={this.props.projectLanguage}
                        update={(id?: string) => this.prepareDetails(id)}
                        performTransaction={this.props.performTransaction}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      variant={"link"}
                      eventKey={"2"}
                    >
                      {Locale[AppSettings.interfaceLanguage].diagramTab}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey={"2"}>
                    <Card.Body>
                      <TableList>
                        {Object.keys(WorkspaceElements[this.state.id].hidden)
                          .filter(
                            (diag) => Diagrams[diag] && Diagrams[diag].active
                          )
                          .map((diag, i) => (
                            <tr key={i}>
                              <td>{Diagrams[diag].name}</td>
                            </tr>
                          ))}
                      </TableList>
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
