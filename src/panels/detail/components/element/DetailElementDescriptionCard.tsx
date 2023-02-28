import LabelIcon from "@mui/icons-material/Label";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import classNames from "classnames";
import * as _ from "lodash";
import React from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import { DetailPanelMode } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import { RepresentationConfig } from "../../../../config/logic/RepresentationConfig";
import {
  AppSettings,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { Shapes } from "../../../../config/visual/Shapes";
import {
  drawGraphElement,
  getListClassNamesObject,
} from "../../../../function/FunctionDraw";
import { getName, parsePrefix } from "../../../../function/FunctionEditVars";
import { resizeElem } from "../../../../function/FunctionElem";
import {
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
  getParentOfIntrinsicTropeType,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import { deleteConnections } from "../../../../function/FunctionLink";
import { graph } from "../../../../graph/Graph";
import { updateProjectElement } from "../../../../queries/update/UpdateElementQueries";
import { ListItemControls } from "../ListItemControls";
import { ModalAddTrope } from "./ModalAddTrope";

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
  inputAltLabels: typeof WorkspaceTerms[keyof typeof WorkspaceTerms]["altLabels"];
  inputDefinitions: { [key: string]: string };
  selectedLabel: { [key: string]: string };
  readOnly: boolean;
  changes: boolean;
  modalTropes: boolean;
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
      readOnly: true,
      changes: false,
      modalTropes: false,
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

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
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

    const tropes = getIntrinsicTropeTypeIDs(this.props.id);

    return (
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          {Locale[AppSettings.interfaceLanguage].description}
        </Accordion.Header>
        <Accordion.Body>
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
                    { label: label, language: this.props.projectLanguage },
                  ],
                  changes: true,
                }));
              }
            }}
            removeAction={() =>
              this.setState((prev) => ({
                ...prev,
                inputAltLabels: _.dropRight(prev.inputAltLabels, 1),
              }))
            }
            popover={true}
            tooltipText={""}
          />
          <h5>Typy</h5>
          <Form.Select
            size="sm"
            as="select"
            className="top-item detailInput"
            value={this.state.inputTypeType}
            disabled={this.state.readOnly}
            onChange={(event) =>
              this.updateStereotype(event.currentTarget.value, true)
            }
          >
            <option key={""} value={""}>
              {this.state.readOnly
                ? Locale[AppSettings.interfaceLanguage].noStereotypeUML
                : Locale[AppSettings.interfaceLanguage].setStereotypeUML}
            </option>
            {Object.keys(Stereotypes)
              .filter((stereotype) =>
                RepresentationConfig[
                  AppSettings.representation
                ].visibleStereotypes.includes(stereotype)
              )
              .map((stereotype) => (
                <option key={stereotype} value={stereotype}>
                  {getName(stereotype, this.props.projectLanguage)}
                </option>
              ))}
          </Form.Select>
          <Form.Select
            size="sm"
            className="bottom-item detailInput"
            value={this.state.inputTypeType}
            disabled={this.state.readOnly}
            onChange={(event) =>
              this.updateStereotype(event.currentTarget.value, false)
            }
          >
            <option key={""} value={""}>
              {this.state.readOnly
                ? Locale[AppSettings.interfaceLanguage].noStereotypeData
                : Locale[AppSettings.interfaceLanguage].setStereotypeData}
            </option>
            {Object.keys(Stereotypes)
              .filter((stereotype) => !(stereotype in Shapes))
              .map((stereotype) => (
                <option key={stereotype} value={stereotype}>
                  {getName(stereotype, this.props.projectLanguage)}
                </option>
              ))}
          </Form.Select>
          <h5>Definice</h5>
          <Form.Control
            as={"textarea"}
            rows={3}
            size="sm"
            className="detailInput"
            disabled={this.state.readOnly}
            value={this.state.inputDefinitions[this.props.projectLanguage]}
            onChange={(event) => {
              if (!this.state.readOnly)
                this.setState((prev) => ({
                  ...prev,
                  inputDefinitions: {
                    ...prev.inputDefinitions,
                    [this.props.projectLanguage]: event.currentTarget.value,
                  },
                  changes: true,
                }));
            }}
            onBlur={() => {
              if (!this.state.readOnly) this.setState({ changes: true });
            }}
          />
          <h5>Vlastnosti</h5>
          {tropes.map((iri, i) => (
            <div
              className={classNames(
                "detailInput",
                "form-control",
                "form-control-sm",
                getListClassNamesObject(tropes, i)
              )}
            >
              {getLabelOrBlank(
                WorkspaceTerms[iri].labels,
                this.props.projectLanguage
              )}
            </div>
          ))}
          {tropes.length === 0 && (
            <Form.Control
              className="detailInput noInput"
              disabled
              value=""
              size="sm"
            />
          )}
          <ListItemControls
            addAction={() => this.setState({ modalTropes: true })}
            removeAction={() => {
              const queries = [];
              const id = _.last(tropes);
              const connections = getIntrinsicTropeTypeIDs(this.props.id, true);
              for (const conn of connections.filter(
                (link) =>
                  WorkspaceLinks[link].target === id ||
                  WorkspaceLinks[link].source === id
              )) {
                queries.push(...deleteConnections(conn));
              }
              this.props.performTransaction(...queries);
            }}
            popover={false}
            tooltipText={""}
          />
        </Accordion.Body>
        <ModalAddTrope
          modalTropes={this.state.modalTropes}
          hideModal={() => this.setState({ modalTropes: false })}
          selectedLanguage={this.props.projectLanguage}
          performTransaction={this.props.performTransaction}
          update={this.props.save}
          id={this.props.id}
        />
      </Accordion.Item>
    );
  }
}
