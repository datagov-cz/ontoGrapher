import classNames from "classnames";
import React, { useState } from "react";
import { CloseButton } from "react-bootstrap";
import IRILink from "../../../../components/IRILink";
import { LanguageSelector } from "../../../../components/LanguageSelector";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { drawGraphElement } from "../../../../function/FunctionDraw";
import { resizeElem } from "../../../../function/FunctionElem";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getParentOfIntrinsicTropeType,
} from "../../../../function/FunctionGetVars";
import { graph } from "../../../../graph/Graph";
import { DetailElementDescription } from "./DetailElementDescription";

interface Props {
  projectLanguage: string;
  id: string;
  performTransaction: (...queries: string[]) => void;
  visible: boolean;
  close: () => void;
  save: (id: string) => void;
}

export const TropeOverlay: React.FC<Props> = (props: Props) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  const save = () => {
    if (props.id && props.id in WorkspaceTerms) {
      getParentOfIntrinsicTropeType(props.id).forEach((id) => {
        const elem = graph.getElements().find((elem) => elem.id === id);
        if (elem) {
          drawGraphElement(elem, selectedLanguage, AppSettings.representation);
          resizeElem(id);
        }
      });
      props.save(props.id);
    }
  };

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
          <DetailElementDescription
            id={props.id}
            performTransaction={props.performTransaction}
            selectedLanguage={selectedLanguage}
            save={save}
          />
          <br />
        </>
      )}
    </div>
  );
};
