import React from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Languages,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import IRILink from "../../../../components/IRILink";
import LabelTable from "../LabelTable";
import AltLabelTable from "../AltLabelTable";
import TableList from "../../../../components/TableList";
import StereotypeOptions from "./StereotypeOptions";
import {
  DetailPanelMode,
  LinkType,
  Representation,
} from "../../../../config/Enum";
import { IntrinsicTropeTable } from "../IntrinsicTropeTable";
import {
  getIntrinsicTropeTypeIDs,
  getNewLink,
  getParentOfIntrinsicTropeType,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import {
  deleteConnections,
  updateConnection,
} from "../../../../function/FunctionLink";
import {
  drawGraphElement,
  redrawElement,
} from "../../../../function/FunctionDraw";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import DescriptionTabs from "../DescriptionTabs";
import { Shapes } from "../../../../config/visual/Shapes";
import { graph } from "../../../../graph/Graph";
import { resizeElem } from "../../../../function/FunctionElem";
import { updateProjectElement } from "../../../../queries/update/UpdateElementQueries";

type Props = {
  id: string;
  performTransaction: (...queries: string[]) => void;
  updateDetailPanel: (mode: DetailPanelMode, id?: string) => void;
  projectLanguage: string;
  handleCreation: Function;
  save: Function;
};

type State = {
  inputTypeType: string;
  inputTypeData: string;
  inputLabels: { [key: string]: string };
  inputAltLabels: { label: string; language: string }[];
  inputDefinitions: { [key: string]: string };
  selectedLabel: { [key: string]: string };
  newAltInput: string;
  readOnly: boolean;
  changes: boolean;
};

export class DetailElementDescriptionCard extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
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
  }

  componentDidMount() {
    this.prepareDetails(this.props.id);
  }

  prepareDetails(id?: string) {
    if (id)
      this.setState({
        selectedLabel: WorkspaceElements[id].selectedLabel,
        inputTypeType:
          WorkspaceTerms[id].types.find(
            (type) => type in Stereotypes && type in Shapes
          ) || "",
        inputTypeData:
          WorkspaceTerms[id].types.find(
            (type) => type in Stereotypes && !(type in Shapes)
          ) || "",
        inputLabels: WorkspaceTerms[id].labels,
        inputAltLabels: WorkspaceTerms[id].altLabels,
        inputDefinitions: WorkspaceTerms[id].definitions,
        newAltInput: "",
        changes: false,
        readOnly:
          WorkspaceVocabularies[
            getVocabularyFromScheme(WorkspaceTerms[id].inScheme)
          ].readOnly,
      });
  }

  componentWillUnmount() {
    this.save();
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

  updateStereotype(newStereotype: string, type: boolean) {
    const otherStereotype = type
      ? this.state.inputTypeData
      : this.state.inputTypeType;
    const stereotypes = WorkspaceTerms[this.props.id].types.filter(
      (stereotype) => !(stereotype in Stereotypes)
    );
    if (newStereotype !== "") stereotypes.push(newStereotype);
    if (otherStereotype !== "")
      type
        ? stereotypes.push(otherStereotype)
        : stereotypes.unshift(otherStereotype);
    WorkspaceTerms[this.props.id].types = stereotypes;
    this.setState({
      changes: true,
    });
    type
      ? this.setState({ inputTypeType: newStereotype })
      : this.setState({ inputTypeData: newStereotype });
  }

  save() {
    const elem = graph.getElements().find((elem) => elem.id === this.props.id);
    if (this.props.id in WorkspaceElements) {
      WorkspaceTerms[this.props.id].altLabels = this.state.inputAltLabels;
      WorkspaceTerms[this.props.id].definitions = this.state.inputDefinitions;
      WorkspaceElements[this.props.id].selectedLabel = this.state.selectedLabel;
      WorkspaceTerms[this.props.id].labels = this.state.inputLabels;
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
        getParentOfIntrinsicTropeType(this.props.id).forEach((id) => {
          const elem = graph.getElements().find((elem) => elem.id === id);
          if (elem)
            drawGraphElement(
              elem,
              this.props.projectLanguage,
              AppSettings.representation
            );
        });
      }
      if (elem) resizeElem(this.props.id);
      this.props.save(this.props.id);
      this.setState({ changes: false });
      this.props.performTransaction(updateProjectElement(true, this.props.id));
    }
  }

  render() {
    return (
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
            {Locale[AppSettings.interfaceLanguage].description}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey={"0"}>
          <Card.Body>
            <h5>
              {
                <IRILink
                  label={
                    Locale[AppSettings.interfaceLanguage].detailPanelPrefLabel
                  }
                  iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}
                />
              }
            </h5>
            <LabelTable
              iri={this.props.id}
              labels={WorkspaceTerms[this.props.id].labels}
              default={this.state.selectedLabel[this.props.projectLanguage]}
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
                    Locale[AppSettings.interfaceLanguage].detailPanelAltLabel
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
                    this.state.selectedLabel[this.props.projectLanguage]
                  ) {
                    resL[this.props.projectLanguage] =
                      WorkspaceTerms[this.props.id].labels[
                        this.props.projectLanguage
                      ];
                  }
                  res.splice(i, 1);
                } else {
                  if (
                    res[i].label ===
                    this.state.selectedLabel[this.props.projectLanguage]
                  ) {
                    resL[this.props.projectLanguage] =
                      lang === this.props.projectLanguage ? textarea : "";
                  }
                  res[i] = { label: textarea, language: lang };
                }
                this.setState({
                  inputAltLabels: res,
                  selectedLabel: resL,
                  changes: true,
                });
              }}
              default={this.state.selectedLabel[this.props.projectLanguage]}
              selectAsDefault={(lang: string, i: number) => {
                let res = this.state.selectedLabel;
                res[this.props.projectLanguage] =
                  this.state.inputAltLabels[i].label;
                this.setState({ selectedLabel: res, changes: true });
              }}
              addAltLabel={(label: string) => {
                if (
                  label !== "" ||
                  this.state.inputAltLabels.find((alt) => alt.label === label)
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
                    Locale[AppSettings.interfaceLanguage].detailPanelStereotype
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
                onChange={(value: string) => this.updateStereotype(value, true)}
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
            {AppSettings.representation === Representation.COMPACT && (
              <div>
                <h5>{Locale[AppSettings.interfaceLanguage].intrinsicTropes}</h5>
                <IntrinsicTropeTable
                  iri={this.props.id}
                  tropes={getIntrinsicTropeTypeIDs(this.props.id)}
                  onEdit={(id: string) =>
                    this.props.updateDetailPanel(DetailPanelMode.TERM, id)
                  }
                  onRemove={(id: string) => {
                    const connections = getIntrinsicTropeTypeIDs(
                      this.props.id,
                      true
                    );
                    for (const conn of connections.filter(
                      (link) =>
                        WorkspaceLinks[link].target === id ||
                        WorkspaceLinks[link].source === id
                    )) {
                      this.props.performTransaction(...deleteConnections(conn));
                    }
                    redrawElement(this.props.id, this.props.projectLanguage);
                  }}
                  onAdd={(id: string) => {
                    const link = getNewLink(LinkType.DEFAULT);
                    this.props.performTransaction(
                      ...updateConnection(
                        this.props.id,
                        id,
                        link.id as string,
                        LinkType.DEFAULT,
                        parsePrefix("z-sgov-pojem", "má-vlastnost"),
                        true
                      )
                    );
                    redrawElement(this.props.id, this.props.projectLanguage);
                  }}
                  onCreate={() => {
                    this.props.handleCreation(this.props.id);
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
                    Locale[AppSettings.interfaceLanguage].detailPanelInScheme
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
                    WorkspaceTerms[this.props.id].inScheme
                  )
                ].labels
              }
              iri={getVocabularyFromScheme(
                WorkspaceTerms[this.props.id].inScheme
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
                    iri={"http://www.w3.org/2004/02/skos/core#definition"}
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
    );
  }
}
