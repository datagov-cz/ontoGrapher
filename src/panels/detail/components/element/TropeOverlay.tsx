import classNames from "classnames";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { CloseButton, Form } from "react-bootstrap";
import IRILink from "../../../../components/IRILink";
import { LanguageSelector } from "../../../../components/LanguageSelector";
import { LanguageObject } from "../../../../config/Languages";
import { Locale } from "../../../../config/Locale";
import {
  AlternativeLabel,
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import {
  drawGraphElement,
  getDisplayLabel,
  getSelectedLabels,
} from "../../../../function/FunctionDraw";
import { initLanguageObject } from "../../../../function/FunctionEditVars";
import { resizeElem } from "../../../../function/FunctionElem";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getParentOfIntrinsicTropeType,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import { graph } from "../../../../graph/Graph";
import { updateProjectElement } from "../../../../queries/update/UpdateElementQueries";
import { DetailPanelAltLabels } from "../description/DetailPanelAltLabels";

interface Props {
  projectLanguage: string;
  id: string;
  performTransaction: (...queries: string[]) => void;
  visible: boolean;
  close: () => void;
  save: (id: string) => void;
}

export const TropeOverlay: React.FC<Props> = (props: Props) => {
  const [inputAltLabels, setInputAltLabels] = useState<AlternativeLabel[]>([]);
  const [inputDefinitions, setInputDefinitions] = useState<LanguageObject>(
    initLanguageObject("")
  );
  const [selectedLabel, setSelectedLabel] = useState<LanguageObject>(
    initLanguageObject("")
  );
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  const prevPropsID = useRef<string>("");

  useEffect(() => {
    if (props.id && props.id in WorkspaceTerms && !readOnly) {
      WorkspaceElements[props.id].selectedLabel = selectedLabel;
      getParentOfIntrinsicTropeType(props.id).forEach((id) => {
        const elem = graph.getElements().find((elem) => elem.id === id);
        if (elem) {
          console.log(getDisplayLabel(props.id, AppSettings.canvasLanguage));
          drawGraphElement(elem, selectedLanguage, AppSettings.representation);
          resizeElem(id);
        }
      });
    }
  }, [props.id, readOnly, selectedLabel, selectedLanguage]);

  const save = () => {
    if (props.id && props.id in WorkspaceTerms && !readOnly) {
      WorkspaceTerms[props.id].altLabels = inputAltLabels;
      WorkspaceTerms[props.id].definitions = inputDefinitions;
      props.save(props.id);
      props.performTransaction(updateProjectElement(true, props.id));
    }
  };

  if (
    props.id &&
    props.id in WorkspaceTerms &&
    prevPropsID.current !== props.id
  ) {
    prevPropsID.current = props.id;
    setInputDefinitions(
      props.id in WorkspaceTerms
        ? WorkspaceTerms[props.id].definitions
        : initLanguageObject("")
    );
    setInputAltLabels(
      props.id in WorkspaceTerms ? WorkspaceTerms[props.id].altLabels : []
    );
    setSelectedLabel(
      props.id in WorkspaceElements
        ? getSelectedLabels(props.id, AppSettings.canvasLanguage)
        : initLanguageObject("")
    );
    setReadOnly(
      WorkspaceVocabularies[
        getVocabularyFromScheme(WorkspaceTerms[props.id].inScheme)
      ].readOnly
    );
  }

  return (
    <div className={classNames("overlay", { visible: props.visible })}>
      {props.id in WorkspaceElements && (
        <>
          <div className={"detailTitle"}>
            <div className="top">
              <CloseButton
                className="closeButton"
                onClick={() => {
                  save();
                  props.close();
                }}
              />
              <span className="languageSelect">
                <LanguageSelector
                  language={selectedLanguage}
                  setLanguage={(lang: string) => setSelectedLanguage(lang)}
                />
              </span>
              <span className="title link">
                <IRILink
                  label={getLabelOrBlank(
                    getLinkOrVocabElem(props.id).labels,
                    selectedLanguage
                  )}
                  iri={props.id}
                />
              </span>
            </div>
          </div>
          <br />
          <h5>{Locale[AppSettings.interfaceLanguage].detailPanelAltLabel}</h5>
          <DetailPanelAltLabels
            altLabels={inputAltLabels}
            selectedLabel={selectedLabel}
            language={selectedLanguage}
            readOnly={readOnly}
            addAltLabel={(alt: AlternativeLabel) => {
              const newAL = [...inputAltLabels, alt];
              setInputAltLabels(newAL);
              WorkspaceTerms[props.id].altLabels = newAL;
              save();
            }}
            id={props.id}
            selectDisplayLabel={(name, language) => {
              console.log(name, language);
              setSelectedLabel((prev) => ({
                ...prev,
                [language]: name,
              }));
              save();
            }}
            deleteAltLabel={(alt: AlternativeLabel) => {
              if (selectedLabel[selectedLanguage] === alt.label) {
                setSelectedLabel((prev) => ({
                  ...prev,
                  [selectedLanguage]:
                    WorkspaceTerms[props.id].labels[selectedLanguage],
                }));
              }
              const newAL = _.without(inputAltLabels, alt);
              setInputAltLabels(newAL);
              WorkspaceTerms[props.id].altLabels = newAL;
              save();
            }}
          />
          <h5>{Locale[AppSettings.interfaceLanguage].detailPanelDefinition}</h5>
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
            onBlur={(event) => {
              if (!readOnly)
                setInputDefinitions((prev) => ({
                  ...prev,
                  [selectedLanguage]: event.target.value,
                }));
              save();
            }}
          />
          <br />
        </>
      )}
    </div>
  );
};
