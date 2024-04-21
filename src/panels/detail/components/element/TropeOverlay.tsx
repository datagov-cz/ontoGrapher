import classNames from "classnames";
import _ from "lodash";
import { useStoreState } from "pullstate";
import { useEffect, useState } from "react";
import { CloseButton, Form } from "react-bootstrap";
import { LanguageSelector } from "../../../../components/LanguageSelector";
import { Representation } from "../../../../config/Enum";
import { LanguageObject } from "../../../../config/Languages";
import { Locale, LocaleDatatypes } from "../../../../config/Locale";
import { StoreSettings } from "../../../../config/Store";
import {
  AlternativeLabel,
  AppSettings,
  CardinalityPool,
  TropeDatatypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { Cardinality } from "../../../../datatypes/Cardinality";
import {
  getDisplayLabel,
  getSelectedLabels,
} from "../../../../function/FunctionDraw";
import { initLanguageObject } from "../../../../function/FunctionEditVars";
import {
  getConnectionAndParentOfIntrinsicTropeType,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import { updateProjectElement } from "../../../../queries/update/UpdateElementQueries";
import { updateProjectLink } from "../../../../queries/update/UpdateLinkQueries";
import { DetailPanelAltLabels } from "../description/DetailPanelAltLabels";
import { DetailPanelCardinalities } from "../description/DetailPanelCardinalities";

interface Props {
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  save: (id: string) => void;
}

export const TropeOverlay: React.FC<Props> = (props: Props) => {
  const tropeIRI: string = useStoreState(StoreSettings, (s) => s.tropeOverlay);
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
  const { connection, parent } =
    getConnectionAndParentOfIntrinsicTropeType(tropeIRI);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    props.projectLanguage
  );
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [datatype, setDatatype] = useState<string>("");

  // TODO:
  // alts, def, desc, src (prepare)
  useEffect(() => {
    if (!!!tropeIRI || !(tropeIRI in WorkspaceTerms)) return;
    setReadOnly(
      WorkspaceVocabularies[
        getVocabularyFromScheme(WorkspaceTerms[tropeIRI].inScheme)
      ].readOnly
    );
    const sourceCardinality = CardinalityPool.findIndex(
      (card) =>
        card.getString() ===
        WorkspaceLinks[connection].sourceCardinality.getString()
    );
    const targetCardinality = CardinalityPool.findIndex(
      (card) =>
        card.getString() ===
        WorkspaceLinks[connection].targetCardinality.getString()
    );
    setSourceCardinality(
      sourceCardinality === -1 ? "0" : sourceCardinality.toString(10)
    );
    setTargetCardinality(
      targetCardinality === -1 ? "0" : targetCardinality.toString(10)
    );
    setSelectedLabel(getSelectedLabels(tropeIRI, selectedLanguage));
    if (tropeIRI in TropeDatatypes) setDatatype(TropeDatatypes[tropeIRI]);
    setInputDefinitions(WorkspaceTerms[tropeIRI].definitions);
    setInputDescriptions(WorkspaceTerms[tropeIRI].descriptions);
    setInputSource(WorkspaceTerms[tropeIRI].source);
  }, [tropeIRI, connection, selectedLanguage]);

  const save = () => {
    if (connection && connection in WorkspaceLinks) {
      const queries: string[] = [];
      if (AppSettings.representation === Representation.COMPACT) {
        WorkspaceTerms[tropeIRI].altLabels = inputAltLabels;
        WorkspaceTerms[tropeIRI].definitions = inputDefinitions;
        WorkspaceTerms[tropeIRI].descriptions = inputDescriptions;
        WorkspaceTerms[tropeIRI].source = inputSource;
        WorkspaceElements[tropeIRI].selectedLabel = selectedLabel;
        TropeDatatypes[tropeIRI] = datatype;
        queries.push(updateProjectElement(true, tropeIRI));
        queries.push(updateProjectLink(true, connection));
        props.save(connection);
        props.performTransaction(...queries);
      } else
        console.error(
          "Attempted to save trope's connection in overlay when in Full mode."
        );
    } else console.error("Could not find link ID " + connection + ".");
  };

  const prepareCardinality = (cardinality: string): Cardinality =>
    CardinalityPool[parseInt(cardinality, 10)] || new Cardinality("", "");

  return (
    <div className={classNames("overlay", { visible: !!tropeIRI })}>
      {tropeIRI in WorkspaceTerms && connection in WorkspaceLinks && parent && (
        <>
          <div className={"detailTitle"}>
            <CloseButton
              className="closeButton"
              onClick={() =>
                StoreSettings.update((s) => {
                  s.tropeOverlay = "";
                })
              }
            />
            <span className="languageSelect">
              <LanguageSelector
                language={selectedLanguage}
                setLanguage={(lang: string) => setSelectedLanguage(lang)}
              />
            </span>
            <span className="title link">
              {
                <i>
                  {getDisplayLabel(
                    WorkspaceLinks[connection].source === parent
                      ? parent
                      : tropeIRI,
                    selectedLanguage
                  )}
                </i>
              }
              &nbsp;
              <b>
                {getLabelOrBlank(
                  getLinkOrVocabElem(WorkspaceLinks[connection].iri).labels,
                  selectedLanguage
                )}
              </b>
              &nbsp;
              <i>
                {getDisplayLabel(
                  WorkspaceLinks[connection].source === parent
                    ? tropeIRI
                    : parent,
                  selectedLanguage
                )}
              </i>
            </span>
          </div>
          <h5>{Locale[AppSettings.interfaceLanguage].cardinalities}</h5>
          <DetailPanelCardinalities
            linkID={connection}
            selectedLanguage={selectedLanguage}
            readOnly={readOnly}
            sourceCardinality={sourceCardinality}
            targetCardinality={targetCardinality}
            setSourceCardinality={(c) => {
              setSourceCardinality(c);
              WorkspaceLinks[connection].sourceCardinality =
                prepareCardinality(c);
              save();
            }}
            setTargetCardinality={(c) => {
              setTargetCardinality(c);
              WorkspaceLinks[connection].targetCardinality =
                prepareCardinality(c);
              save();
            }}
          />
          <h5>{Locale[AppSettings.interfaceLanguage].datatype}</h5>
          <Form.Select
            size="sm"
            as="select"
            className="detailInput"
            value={datatype}
            disabled={readOnly}
            onChange={(event) => {
              TropeDatatypes[tropeIRI] = datatype;
              setDatatype(event.target.value);
              save();
            }}
          >
            <option key={""} value={""}>
              {readOnly
                ? Locale[AppSettings.interfaceLanguage].noDatatype
                : Locale[AppSettings.interfaceLanguage].setDatatype}
            </option>
            {Object.entries(LocaleDatatypes[AppSettings.interfaceLanguage]).map(
              ([iri, label]) => (
                <option key={iri} value={iri}>
                  {label}
                </option>
              )
            )}
          </Form.Select>
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
              WorkspaceTerms[tropeIRI].altLabels = newAL;
              save();
            }}
            id={tropeIRI}
            selectDisplayLabel={(name, language) => {
              const newSL = {
                ...selectedLabel,
                [language]: name,
              };
              WorkspaceElements[tropeIRI].selectedLabel = newSL;
              setSelectedLabel(newSL);
              save();
            }}
            deleteAltLabel={(alt: AlternativeLabel) => {
              if (selectedLabel[selectedLanguage] === alt.label) {
                const newSL = {
                  ...selectedLabel,
                  [selectedLanguage]:
                    WorkspaceTerms[tropeIRI].labels[selectedLanguage],
                };
                WorkspaceElements[tropeIRI].selectedLabel = newSL;
                setSelectedLabel(newSL);
              }
              const newAL = _.without(inputAltLabels, alt);
              setInputAltLabels(newAL);
              WorkspaceTerms[tropeIRI].altLabels = newAL;
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
        </>
      )}
    </div>
  );
};
