import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import IRILink from "../../components/IRILink";
import { LanguageSelector } from "../../components/LanguageSelector";
import { DetailPanelMode } from "../../config/Enum";
import { AppSettings } from "../../config/Variables";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
} from "../../function/FunctionGetVars";
import { DetailElementDescriptionCard } from "./components/element/DetailElementDescriptionCard";
import { DetailElementDiagramCard } from "./components/element/DetailElementDiagramCard";
import { DetailElementLinksCard } from "./components/element/DetailElementLinksCard";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
  handleCreation: Function;
  updateDetailPanel: (mode: DetailPanelMode, id?: string) => void;
  id: string;
}

export const DetailElement: React.FC<Props> = (props: Props) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  return (
    <div className={"accordions"}>
      <div className={"detailTitle"}>
        <div className="top">
          <span className="languageSelect">
            <LanguageSelector
              language={selectedLanguage}
              setLanguage={setSelectedLanguage}
            />
          </span>
          <span className="title">
            <IRILink
              label={getLabelOrBlank(
                getLinkOrVocabElem(props.id).labels,
                selectedLanguage
              )}
              iri={props.id}
            />
          </span>
        </div>
        <p>{getLinkOrVocabElem(props.id).definitions[selectedLanguage]}</p>
      </div>
      <Accordion defaultActiveKey={"0"}>
        <DetailElementDescriptionCard
          id={props.id}
          projectLanguage={selectedLanguage}
          performTransaction={props.performTransaction}
          handleCreation={props.handleCreation}
          save={props.save}
          updateDetailPanel={props.updateDetailPanel}
        />
        <DetailElementLinksCard
          id={props.id}
          projectLanguage={props.projectLanguage}
          performTransaction={props.performTransaction}
        />
        <DetailElementDiagramCard id={props.id} />
      </Accordion>
    </div>
  );
};
