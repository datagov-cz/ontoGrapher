import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { CloseButton, Form } from "react-bootstrap";
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
import { IntrinsicTropeControls } from "./IntrinsicTropeControls";
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
  const [inputDefinitions, setInputDefinitions] = useState<LanguageObject>({});
  const [inputDescriptions, setInputDescriptions] = useState<LanguageObject>(
    {}
  );
  const [selectedLabel, setSelectedLabel] = useState<LanguageObject>(
    initLanguageObject("")
  );
  const [inputSource, setInputSource] = useState<string>("");
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  useEffect(() => {
    return () => {
      if (!readOnly) save();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevPropsID = useRef<string>("");

  const save = () => {
    if (props.id && props.id in WorkspaceLinks) {
      const iri = WorkspaceLinks[props.id].iri;
      const queries: string[] = [];
      const link = graph.getLinks().find((link) => link.id === props.id);
      if (!link)
        console.error(
          "Link " + props.id + " to be edited couldn't be found on the canvas."
        );
      if (AppSettings.representation === Representation.FULL) {
        setLabels(link!);
        queries.push(updateTermConnections(props.id));
      }
      if (AppSettings.representation === Representation.COMPACT) {
        const underlyingConnections = getUnderlyingFullConnections(props.id);
        if (!(underlyingConnections && iri in WorkspaceTerms))
          console.error("Error updating compact link.");
        WorkspaceTerms[iri].altLabels = inputAltLabels;
        WorkspaceTerms[iri].definitions = inputDefinitions;
        WorkspaceTerms[iri].descriptions = inputDescriptions;
        WorkspaceTerms[iri].source = inputSource;
        WorkspaceElements[iri].selectedLabel = selectedLabel;
        setLabels(link!);
        queries.push(updateProjectElement(true, iri));
        setFullLinksCardinalitiesFromCompactLink(
          props.id,
          underlyingConnections!.src,
          underlyingConnections!.tgt
        );
        queries.push(
          updateProjectLink(
            true,
            underlyingConnections!.src,
            underlyingConnections!.tgt
          ),
          updateTermConnections(
            underlyingConnections!.src,
            underlyingConnections!.tgt
          )
        );
        queries.push(updateProjectLink(true, props.id));
        props.save(props.id);
        props.performTransaction(...queries);
      }
    } else console.error("Could not find link ID " + props.id + ".");
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
    setInputDefinitions(
      iri in WorkspaceElements
        ? WorkspaceTerms[iri].definitions
        : initLanguageObject("")
    );
    setInputDescriptions(
      iri in WorkspaceElements
        ? WorkspaceTerms[iri].descriptions
        : initLanguageObject("")
    );
    setInputSource(iri in WorkspaceElements ? WorkspaceTerms[iri].source : "");
    setReadOnly(isReadOnly(props.id));
  }

  const prepareCardinality = (cardinality: string): Cardinality =>
    CardinalityPool[parseInt(cardinality, 10)] || new Cardinality("", "");

  return (
    <>
      <div className={"detailTitle"}>
        {props.close && (
          <CloseButton className="closeButton" onClick={() => props.close!()} />
        )}
        <span className="languageSelect">
          <LanguageSelector
            language={selectedLanguage}
            setLanguage={(lang: string) => setSelectedLanguage(lang)}
          />
        </span>
        <span className="title link">
          <i>
            {getDisplayLabel(WorkspaceLinks[props.id].source, selectedLanguage)}
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
            {getDisplayLabel(WorkspaceLinks[props.id].target, selectedLanguage)}
          </i>
        </span>
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
          <>
            <h5>{Locale[AppSettings.interfaceLanguage].source}</h5>
            <Form.Control
              size="sm"
              className="detailInput"
              value={inputSource}
              disabled={readOnly}
              onChange={(event) => setInputSource(event.target.value)}
              onBlur={() => {
                if (!readOnly) save();
              }}
            />
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
                WorkspaceElements[WorkspaceLinks[props.id].iri].selectedLabel =
                  newSL;
                setSelectedLabel(newSL);
                save();
              }}
              deleteAltLabel={(alt: AlternativeLabel) => {
                if (selectedLabel[selectedLanguage] === alt.label) {
                  const newSL = {
                    ...selectedLabel,
                    [selectedLanguage]:
                      WorkspaceTerms[WorkspaceLinks[props.id].iri].labels[
                        selectedLanguage
                      ],
                  };
                  WorkspaceElements[
                    WorkspaceLinks[props.id].iri
                  ].selectedLabel = newSL;
                  setSelectedLabel(newSL);
                }
                const newAL = _.without(inputAltLabels, alt);
                setInputAltLabels(newAL);
                WorkspaceTerms[WorkspaceLinks[props.id].iri].altLabels = newAL;
                save();
              }}
            />
            <h5>
              {Locale[AppSettings.interfaceLanguage].detailPanelDefinition}
            </h5>
            <Form.Control
              as={"textarea"}
              rows={3}
              size="sm"
              className="detailInput"
              disabled={readOnly}
              value={inputDefinitions[selectedLanguage]}
              onChange={(event) => {
                if (!readOnly)
                  setInputDefinitions((prev) => ({
                    ...prev,
                    [selectedLanguage]: event.target.value,
                  }));
              }}
              onBlur={() => {
                if (!readOnly) save();
              }}
            />
            <h5>{Locale[AppSettings.interfaceLanguage].description}</h5>
            <Form.Control
              as={"textarea"}
              rows={3}
              size="sm"
              className="detailInput"
              disabled={readOnly}
              value={inputDescriptions[selectedLanguage]}
              onChange={(event) => {
                if (!readOnly)
                  setInputDescriptions((prev) => ({
                    ...prev,
                    [selectedLanguage]: event.target.value,
                  }));
              }}
              onBlur={() => {
                if (!readOnly) save();
              }}
            />
            {WorkspaceLinks[props.id].iri in WorkspaceTerms && (
              <IntrinsicTropeControls
                performTransaction={props.performTransaction}
                id={WorkspaceLinks[props.id].iri}
                readOnly={readOnly}
                projectLanguage={props.projectLanguage}
                save={props.save}
                linkID={props.id}
              />
            )}
          </>
        )}
    </>
  );
};
