import * as _ from "lodash";
import React from "react";
import { Accordion, Form } from "react-bootstrap";
import { Representation } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import {
  AlternativeLabel,
  AppSettings,
  Stereotypes,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { Shapes } from "../../../../config/visual/Shapes";
import {
  drawGraphElement,
  getSelectedLabels,
} from "../../../../function/FunctionDraw";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import {
  isElementVisible,
  resizeElem,
} from "../../../../function/FunctionElem";
import {
  filterEquivalent,
  getEquivalents,
  isEquivalent,
} from "../../../../function/FunctionEquivalents";
import {
  getParentOfIntrinsicTropeType,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import { graph } from "../../../../graph/Graph";
import { updateProjectElement } from "../../../../queries/update/UpdateElementQueries";
import { IntrinsicTropeControls } from "../IntrinsicTropeControls";
import { DetailPanelAltLabels } from "../description/DetailPanelAltLabels";

type Props = {
  id: string;
  performTransaction: (...queries: string[]) => void;
  selectedLanguage: string;
  save: (id: string) => void;
};

type State = {
  inputTypeType: string;
  inputTypeData: string;
  inputAltLabels: AlternativeLabel[];
  inputDefinitions: { [key: string]: string };
  selectedLabel: { [key: string]: string };
  readOnly: boolean;
  changes: boolean;
  modalTropes: boolean;
  hoveredTrope: number;
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
      inputAltLabels: [],
      inputDefinitions: {},
      selectedLabel: {},
      readOnly: true,
      changes: false,
      modalTropes: false,
      hoveredTrope: -1,
    };
  }

  componentDidMount() {
    this.prepareDetails(this.props.id);
  }

  getName(element: string, language: string): string {
    if (element in Stereotypes) {
      return Stereotypes[element].labels[language];
    } else {
      return WorkspaceTerms[element].labels[language];
    }
  }

  getStereotypes(type: "type" | "data") {
    let input: string = "";
    let stereotypes: string[] = [];
    // object-type, relator-type, trope-type, event-type
    if (type === "type") {
      input = this.state.inputTypeType;
      stereotypes = Object.keys(Stereotypes).filter((stereotype) =>
        // filter for types within representation/view
        isElementVisible([stereotype], AppSettings.representation, true)
      );
    }
    // kind, subkind, mixin...
    if (type === "data") {
      input = this.state.inputTypeData;
      stereotypes = Object.keys(Stereotypes).filter(
        // filter for non-types
        (stereotype) => !filterEquivalent(Object.keys(Shapes), stereotype)
      );
    }
    // filter for uniques
    stereotypes = _.uniqWith(stereotypes, (a, b) => isEquivalent(a, b));
    if (input && !stereotypes.includes(input)) {
      // if there is a input set, filter duplicates
      stereotypes = stereotypes
        .concat(input)
        .filter((s) => s === input || (s !== input && !isEquivalent(s, input)));
    }
    return stereotypes.sort();
  }

  prepareDetails(id?: string) {
    if (id)
      this.setState({
        selectedLabel: getSelectedLabels(id, this.props.selectedLanguage),
        inputTypeType:
          WorkspaceTerms[id].types.find(
            (type) =>
              type in Stereotypes && filterEquivalent(Object.keys(Shapes), type)
          ) || "",
        inputTypeData:
          WorkspaceTerms[id].types.find(
            (type) =>
              type in Stereotypes &&
              !filterEquivalent(Object.keys(Shapes), type)
          ) || "",
        inputAltLabels: WorkspaceTerms[id].altLabels,
        inputDefinitions: WorkspaceTerms[id].definitions,
        changes: false,
        readOnly:
          WorkspaceVocabularies[
            getVocabularyFromScheme(WorkspaceTerms[id].inScheme)
          ].readOnly,
      });
  }

  componentWillUnmount() {
    if (!this.state.readOnly) this.save();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (prevState.changes !== this.state.changes && this.state.changes) {
      this.save();
    }
    if (prevProps.id !== this.props.id && this.props.id) {
      this.prepareDetails(this.props.id);
    }
  }

  updateStereotype(newStereotype: string) {
    const stereotypes = WorkspaceTerms[this.props.id].types.filter(
      (stereotype) => !(stereotype in Stereotypes)
    );
    if (newStereotype !== "") stereotypes.push(newStereotype);
    stereotypes.unshift(this.state.inputTypeType);
    WorkspaceTerms[this.props.id].types = stereotypes;
    this.setState({
      changes: true,
      inputTypeData: newStereotype,
    });
  }

  updateType(newType: string) {
    const stereotypes = WorkspaceTerms[this.props.id].types.filter(
      (stereotype) => !(stereotype in Stereotypes)
    );
    if (newType !== "") stereotypes.push(newType);
    const dataStereotype = this.isObjectType(stereotypes)
      ? this.state.inputTypeData
      : "";
    if (dataStereotype !== "") stereotypes.push(dataStereotype);
    WorkspaceTerms[this.props.id].types = stereotypes;
    this.setState({
      changes: true,
      inputTypeType: newType,
      inputTypeData: dataStereotype,
    });
  }

  isObjectType = (types: string[]) =>
    types.find((t) =>
      isEquivalent(t, parsePrefix("z-sgov-pojem", "typ-objektu"))
    );

  save() {
    const elem = graph.getElements().find((elem) => elem.id === this.props.id);
    if (this.props.id in WorkspaceElements && !this.state.readOnly) {
      WorkspaceTerms[this.props.id].altLabels = this.state.inputAltLabels;
      WorkspaceTerms[this.props.id].definitions = this.state.inputDefinitions;
      WorkspaceElements[this.props.id].selectedLabel = this.state.selectedLabel;
      if (elem) {
        drawGraphElement(
          elem,
          this.props.selectedLanguage,
          AppSettings.representation
        );
      }
      if (
        getEquivalents(parsePrefix("z-sgov-pojem", "typ-vlastnosti")).includes(
          this.state.inputTypeType
        )
      ) {
        getParentOfIntrinsicTropeType(this.props.id).forEach((id) => {
          const elem = graph.getElements().find((elem) => elem.id === id);
          if (elem)
            drawGraphElement(
              elem,
              this.props.selectedLanguage,
              AppSettings.representation
            );
        });
      }
      if (elem && AppSettings.selectedElements.includes(this.props.id))
        resizeElem(this.props.id);
      this.props.save(this.props.id);
      this.setState({ changes: false });
      this.props.performTransaction(updateProjectElement(true, this.props.id));
    } else {
      throw new Error("Attempted write to a read-only term.");
    }
  }

  render() {
    // const tropes = getIntrinsicTropeTypeIDs(this.props.id);
    return (
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          {Locale[AppSettings.interfaceLanguage].description}
        </Accordion.Header>
        <Accordion.Body>
          <h5>{Locale[AppSettings.interfaceLanguage].detailPanelAltLabel}</h5>
          <DetailPanelAltLabels
            altLabels={this.state.inputAltLabels}
            selectedLabel={this.state.selectedLabel}
            language={this.props.selectedLanguage}
            readOnly={this.state.readOnly}
            addAltLabel={(alt: AlternativeLabel) =>
              this.setState((prev) => ({
                ...prev,
                inputAltLabels: [...prev.inputAltLabels, alt],
                changes: true,
              }))
            }
            id={this.props.id}
            selectDisplayLabel={(name, language) =>
              this.setState((prev) => ({
                changes: true,
                selectedLabel: { ...prev.selectedLabel, [language]: name },
              }))
            }
            deleteAltLabel={(alt: AlternativeLabel) => {
              this.setState((prev) => ({
                changes: true,
                inputAltLabels: _.without(prev.inputAltLabels, alt),
                selectedLabel:
                  prev.selectedLabel[this.props.selectedLanguage] === alt.label
                    ? {
                        ...prev.selectedLabel,
                        [this.props.selectedLanguage]:
                          WorkspaceTerms[this.props.id].labels[
                            this.props.selectedLanguage
                          ],
                      }
                    : prev.selectedLabel,
              }));
            }}
          />
          <h5>{Locale[AppSettings.interfaceLanguage].detailPanelStereotype}</h5>
          <Form.Select
            size="sm"
            as="select"
            className="top-item detailInput"
            value={this.state.inputTypeType}
            disabled={this.state.readOnly}
            onChange={(event) => this.updateType(event.target.value)}
          >
            <option key={""} value={""}>
              {this.state.readOnly
                ? Locale[AppSettings.interfaceLanguage].noStereotypeUML
                : Locale[AppSettings.interfaceLanguage].setStereotypeUML}
            </option>
            {this.getStereotypes("type").map((stereotype) => (
              <option key={stereotype} value={stereotype}>
                {this.getName(stereotype, this.props.selectedLanguage)}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            size="sm"
            className="bottom-item detailInput"
            value={this.state.inputTypeData}
            disabled={
              this.state.readOnly ||
              !this.isObjectType(WorkspaceTerms[this.props.id].types)
            }
            onChange={(event) => this.updateStereotype(event.target.value)}
          >
            <option key={""} value={""}>
              {this.state.readOnly
                ? Locale[AppSettings.interfaceLanguage].noStereotypeData
                : Locale[AppSettings.interfaceLanguage].setStereotypeData}
            </option>
            {this.getStereotypes("data").map((stereotype) => (
              <option key={stereotype} value={stereotype}>
                {this.getName(stereotype, this.props.selectedLanguage)}
              </option>
            ))}
          </Form.Select>
          <h5>{Locale[AppSettings.interfaceLanguage].detailPanelDefinition}</h5>
          <Form.Control
            as={"textarea"}
            rows={3}
            size="sm"
            className="detailInput"
            disabled={this.state.readOnly}
            value={this.state.inputDefinitions[this.props.selectedLanguage]}
            onChange={(event) => {
              if (!this.state.readOnly)
                this.setState((prev) => ({
                  ...prev,
                  inputDefinitions: {
                    ...prev.inputDefinitions,
                    [this.props.selectedLanguage]: event.target.value,
                  },
                }));
            }}
            onBlur={() => {
              if (!this.state.readOnly) this.setState({ changes: true });
            }}
          />
          {AppSettings.representation === Representation.COMPACT && (
            <IntrinsicTropeControls
              performTransaction={this.props.performTransaction}
              id={this.props.id}
              readOnly={this.state.readOnly}
              projectLanguage={this.props.selectedLanguage}
              save={this.props.save}
            />
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  }
}
