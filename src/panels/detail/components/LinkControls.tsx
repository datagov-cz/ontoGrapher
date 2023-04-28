import React, { useRef, useState } from "react";
import { CloseButton } from "react-bootstrap";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { LinkType, Representation } from "../../../config/Enum";
import { LanguageObject } from "../../../config/Languages";
import { Locale } from "../../../config/Locale";
import {
  AlternativeLabel,
  AppSettings,
  CardinalityPool,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../config/Variables";
import { Cardinality } from "../../../datatypes/Cardinality";
import {
  getDisplayLabel,
  getSelectedLabels,
} from "../../../function/FunctionDraw";
import { initLanguageObject } from "../../../function/FunctionEditVars";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getUnderlyingFullConnections,
  getVocabularyFromScheme,
} from "../../../function/FunctionGetVars";
import { setLabels } from "../../../function/FunctionGraph";
import { setFullLinksCardinalitiesFromCompactLink } from "../../../function/FunctionLink";
import { graph } from "../../../graph/Graph";
import { updateTermConnections } from "../../../queries/update/UpdateConnectionQueries";
import { updateProjectElement } from "../../../queries/update/UpdateElementQueries";
import { updateProjectLink } from "../../../queries/update/UpdateLinkQueries";
import { DetailPanelAltLabels } from "./description/DetailPanelAltLabels";
import { DetailPanelCardinalities } from "./description/DetailPanelCardinalities";

interface Props {
  id: string;
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  close?: () => void;
}

export const LinkControls: React.FC<Props> = (props: Props) => {
  const [sourceCardinality, setSourceCardinality] = useState<string>("0");
  const [targetCardinality, setTargetCardinality] = useState<string>("0");
  const [inputAltLabels, setInputAltLabels] = useState<AlternativeLabel[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<LanguageObject>(
    initLanguageObject("")
  );
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  const prevPropsID = useRef<string>("");

  const save = () => {
    if (props.id && props.id in WorkspaceLinks) {
      const iri = WorkspaceLinks[props.id].iri;
      const queries: string[] = [];
      const link = graph.getLinks().find((link) => link.id === props.id);
      if (link) {
        setLabels(link, getLinkOrVocabElem(iri).labels[props.projectLanguage]);
      }
      if (AppSettings.representation === Representation.FULL)
        queries.push(updateTermConnections(props.id));
      else {
        const link = graph.getLinks().find((link) => link.id === props.id);
        if (link) {
          if (iri in WorkspaceTerms) {
            setLabels(
              link,
              WorkspaceElements[iri].selectedLabel[props.projectLanguage]
            );
            queries.push(updateProjectElement(true, iri));
          }
          const underlyingConnections = getUnderlyingFullConnections(props.id);
          if (underlyingConnections) {
            setFullLinksCardinalitiesFromCompactLink(
              props.id,
              underlyingConnections.src,
              underlyingConnections.tgt
            );
            queries.push(
              updateProjectLink(
                true,
                underlyingConnections.src,
                underlyingConnections.tgt
              ),
              updateTermConnections(
                underlyingConnections.src,
                underlyingConnections.tgt
              )
            );
          }
          if (!(link && underlyingConnections && iri in WorkspaceTerms))
            console.error("Error updating compact link.");
        }
      }
      queries.push(updateProjectLink(true, props.id));
      props.save(props.id);
      props.performTransaction(...queries);
    }
  };

  const isReadOnly = (id: string): boolean => {
    const iri =
      id in WorkspaceElements
        ? WorkspaceLinks[id].iri
        : WorkspaceLinks[id].source;
    return WorkspaceVocabularies[
      getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)
    ].readOnly;
  };

  if (
    props.id &&
    props.id in WorkspaceLinks &&
    prevPropsID.current !== props.id
  ) {
    prevPropsID.current = props.id;
    const iri = WorkspaceLinks[props.id].iri;
    const sourceCardinality = CardinalityPool.findIndex(
      (card) =>
        card.getString() ===
        WorkspaceLinks[props.id].sourceCardinality.getString()
    );
    const targetCardinality = CardinalityPool.findIndex(
      (card) =>
        card.getString() ===
        WorkspaceLinks[props.id].targetCardinality.getString()
    );
    setSourceCardinality(
      sourceCardinality === -1 ? "0" : sourceCardinality.toString(10)
    );
    setTargetCardinality(
      targetCardinality === -1 ? "0" : targetCardinality.toString(10)
    );
    setInputAltLabels(
      iri in WorkspaceTerms ? WorkspaceTerms[iri].altLabels : []
    );
    setSelectedLabel(
      iri in WorkspaceElements
        ? getSelectedLabels(iri, AppSettings.canvasLanguage)
        : initLanguageObject("")
    );
    setReadOnly(isReadOnly(props.id));
  }

  const prepareCardinality = (cardinality: string): Cardinality =>
    CardinalityPool[parseInt(cardinality, 10)] || new Cardinality("", "");

  return (
    <>
      <div className={"detailTitle"}>
        <div className="top">
          {props.close && (
            <CloseButton
              className="closeButton"
              onClick={() => props.close!()}
            />
          )}
          <span className="languageSelect">
            <LanguageSelector
              language={selectedLanguage}
              setLanguage={(lang: string) => setSelectedLanguage(lang)}
            />
          </span>
          <span className="title link">
            <i>
              {getDisplayLabel(
                WorkspaceLinks[props.id].source,
                selectedLanguage
              )}
            </i>
            &nbsp;
            <b>
              {getLabelOrBlank(
                getLinkOrVocabElem(WorkspaceLinks[props.id].iri).labels,
                selectedLanguage
              )}
            </b>
            &nbsp;
            <i>
              {getDisplayLabel(
                WorkspaceLinks[props.id].target,
                selectedLanguage
              )}
            </i>
          </span>
        </div>
      </div>
      <h5>{Locale[AppSettings.interfaceLanguage].cardinalities}</h5>
      <DetailPanelCardinalities
        linkID={props.id}
        selectedLanguage={selectedLanguage}
        readOnly={readOnly}
        sourceCardinality={sourceCardinality}
        targetCardinality={targetCardinality}
        setSourceCardinality={(c) => {
          setSourceCardinality(c);
          WorkspaceLinks[props.id].sourceCardinality = prepareCardinality(c);
          save();
        }}
        setTargetCardinality={(c) => {
          setTargetCardinality(c);
          WorkspaceLinks[props.id].targetCardinality = prepareCardinality(c);
          save();
        }}
      />
      {AppSettings.representation === Representation.COMPACT &&
        WorkspaceLinks[props.id].type === LinkType.DEFAULT && (
          <div>
            <h5>{Locale[AppSettings.interfaceLanguage].detailPanelAltLabel}</h5>
            <DetailPanelAltLabels
              altLabels={inputAltLabels}
              selectedLabel={selectedLabel}
              language={selectedLanguage}
              readOnly={readOnly}
              addAltLabel={(alt: AlternativeLabel) => {
                const newAL = [...inputAltLabels, alt];
                setInputAltLabels(newAL);
                WorkspaceTerms[WorkspaceLinks[props.id].iri].altLabels = newAL;
                save();
              }}
              id={WorkspaceLinks[props.id].iri}
              selectDisplayLabel={(name, language) => {
                const newSL = {
                  ...selectedLabel,
                  [language]: name,
                };
                setSelectedLabel(newSL);
                WorkspaceElements[WorkspaceLinks[props.id].iri].selectedLabel =
                  newSL;
                save();
              }}
            />
          </div>
        )}
    </>
  );
};
