import RemoveIcon from "@mui/icons-material/Remove";
import classNames from "classnames";
import React from "react";
import {
  Accordion,
  Button,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Locale } from "../../../../config/Locale";
import { RepresentationConfig } from "../../../../config/logic/RepresentationConfig";
import {
  AlternativeLabel,
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
  getSelectedLabels,
  redrawElement,
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
import { DetailPanelAltLabels } from "../description/DetailPanelAltLabels";
import { ListItemControls } from "../items/ListItemControls";
import { ModalAddTrope } from "./ModalAddTrope";

type Props = {
  id: string;
  performTransaction: (...queries: string[]) => void;
  selectedLanguage: string;
  handleCreation: Function;
  save: Function;
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

  prepareDetails(id?: string) {
    if (id)
      this.setState({
        selectedLabel: getSelectedLabels(id, this.props.selectedLanguage),
        inputTypeType:
          WorkspaceTerms[id].types.find(
            (type) => type in Stereotypes && type in Shapes
          ) || "",
        inputTypeData:
          WorkspaceTerms[id].types.find(
            (type) => type in Stereotypes && !(type in Shapes)
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
    types.includes(parsePrefix("z-sgov-pojem", "typ-objektu"));

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
        this.state.inputTypeType ===
        parsePrefix("z-sgov-pojem", "typ-vlastnosti")
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
      if (elem) resizeElem(this.props.id);
      this.props.save(this.props.id);
      this.setState({ changes: false });
      this.props.performTransaction(updateProjectElement(true, this.props.id));
    } else {
      throw new Error("Attempted write to a read-only term.");
    }
  }

  render() {
    const tropes = getIntrinsicTropeTypeIDs(this.props.id);

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
          />
          <h5>{Locale[AppSettings.interfaceLanguage].detailPanelStereotype}</h5>
          <Form.Select
            size="sm"
            as="select"
            className="top-item detailInput"
            value={this.state.inputTypeType}
            disabled={this.state.readOnly}
            onChange={(event) => this.updateType(event.currentTarget.value)}
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
                  {getName(stereotype, this.props.selectedLanguage)}
                </option>
              ))}
          </Form.Select>
          <Form.Select
            size="sm"
            className="bottom-item detailInput"
            value={this.state.inputTypeType}
            disabled={
              this.state.readOnly ||
              !this.isObjectType(WorkspaceTerms[this.props.id].types)
            }
            onChange={(event) =>
              this.updateStereotype(event.currentTarget.value)
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
                  {getName(stereotype, this.props.selectedLanguage)}
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
          <h5>{Locale[AppSettings.interfaceLanguage].intrinsicTropes}</h5>
          {tropes.map((iri, i) => (
            <div
              key={iri}
              onMouseEnter={() => this.setState({ hoveredTrope: i })}
              onMouseLeave={() => this.setState({ hoveredTrope: -1 })}
              className={classNames(
                "detailInput",
                "form-control",
                "form-control-sm",
                getListClassNamesObject(tropes, i)
              )}
            >
              <span>
                {getLabelOrBlank(
                  WorkspaceTerms[iri].labels,
                  this.props.selectedLanguage
                )}
              </span>
              <span
                className={classNames("controls", {
                  hovered: i === this.state.hoveredTrope,
                })}
              >
                <OverlayTrigger
                  placement="left"
                  delay={1000}
                  overlay={
                    <Tooltip>
                      {Locale[AppSettings.interfaceLanguage].removeTrope}
                    </Tooltip>
                  }
                >
                  <Button
                    className="plainButton"
                    variant="light"
                    onClick={() => {
                      for (const l of Object.keys(WorkspaceLinks)) {
                        if (
                          (WorkspaceLinks[l].source === iri ||
                            WorkspaceLinks[l].target === iri) &&
                          WorkspaceLinks[l].active
                        )
                          this.props.performTransaction(
                            ...deleteConnections(l)
                          );
                      }
                      redrawElement(this.props.id, AppSettings.canvasLanguage);
                    }}
                  >
                    <RemoveIcon />
                  </Button>
                </OverlayTrigger>
              </span>
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
            popover={false}
            tooltipText={Locale[AppSettings.interfaceLanguage].assignTrope}
            disableAddControl={this.state.readOnly}
          />
        </Accordion.Body>
        <ModalAddTrope
          modalTropes={this.state.modalTropes}
          hideModal={() => this.setState({ modalTropes: false })}
          selectedLanguage={this.props.selectedLanguage}
          performTransaction={this.props.performTransaction}
          update={this.props.save}
          id={this.props.id}
        />
      </Accordion.Item>
    );
  }
}
