import React, { useRef, useState } from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Button,
  CloseButton,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
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
  getListClassNamesObject,
  getSelectedLabels,
  redrawElement,
} from "../../../function/FunctionDraw";
import { initLanguageObject } from "../../../function/FunctionEditVars";
import {
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getUnderlyingFullConnections,
  getVocabularyFromScheme,
} from "../../../function/FunctionGetVars";
import { setLabels } from "../../../function/FunctionGraph";
import {
  deleteLink,
  setFullLinksCardinalitiesFromCompactLink,
} from "../../../function/FunctionLink";
import { graph } from "../../../graph/Graph";
import { updateTermConnections } from "../../../queries/update/UpdateConnectionQueries";
import { updateProjectElement } from "../../../queries/update/UpdateElementQueries";
import { updateProjectLink } from "../../../queries/update/UpdateLinkQueries";
import { DetailPanelAltLabels } from "./description/DetailPanelAltLabels";
import { DetailPanelCardinalities } from "./description/DetailPanelCardinalities";
import _ from "lodash";
import classNames from "classnames";
import { ListItemControls } from "./items/ListItemControls";
import { ModalAddTrope } from "./element/ModalAddTrope";

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
  const [tropes, setTropes] = useState<string[]>([]);
  const [hoveredTrope, setHoveredTrope] = useState<number>(-1);
  const [modalTropes, setModalTropes] = useState<boolean>(false);

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
    debugger;
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
    if (
      AppSettings.representation === Representation.COMPACT &&
      LinkType.DEFAULT === WorkspaceLinks[props.id].type
    )
      setTropes(getIntrinsicTropeTypeIDs(iri));
    else setTropes([]);
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
          <>
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
            <h5>{Locale[AppSettings.interfaceLanguage].intrinsicTropes}</h5>
            {tropes.map((iri, i) => (
              <div
                key={iri}
                onMouseEnter={() => setHoveredTrope(i)}
                onMouseLeave={() => setHoveredTrope(-1)}
                className={classNames(
                  "detailInput",
                  "form-control",
                  "form-control-sm",
                  getListClassNamesObject(tropes, i)
                )}
              >
                <span>
                  {getLabelOrBlank(
                    WorkspaceTerms[iri].labels,
                    props.projectLanguage
                  )}
                </span>
                <span
                  className={classNames("controls", {
                    hovered: i === hoveredTrope,
                  })}
                >
                  <OverlayTrigger
                    placement="left"
                    delay={1000}
                    overlay={
                      <Tooltip>
                        {Locale[AppSettings.interfaceLanguage].removeTrope}
                      </Tooltip>
                    }
                  >
                    <Button
                      className="plainButton"
                      variant="light"
                      onClick={() => {
                        for (const l of Object.keys(WorkspaceLinks)) {
                          if (
                            (WorkspaceLinks[l].source === iri ||
                              WorkspaceLinks[l].target === iri) &&
                            WorkspaceLinks[l].active
                          )
                            props.performTransaction(...deleteLink(l));
                        }
                        redrawElement(props.id, AppSettings.canvasLanguage);
                      }}
                    >
                      <RemoveIcon />
                    </Button>
                  </OverlayTrigger>
                </span>
              </div>
            ))}
            {tropes.length === 0 && (
              <Form.Control
                className="detailInput noInput"
                disabled
                value=""
                size="sm"
              />
            )}
            <ListItemControls
              addAction={() => setModalTropes(true)}
              popover={false}
              tooltipText={Locale[AppSettings.interfaceLanguage].assignTrope}
              disableAddControl={readOnly}
            />
          </>
        )}
      {AppSettings.representation === Representation.COMPACT && (
        <ModalAddTrope
          modalTropes={modalTropes}
          hideModal={() => setModalTropes(false)}
          selectedLanguage={props.projectLanguage}
          performTransaction={props.performTransaction}
          update={props.save}
          term={WorkspaceLinks[props.id].iri}
        />
      )}
    </>
  );
};
