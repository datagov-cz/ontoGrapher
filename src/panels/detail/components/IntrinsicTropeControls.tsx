import RemoveIcon from "@mui/icons-material/Remove";
import classNames from "classnames";
import React, { useEffect, useState, useCallback } from "react";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../config/Variables";
import {
  getListClassNamesObject,
  redrawElement,
} from "../../../function/FunctionDraw";
import {
  getElementVocabulary,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
  getVocabElementByElementID,
  getVocabularyLabel,
} from "../../../function/FunctionGetVars";
import { deleteLink } from "../../../function/FunctionLink";
import { ModalAddTrope } from "./element/ModalAddTrope";
import { ListItemControls } from "./items/ListItemControls";
import { setLabels } from "../../../function/FunctionGraph";
import { graph } from "../../../graph/Graph";
import { addToSelection } from "../../../function/FunctionDiagram";
import InfoIcon from "@mui/icons-material/Info";
import { VocabularyBadge } from "../../../components/VocabularyBadge";

interface Props {
  performTransaction: (...queries: string[]) => void;
  id: string;
  linkID?: string;
  readOnly: boolean;
  projectLanguage: string;
  save: (id: string) => void;
  infoFunction?: (trope: string) => void;
}

export const IntrinsicTropeControls: React.FC<Props> = (props: Props) => {
  const [tropes, setTropes] = useState<string[]>([]);
  const [hoveredTrope, setHoveredTrope] = useState<number>(-1);
  const [modalTropes, setModalTropes] = useState<boolean>(false);

  const initTropes = useCallback(() => {
    if (props.id in WorkspaceTerms)
      setTropes(getIntrinsicTropeTypeIDs(props.id));
    else setTropes([]);
  }, [props.id]);

  const refresh = () => {
    if (props.linkID) {
      const link = graph.getLinks().find((l) => l.id === props.linkID);
      if (link) {
        setLabels(link);
        addToSelection(props.linkID);
      } else console.error(`Could not find link ${props.linkID} on canvas.`);
    } else redrawElement(props.id, AppSettings.canvasLanguage);
    initTropes();
  };

  useEffect(() => initTropes(), [props.id, initTropes]);

  return (
    <>
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
            {getLabelOrBlank(WorkspaceTerms[iri].labels, props.projectLanguage)}
            &nbsp;
            {WorkspaceElements[iri].vocabulary && (
              <VocabularyBadge
                text={getVocabularyLabel(WorkspaceElements[iri].vocabulary!)}
                cancellable={false}
                color={
                  WorkspaceVocabularies[WorkspaceElements[iri].vocabulary!]
                    .color
                }
                small={true}
              />
            )}
          </span>
          <span
            className={classNames("controls", {
              hovered: i === hoveredTrope,
            })}
          >
            {props.infoFunction && (
              <Button
                className="plainButton"
                variant="light"
                onClick={() => {
                  props.infoFunction!(iri);
                  // refresh();
                }}
              >
                <InfoIcon />
              </Button>
            )}
            {!WorkspaceVocabularies[getElementVocabulary(iri)].readOnly && (
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
                    refresh();
                  }}
                >
                  <RemoveIcon />
                </Button>
              </OverlayTrigger>
            )}
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
        disableAddControl={props.readOnly}
      />
      <ModalAddTrope
        modalTropes={modalTropes}
        hideModal={() => {
          setModalTropes(false);
          refresh();
        }}
        selectedLanguage={props.projectLanguage}
        performTransaction={props.performTransaction}
        update={props.save}
        term={props.id}
      />
    </>
  );
};
