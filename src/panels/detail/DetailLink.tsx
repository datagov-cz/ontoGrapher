import React from "react";
import { LanguageSelector } from "../../components/LanguageSelector";
import { LinkType, Representation } from "../../config/Enum";
import { Locale } from "../../config/Locale";
import {
  AlternativeLabel,
  AppSettings,
  CardinalityPool,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Cardinality } from "../../datatypes/Cardinality";
import { getDisplayLabel } from "../../function/FunctionDraw";
import { initLanguageObject } from "../../function/FunctionEditVars";
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
import { DetailPanelAltLabels } from "./components/description/DetailPanelAltLabels";
import { DetailPanelCardinalities } from "./components/description/DetailPanelCardinalities";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
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
  selectedLanguage: string;
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
      selectedLanguage: AppSettings.canvasLanguage,
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
                  {getDisplayLabel(
                    WorkspaceLinks[this.props.id].source,
                    this.state.selectedLanguage
                  )}
                </i>
                &nbsp;
                <b>
                  {getLabelOrBlank(
                    getLinkOrVocabElem(WorkspaceLinks[this.props.id].iri)
                      .labels,
                    this.state.selectedLanguage
                  )}
                </b>
                &nbsp;
                <i>
                  {getDisplayLabel(
                    WorkspaceLinks[this.props.id].target,
                    this.state.selectedLanguage
                  )}
                </i>
              </span>
            </div>
          </div>
          <h5>{Locale[AppSettings.interfaceLanguage].cardinalities}</h5>
          <DetailPanelCardinalities
            linkID={this.props.id}
            selectedLanguage={this.state.selectedLanguage}
            readOnly={this.state.readOnly}
            sourceCardinality={this.state.sourceCardinality}
            targetCardinality={this.state.targetCardinality}
            setSourceCardinality={(c) => {
              this.setState({
                sourceCardinality: c,
                changes: true,
              });
            }}
            setTargetCardinality={(c) => {
              this.setState({
                targetCardinality: c,
                changes: true,
              });
            }}
          />
          {AppSettings.representation === Representation.COMPACT &&
            WorkspaceLinks[this.props.id].type === LinkType.DEFAULT && (
              <div>
                <h5>
                  {Locale[AppSettings.interfaceLanguage].detailPanelAltLabel}
                </h5>
                <DetailPanelAltLabels
                  altLabels={this.state.inputAltLabels}
                  selectedLabel={this.state.selectedLabel}
                  language={this.state.selectedLanguage}
                  readOnly={this.state.readOnly}
                  addAltLabel={(alt: AlternativeLabel) =>
                    this.setState((prev) => ({
                      ...prev,
                      inputAltLabels: [...prev.inputAltLabels, alt],
                      changes: true,
                    }))
                  }
                  id={WorkspaceLinks[this.props.id].iri}
                  selectDisplayLabel={(name, language) =>
                    this.setState((prev) => ({
                      changes: true,
                      selectedLabel: {
                        ...prev.selectedLabel,
                        [language]: name,
                      },
                    }))
                  }
                />
              </div>
            )}
        </div>
      </div>
    );
  }
}
