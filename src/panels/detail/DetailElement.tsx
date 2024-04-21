import classNames from "classnames";
import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import IRILink from "../../components/IRILink";
import { LanguageSelector } from "../../components/LanguageSelector";
import { AppSettings } from "../../config/Variables";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
} from "../../function/FunctionGetVars";
import ConnectionOverlay from "./components/element/ConnectionOverlay";
import { DetailElementDescriptionCard } from "./components/element/DetailElementDescriptionCard";
import { DetailElementDiagramCard } from "./components/element/DetailElementDiagramCard";
import { DetailElementLinksCard } from "./components/element/DetailElementLinksCard";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  error: boolean;
  id: string;
  freeze: boolean;
}

export const DetailElement: React.FC<Props> = (props: Props) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    AppSettings.canvasLanguage
  );

  const [connectionOverlay, setConnectionOverlay] = useState<boolean>(false);
  const [linkID, setLinkID] = useState<string>("");

  return (
    <div className="detailElement">
      <div className={classNames("accordions", { blur: connectionOverlay })}>
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
        </div>
        <Accordion defaultActiveKey={"0"}>
          <DetailElementDescriptionCard
            id={props.id}
            selectedLanguage={selectedLanguage}
            performTransaction={props.performTransaction}
            save={props.save}
          />
          <DetailElementLinksCard
            freeze={props.freeze}
            id={props.id}
            projectLanguage={props.projectLanguage}
            performTransaction={props.performTransaction}
            infoFunction={(link: string) => {
              setLinkID(link);
              setConnectionOverlay(true);
            }}
          />
          <DetailElementDiagramCard id={props.id} />
        </Accordion>
      </div>
      <ConnectionOverlay
        projectLanguage={selectedLanguage}
        id={linkID}
        performTransaction={props.performTransaction}
        visible={connectionOverlay}
        close={() => setConnectionOverlay(false)}
        save={props.save}
      />
    </div>
  );
};
