import React, { useRef, useState } from "react";
import { CloseButton } from "react-bootstrap";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { LinkType, Representation } from "../../../config/Enum";
import { Locale } from "../../../config/Locale";
import {
  AppSettings,
  CardinalityPool,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../config/Variables";
import { Cardinality } from "../../../datatypes/Cardinality";
import { getDisplayLabel } from "../../../function/FunctionDraw";
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
import { DetailPanelCardinalities } from "./description/DetailPanelCardinalities";
import { DetailElementDescription } from "./element/DetailElementDescription";
import IRILink from "../../../components/IRILink";

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
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  const prevPropsID = useRef<string>("");

  const save = () => {
    if (props.id && props.id in WorkspaceLinks && !readOnly) {
      const iri = WorkspaceLinks[props.id].iri;
      const queries: string[] = [];
      const link = graph.getLinks().find((link) => link.id === props.id);
      if (!link) {
        console.warn(
          "Link " + props.id + " to be edited couldn't be found on the canvas."
        );
        return;
      }
      if (AppSettings.representation === Representation.FULL) {
        setLabels(link!);
        queries.push(updateTermConnections(props.id));
      }
      if (AppSettings.representation === Representation.COMPACT) {
        const underlyingConnections = getUnderlyingFullConnections(props.id);
        if (!(underlyingConnections && iri in WorkspaceTerms))
          console.error("Error updating compact link.");
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
              <IRILink
                label={getDisplayLabel(
                  WorkspaceLinks[props.id].source,
                  selectedLanguage
                )}
                iri={WorkspaceLinks[props.id].source}
                display={true}
              />
            </i>
            &nbsp;
            <b>
              <IRILink
                label={getLabelOrBlank(
                  getLinkOrVocabElem(WorkspaceLinks[props.id].iri).labels,
                  selectedLanguage
                )}
                iri={WorkspaceLinks[props.id].iri}
                display={true}
              />
            </b>
            &nbsp;
            <i>
              <IRILink
                label={getDisplayLabel(
                  WorkspaceLinks[props.id].target,
                  selectedLanguage
                )}
                iri={WorkspaceLinks[props.id].target}
                display={true}
              />
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
        WorkspaceLinks[props.id].type === LinkType.DEFAULT &&
        props.id && (
          <DetailElementDescription
            id={WorkspaceLinks[props.id].iri}
            performTransaction={props.performTransaction}
            selectedLanguage={selectedLanguage}
            save={save}
          />
        )}
    </>
  );
};
