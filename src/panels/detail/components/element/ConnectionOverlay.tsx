import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { CloseButton } from "react-bootstrap";
import { LanguageSelector } from "../../../../components/LanguageSelector";
import {
  CardinalityPool,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { Cardinality } from "../../../../datatypes/Cardinality";
import { getDisplayLabel } from "../../../../function/FunctionDraw";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getUnderlyingFullConnections,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import { setFullLinksCardinalitiesFromCompactLink } from "../../../../function/FunctionLink";
import { graph } from "../../../../graph/Graph";
import { updateConnections } from "../../../../queries/update/UpdateConnectionQueries";
import { updateProjectLink } from "../../../../queries/update/UpdateLinkQueries";
import { DetailPanelCardinalities } from "../description/DetailPanelCardinalities";

interface Props {
  selectedLanguage: string;
  linkID: string;
  performTransaction: (...queries: string[]) => void;
  visible: boolean;
  close: Function;
  save: Function;
}

export const ConnectionOverlay: React.FC<Props> = (props: Props) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    props.selectedLanguage
  );
  const [sourceCardinality, setSourceCardinality] = useState<string>("0");
  const [targetCardinality, setTargetCardinality] = useState<string>("0");
  const [changes, setChanges] = useState<boolean>(false);
  const [readOnly, setReadOnly] = useState<boolean>(false);

  const prepareCardinality: (cardinality: string) => Cardinality = (
    cardinality
  ) => CardinalityPool[parseInt(cardinality, 10)] || new Cardinality("", "");

  const isReadOnly = (id: string) => {
    const iri =
      id in WorkspaceElements
        ? WorkspaceLinks[id].iri
        : WorkspaceLinks[id].source;
    return WorkspaceVocabularies[
      getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)
    ].readOnly;
  };

  useEffect(() => {
    if (props.linkID in WorkspaceLinks) {
      const sourceCardinality = CardinalityPool.findIndex(
        (card) =>
          card.getString() ===
          WorkspaceLinks[props.linkID].sourceCardinality.getString()
      );
      const targetCardinality = CardinalityPool.findIndex(
        (card) =>
          card.getString() ===
          WorkspaceLinks[props.linkID].targetCardinality.getString()
      );
      setSourceCardinality(
        sourceCardinality === -1 ? "0" : sourceCardinality.toString(10)
      );
      setTargetCardinality(
        targetCardinality === -1 ? "0" : targetCardinality.toString(10)
      );
      setReadOnly(isReadOnly(props.linkID));
    }
  }, [props.linkID]);

  useEffect(() => {
    if (changes && props.linkID in WorkspaceLinks) {
      const queries: string[] = [];
      const sc = prepareCardinality(sourceCardinality);
      const tc = prepareCardinality(targetCardinality);
      WorkspaceLinks[props.linkID].sourceCardinality = sc;
      WorkspaceLinks[props.linkID].targetCardinality = tc;

      const link = graph.getLinks().find((link) => link.id === props.linkID);
      if (link) {
        const underlyingConnections = getUnderlyingFullConnections(
          props.linkID
        );
        if (underlyingConnections) {
          setFullLinksCardinalitiesFromCompactLink(
            props.linkID,
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
      queries.push(updateProjectLink(true, props.linkID));
      props.save(props.linkID);
      props.performTransaction(...queries);
    } else if (changes && !(props.linkID in WorkspaceLinks)) {
      throw new Error(
        "Attempted to apply cardinalities to ID " +
          props.linkID +
          ", which is not a recognized link."
      );
    }
    setChanges(false);
  }, [changes, props, sourceCardinality, targetCardinality]);

  return (
    <div className={classNames("overlay", { visible: props.visible })}>
      <div className={"detailTitle"}>
        <div className="top">
          <CloseButton className="closeButton" onClick={() => props.close()} />
          <span className="languageSelect">
            <LanguageSelector
              language={selectedLanguage}
              setLanguage={setSelectedLanguage}
            />
          </span>
          {props.linkID in WorkspaceLinks && (
            <span className="title link">
              <i>
                {getDisplayLabel(
                  WorkspaceLinks[props.linkID].source,
                  selectedLanguage
                )}
              </i>
              &nbsp;
              <b>
                {getLabelOrBlank(
                  getLinkOrVocabElem(WorkspaceLinks[props.linkID].iri).labels,
                  selectedLanguage
                )}
              </b>
              &nbsp;
              <i>
                {getDisplayLabel(
                  WorkspaceLinks[props.linkID].target,
                  selectedLanguage
                )}
              </i>
            </span>
          )}
        </div>
        <h6>Kardinality</h6>
        <DetailPanelCardinalities
          linkID={props.linkID}
          selectedLanguage={selectedLanguage}
          readOnly={readOnly}
          sourceCardinality={sourceCardinality}
          targetCardinality={sourceCardinality}
          setSourceCardinality={(c) => {
            setSourceCardinality(c);
            setChanges(true);
          }}
          setTargetCardinality={(c) => {
            setTargetCardinality(c);
            setChanges(true);
          }}
        />
      </div>
    </div>
  );
};
